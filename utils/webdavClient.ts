/**
 * WebDAV客户端工具类
 * 用于处理与WebDAV服务器的交互，包括文件上传、下载、列表查询等操作
 */

/**
 * WebDAV配置接口
 */
export interface WebDAVConfig {
  /** WebDAV服务器URL */
  url: string;
  /** 用户名 */
  username: string;
  /** 密码 */
  password: string;
  /** 基础路径，默认为根目录 */
  basePath?: string;
}

/**
 * WebDAV文件信息接口
 */
export interface WebDAVFile {
  /** 文件名 */
  name: string;
  /** 文件大小（字节） */
  size: number;
  /** 最后修改时间 */
  mtime: Date;
  /** 是否为目录 */
  isDirectory: boolean;
  /** 文件URL */
  url: string;
}

/**
 * WebDAV客户端类
 */
export class WebDAVClient {
  /** WebDAV配置 */
  private config: WebDAVConfig;

  /**
   * 构造函数
   * @param config WebDAV配置信息
   */
  constructor(config: WebDAVConfig) {
    this.config = {
      ...config,
      basePath: config.basePath || '/',
    };
  }

  /**
   * 生成Basic认证头
   * @returns 格式化的Basic认证字符串
   */
  private getAuthHeader(): string {
    const { username, password } = this.config;
    // 使用简单直接的方式生成Basic认证头
    // 这是坚果云WebDAV服务推荐的方式
    return `Basic ${btoa(`${username}:${password}`)}`;
  }

