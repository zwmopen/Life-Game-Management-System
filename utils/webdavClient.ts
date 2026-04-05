export interface WebDAVConfig {
  url: string;
  username: string;
  password: string;
  basePath?: string;
}

export interface WebDAVFile {
  name: string;
  size: number;
  mtime: Date;
  isDirectory: boolean;
  url: string;
}

export class WebDAVClient {
  private config: WebDAVConfig;

  constructor(config: WebDAVConfig) {
    this.config = {
      ...config,
      basePath: config.basePath || '/',
    };
  }

  private getAuthHeader(): string {
    const { username, password } = this.config;
    return `Basic ${btoa(`${username}:${password}`)}`;
  }

  private buildUrl(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    const baseUrl = new URL(this.config.url);
    const pathParts: string[] = [];

    if (baseUrl.pathname && baseUrl.pathname !== '/') {
      pathParts.push(baseUrl.pathname.replace(/^\/+|\/+$/g, ''));
    }

    const normalizedPath = path.replace(/^\/+/, '');
    if (normalizedPath) {
      pathParts.push(normalizedPath);
    }

    return new URL(`${baseUrl.origin}/${pathParts.join('/')}`).href;
  }

  private isElectronRuntime(): boolean {
    return typeof window !== 'undefined' && typeof window.lifeGameElectron?.webdavRequest === 'function';
  }

  private getProxyUrl(): string {
    if (typeof window === 'undefined' || !window.location) {
      throw new Error('WebDAV代理不可用：当前环境缺少浏览器窗口对象');
    }

    if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
      return new URL('/webdav', window.location.origin).href;
    }

    throw new Error('当前运行环境缺少可用的 WebDAV 代理');
  }

  private throwStatusError(status: number, statusText: string, targetUrl: string): never {
    if (status === 401) {
      throw new Error('备份失败：认证失败，请检查用户名和密码。');
    }

    if (status === 403) {
      if (targetUrl.includes('jianguoyun.com')) {
        throw new Error('备份失败：坚果云权限不足，请确认使用的是应用密码，并检查备份目录路径。');
      }

      throw new Error('备份失败：权限不足，请检查账户权限。');
    }

    if (status === 404) {
      throw new Error('备份失败：指定路径不存在，请检查服务器地址和目录路径。');
    }

    if (status === 405) {
      throw new Error('备份失败：WebDAV 服务器不允许当前方法。');
    }

    if (status === 429) {
      throw new Error('备份失败：请求过于频繁，请稍后再试。');
    }

    if (status >= 500) {
      throw new Error('备份失败：服务器内部错误，请稍后再试。');
    }

    throw new Error(`备份失败：${status} ${statusText}`);
  }

  private async normalizeBody(body?: BodyInit): Promise<string> {
    if (!body) {
      return '';
    }

    if (typeof body === 'string') {
      return body;
    }

    if (body instanceof Blob) {
      return await body.text();
    }

    return String(body);
  }

  private buildRequestHeaders(
    method: string,
    targetUrl: string,
    body?: BodyInit,
    headers?: Record<string, string>
  ): Record<string, string> {
    const requestHeaders: Record<string, string> = {
      'X-Target-Url': targetUrl,
      Authorization: this.getAuthHeader(),
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      ...headers,
    };

    if (body) {
      if (method === 'PUT') {
        requestHeaders['Content-Type'] = 'application/json';
        if (typeof body === 'string') {
          requestHeaders['Content-Length'] = String(body.length);
        } else if (body instanceof Blob) {
          requestHeaders['Content-Length'] = String(body.size);
        }

        if (targetUrl.includes('jianguoyun.com')) {
          requestHeaders.Expect = '100-continue';
          requestHeaders['Content-Transfer-Encoding'] = 'binary';
        }
      } else if (method === 'PROPFIND') {
        requestHeaders['Content-Type'] = 'application/xml';
      } else {
        requestHeaders['Content-Type'] = 'application/octet-stream';
      }
    }

    if (method === 'PROPFIND' && !headers?.Depth) {
      requestHeaders.Depth = '1';
    }

    if (targetUrl.includes('jianguoyun.com')) {
      requestHeaders.Accept = '*/*';
      requestHeaders['Accept-Encoding'] = 'gzip, deflate, br';
      requestHeaders.Connection = 'keep-alive';
      requestHeaders['Cache-Control'] = 'no-cache';
      requestHeaders.Pragma = 'no-cache';
      requestHeaders['X-Requested-With'] = 'XMLHttpRequest';
    }

    return requestHeaders;
  }

  private buildElectronResponse(
    response: {
      status: number;
      statusText: string;
      headers: Record<string, string>;
      body: string;
    }
  ): Response {
    const noBodyStatuses = new Set([101, 103, 204, 205, 304]);
    const responseBody = noBodyStatuses.has(response.status) ? null : response.body;

    return new Response(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  }

  private async request(
    method: string,
    path: string,
    body?: BodyInit,
    headers?: Record<string, string>
  ): Promise<Response> {
    const targetUrl = this.buildUrl(path);

    try {
      const requestHeaders = this.buildRequestHeaders(method, targetUrl, body, headers);
      const normalizedBody = await this.normalizeBody(body);

      console.log('发送 WebDAV 请求:', {
        method,
        url: this.isElectronRuntime() ? 'electron-main-proxy' : this.getProxyUrl(),
        targetUrl,
        headers: Object.fromEntries(
          Object.entries(requestHeaders).map(([key, value]) =>
            key === 'Authorization' ? [key, '***'] : [key, value]
          )
        ),
        body: body ? `[${typeof body}]` : 'null',
      });

      if (this.isElectronRuntime()) {
        const electronResponse = await window.lifeGameElectron!.webdavRequest({
          targetUrl,
          method,
          headers: requestHeaders,
          body: normalizedBody,
        });

        console.log('WebDAV 响应:', {
          status: electronResponse.status,
          statusText: electronResponse.statusText,
          headers: electronResponse.headers,
        });

        if (electronResponse.status < 200 || electronResponse.status >= 300) {
          this.throwStatusError(electronResponse.status, electronResponse.statusText, targetUrl);
        }

        return this.buildElectronResponse(electronResponse);
      }

      const response = await fetch(this.getProxyUrl(), {
        method,
        headers: requestHeaders,
        body,
        credentials: 'omit',
        mode: 'cors',
        cache: 'no-cache',
        redirect: 'follow',
      });

      console.log('WebDAV 响应:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (!response.ok) {
        this.throwStatusError(response.status, response.statusText, targetUrl);
      }

      return response;
    } catch (error) {
      console.error('WebDAV request failed:', error);

      if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('network'))) {
        if (targetUrl.includes('jianguoyun.com')) {
          throw new Error('备份失败：无法连接到坚果云服务器，请检查网络和 WebDAV 地址。');
        }

        throw new Error('备份失败：网络连接异常，请检查服务器地址和网络状态。');
      }

      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        if (targetUrl.includes('jianguoyun.com')) {
          throw new Error('备份失败：无法连接到坚果云服务器，请检查 WebDAV 地址和网络状态。');
        }

        throw new Error('备份失败：无法连接到 WebDAV 服务器，请检查配置。');
      }

      throw error;
    }
  }

  async listFiles(path: string = ''): Promise<WebDAVFile[]> {
    try {
      const response = await this.request('PROPFIND', path, undefined, {
        Depth: '1',
      });

      const xmlText = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlText, 'application/xml');
      const responseElements = doc.getElementsByTagName('d:response');
      const files: WebDAVFile[] = [];

      for (let i = 0; i < responseElements.length; i += 1) {
        const responseElement = responseElements[i];
        const href = responseElement.getElementsByTagName('d:href')[0]?.textContent || '';
        const isDirectory = href.endsWith('/');

        if (href === `${path}/` || href === `${path}/../`) {
          continue;
        }

        const name = href.split('/').filter(Boolean).pop() || '';
        const sizeElement = responseElement.getElementsByTagName('d:getcontentlength')[0];
        const mtimeElement = responseElement.getElementsByTagName('d:getlastmodified')[0];

        files.push({
          name,
          size: sizeElement ? parseInt(sizeElement.textContent || '0', 10) : 0,
          mtime: mtimeElement ? new Date(mtimeElement.textContent || '') : new Date(),
          isDirectory,
          url: href,
        });
      }

      return files;
    } catch (error) {
      console.error('Failed to list files:', error);
      throw error;
    }
  }

  async createDirectory(path: string): Promise<void> {
    try {
      await this.request('MKCOL', path);
    } catch (error) {
      console.error(`Failed to create directory ${path}:`, error);
      throw error;
    }
  }

  async ensureDirectoryExists(path: string): Promise<void> {
    if (!path || path === '/') {
      return;
    }

    const pathParts = path.split('/').filter(Boolean);
    let currentPath = '';

    for (const part of pathParts) {
      currentPath += `/${part}`;
      try {
        await this.createDirectory(currentPath);
      } catch {
        console.log(`Directory ${currentPath} may already exist, continue.`);
      }
    }
  }

  async uploadFile(path: string, content: string | Blob): Promise<void> {
    try {
      await this.request('PUT', path, content);
    } catch (error) {
      console.error(`Failed to upload file ${path}:`, error);
      throw error;
    }
  }

  async downloadFile(path: string): Promise<string> {
    try {
      const response = await this.request('GET', path);
      return await response.text();
    } catch (error) {
      console.error(`Failed to download file ${path}:`, error);
      throw error;
    }
  }

  async deleteFile(path: string): Promise<void> {
    try {
      await this.request('DELETE', path);
    } catch (error) {
      console.error(`Failed to delete file ${path}:`, error);
      throw error;
    }
  }

  async getFileInfo(path: string): Promise<WebDAVFile | null> {
    try {
      const files = await this.listFiles(path.substring(0, path.lastIndexOf('/')));
      const fileName = path.split('/').pop() || '';
      return files.find(file => file.name === fileName) || null;
    } catch (error) {
      console.error(`Failed to get file info for ${path}:`, error);
      return null;
    }
  }

  async testConnection(): Promise<void> {
    try {
      await this.listFiles('/');
    } catch (error) {
      console.error('Failed to test connection:', error);
      throw error;
    }
  }
}

export default WebDAVClient;