  /**
   * 构建完整的WebDAV URL
   * @param path 文件路径
   * @returns 完整的WebDAV文件URL
   */
  private buildUrl(path: string): string {
    // 构建完整的目标URL
    // 如果路径已经是完整的URL，直接返回
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    // 先解析基础URL
    const baseUrl = new URL(this.config.url);
    
    // 构建路径部分
    let pathParts = [];
    
    // 添加基础URL中的路径部分
    if (baseUrl.pathname && baseUrl.pathname !== '/') {
      pathParts.push(baseUrl.pathname.replace(/^\/|\/$/g, ''));
    }
    
    // 添加完整的文件路径（包括目录）
    // 移除路径开头的斜杠，但保留目录结构
    const normalizedPath = path.replace(/^\//, '');
    if (normalizedPath) {
      pathParts.push(normalizedPath);
    }
    
    // 构建完整路径
    const fullPath = '/' + pathParts.join('/');
    
    // 创建新的URL对象
    const finalUrl = new URL(baseUrl.origin + fullPath);
    
    return finalUrl.href;
  }

  /**
   * 发送WebDAV请求
   * @param method HTTP方法
   * @param path 文件路径
   * @param body 请求体
   * @param headers 额外的请求头
   * @returns Response对象
   */
  private async request(
    method: string,
    path: string,
    body?: BodyInit,
    headers?: Record<string, string>
  ): Promise<Response> {
    // 构建完整的目标URL
    const targetUrl = this.buildUrl(path);
    
    try {
      // 构建代理请求的URL（使用项目内置的代理服务器）
      const proxyUrl = new URL('/webdav', window.location.origin);
      
      // 构建请求头
      const requestHeaders: Record<string, string> = {
        'X-Target-Url': targetUrl, // 告诉代理服务器真实的目标URL
        'Authorization': this.getAuthHeader(),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        ...headers,
      };
      
      // 根据请求方法设置适当的内容类型和头信息
      if (body) {
        if (method === 'PUT') {
          // 上传文件时使用JSON类型，因为我们上传的是JSON格式的备份数据
          requestHeaders['Content-Type'] = 'application/json';
          // 添加文件大小信息
          if (typeof body === 'string') {
            requestHeaders['Content-Length'] = body.length.toString();
          } else if (body instanceof Blob) {
            requestHeaders['Content-Length'] = body.size.toString();
          }
          // 添加坚果云特定的头信息
          if (targetUrl.includes('jianguoyun.com')) {
            requestHeaders['Expect'] = '100-continue';
            requestHeaders['Content-Transfer-Encoding'] = 'binary';
          }
        } else if (method === 'PROPFIND') {
          // PROPFIND请求需要特定的Content-Type
          requestHeaders['Content-Type'] = 'application/xml';
        } else {
          requestHeaders['Content-Type'] = 'application/octet-stream';
        }
      }
      
      // 添加PROPFIND请求所需的Depth头
      if (method === 'PROPFIND' && !headers?.Depth) {
        requestHeaders['Depth'] = '1';
      }
      
      // 坚果云特定配置
      if (targetUrl.includes('jianguoyun.com')) {
        // 坚果云需要额外的头信息
        requestHeaders['Accept'] = '*/*';
        requestHeaders['Accept-Encoding'] = 'gzip, deflate, br';
        requestHeaders['Connection'] = 'keep-alive';
        requestHeaders['Cache-Control'] = 'no-cache';
        requestHeaders['Pragma'] = 'no-cache';
        requestHeaders['X-Requested-With'] = 'XMLHttpRequest';
      }
      
      console.log('发送WebDAV请求:', {
        method,
        url: proxyUrl.href,
        targetUrl: targetUrl,
        headers: Object.fromEntries(
          Object.entries(requestHeaders).map(([key, value]) => 
            key === 'Authorization' ? [key, '***'] : [key, value]
          )
        ),
        body: body ? `[${typeof body}]` : 'null'
      });
      
      // 通过代理服务器发送请求
      const response = await fetch(proxyUrl.href, {
        method,
        headers: requestHeaders,
        body,
        credentials: 'omit', // 不发送cookies，避免不必要的安全问题
        mode: 'cors',
        cache: 'no-cache',
        redirect: 'follow',
      });

      console.log('WebDAV请求响应:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      // 处理特定的状态码
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('备份失败：认证失败。请检查用户名和密码是否正确。');
        } else if (response.status === 403) {
          if (targetUrl.includes('jianguoyun.com')) {
            throw new Error('备份失败：权限不足。请在坚果云中创建应用并获取应用密码：\n1. 登录坚果云 → 账户信息 → 安全选项\n2. 添加应用，名称如"人生游戏管理系统"\n3. 生成应用密码并复制\n4. 在设置中使用该应用密码\n5. 备份目录路径填写: /人生游戏管理系统');
          }
          throw new Error('备份失败：权限不足。请检查账户权限。');
        } else if (response.status === 404) {
          throw new Error('备份失败：指定的路径不存在。请检查服务器地址和路径。');
        } else if (response.status === 405) {
          throw new Error('备份失败：方法不允许。请检查WebDAV服务器配置。');
        } else if (response.status === 429) {
          throw new Error('备份失败：请求过于频繁。请稍后再试。');
        } else if (response.status >= 500) {
          throw new Error('备份失败：服务器内部错误。请稍后再试。');
        } else {
          throw new Error(`备份失败：${response.status} ${response.statusText}`);
        }
      }

      return response;
    } catch (error) {
      console.error('WebDAV request failed:', error);
      // 检查错误类型并提供更详细的错误信息
      if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('network'))) {
        if (targetUrl.includes('jianguoyun.com')) {
          throw new Error('备份失败：无法连接到坚果云服务器。请检查网络连接，确保坚果云WebDAV服务已启用。');
        } else {
          throw new Error('备份失败：网络连接问题。请检查服务器地址是否正确，以及网络连接是否正常。');
        }
      } else if (error instanceof Error && error.message.includes('Failed to fetch')) {
        if (targetUrl.includes('jianguoyun.com')) {
          throw new Error('备份失败：无法连接到坚果云服务器。请检查坚果云WebDAV URL是否正确，以及网络连接是否正常。');
        } else {
          throw new Error('备份失败：无法连接到WebDAV服务器。请检查服务器地址、用户名和密码是否正确。');
        }
      }
      throw error;
    }
  }

  /**
   * 列出目录内容
   * @param path 目录路径，默认为根目录
   * @returns WebDAVFile数组
   */
  async listFiles(path: string = ''): Promise<WebDAVFile[]> {
    try {
      const response = await this.request('PROPFIND', path, undefined, {
        'Depth': '1',
      });
      
      const xmlText = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlText, 'application/xml');
      
      const responseElements = doc.getElementsByTagName('d:response');
      const files: WebDAVFile[] = [];
      
      for (let i = 0; i < responseElements.length; i++) {
        const responseElement = responseElements[i];
        const href = responseElement.getElementsByTagName('d:href')[0]?.textContent || '';
        const isDirectory = href.endsWith('/');
        
        // 跳过当前目录和父目录
        if (href === `${path}/` || href === `${path}/../`) {
          continue;
        }
        
        const name = href.split('/').filter(Boolean).pop() || '';
        const sizeElement = responseElement.getElementsByTagName('d:getcontentlength')[0];
        const size = sizeElement ? parseInt(sizeElement.textContent || '0', 10) : 0;
        
        const mtimeElement = responseElement.getElementsByTagName('d:getlastmodified')[0];
        const mtime = mtimeElement ? new Date(mtimeElement.textContent || '') : new Date();
        
        files.push({
          name,
          size,
          mtime,
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

  /**
   * 创建目录
   * @param path 目录路径
   */
  async createDirectory(path: string): Promise<void> {
    try {
      await this.request('MKCOL', path);
    } catch (error) {
      console.error(`Failed to create directory ${path}:`, error);
      throw error;
    }
  }

  /**
   * 确保目录存在，如果不存在则创建
   * @param path 目录路径
   */
  async ensureDirectoryExists(path: string): Promise<void> {
    // 处理空路径
    if (!path || path === '/') {
      return;
    }
    
    const pathParts = path.split('/').filter(Boolean);
    let currentPath = '';
    
    for (const part of pathParts) {
      currentPath += `/${part}`;
      try {
        await this.createDirectory(currentPath);
      } catch (error) {
        // 目录可能已存在，忽略错误
        console.log(`目录${currentPath}可能已存在，继续处理`);
      }
    }
  }

  /**
   * 上传文件到WebDAV服务器
   * @param path 文件路径
   * @param content 文件内容，可以是字符串或Blob
   */
  async uploadFile(path: string, content: string | Blob): Promise<void> {
    try {
      // 直接上传文件，不创建目录，因为坚果云可能不允许
      await this.request('PUT', path, content);
    } catch (error) {
      console.error(`Failed to upload file ${path}:`, error);
      throw error;
    }
  }

  /**
   * 从WebDAV服务器下载文件
   * @param path 文件路径
   * @returns 文件内容字符串
   */
  async downloadFile(path: string): Promise<string> {
    try {
      const response = await this.request('GET', path);
      return await response.text();
    } catch (error) {
      console.error(`Failed to download file ${path}:`, error);
      throw error;
    }
  }

  /**
   * 删除WebDAV服务器上的文件
   * @param path 文件路径
   */
  async deleteFile(path: string): Promise<void> {
    try {
      await this.request('DELETE', path);
    } catch (error) {
      console.error(`Failed to delete file ${path}:`, error);
      throw error;
    }
  }

  /**
   * 获取文件信息
   * @param path 文件路径
   * @returns WebDAVFile对象或null
   */
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

  /**
   * 测试与WebDAV服务器的连接
   * @throws 如果连接失败则抛出错误
   */
  async testConnection(): Promise<void> {
    try {
      // 尝试获取根目录列表来测试连接
      await this.listFiles('/');
    } catch (error) {
      console.error('Failed to test connection:', error);
      throw error;
    }
  }
}

// 导出默认实例和类
export default WebDAVClient;
