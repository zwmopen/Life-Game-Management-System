// WebDAV客户端工具函数

interface WebDAVConfig {
  url: string;
  username: string;
  password: string;
  basePath?: string;
}

interface WebDAVFile {
  name: string;
  size: number;
  mtime: Date;
  isDirectory: boolean;
  url: string;
}

class WebDAVClient {
  private config: WebDAVConfig;

  constructor(config: WebDAVConfig) {
    this.config = {
      ...config,
      basePath: config.basePath || '/',
    };
  }

  // 生成认证头
  private getAuthHeader(): string {
    const { username, password } = this.config;
    // 使用更安全的编码方式处理用户名和密码中的特殊字符
    const credentials = `${encodeURIComponent(username)}:${encodeURIComponent(password)}`;
    // 使用TextEncoder和btoa处理UTF-8字符
    const encoder = new TextEncoder();
    const data = encoder.encode(credentials);
    let binary = '';
    for (let i = 0; i < data.byteLength; i++) {
      binary += String.fromCharCode(data[i]);
    }
    return `Basic ${btoa(binary)}`;
  }

  // 构建完整URL - 直接使用目标URL，不依赖代理服务器
  private buildUrl(path: string): string {
    // 直接使用完整的目标URL
    const basePath = this.config.basePath?.replace(/^\/|\/$/g, '') || '';
    const filePath = path.replace(/^\//, '');
    
    let fullPath;
    if (!basePath) {
      fullPath = `/${filePath}`;
    } else {
      fullPath = `/${basePath}/${filePath}`;
    }
    
    // 确保路径以/开头
    if (!fullPath.startsWith('/')) {
      fullPath = '/' + fullPath;
    }
    
    return new URL(fullPath, this.config.url).href;
  }

  // 发送请求
  private async request(
    method: string,
    path: string,
    body?: BodyInit,
    headers?: Record<string, string>
  ): Promise<Response> {
    // 构建完整的目标URL
    const targetUrl = this.buildUrl(path);
    
    try {
      // 直接使用目标URL发送请求
      const requestHeaders: Record<string, string> = {
          'Authorization': this.getAuthHeader(),
          ...headers,
        };
        
        // 根据请求方法设置适当的内容类型
        if (body) {
          if (method === 'PUT') {
            // 上传文件时使用通用类型
            requestHeaders['Content-Type'] = 'application/octet-stream';
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
        
        const response = await fetch(targetUrl, {
          method,
          headers: requestHeaders,
          body,
          credentials: 'omit', // 不发送cookies，避免不必要的安全问题
          mode: 'cors',
        });

      // 处理特定的状态码
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('备份失败：认证失败。请检查用户名和密码是否正确。');
        } else if (response.status === 403) {
          throw new Error('备份失败：权限不足。请检查账户权限。');
        } else if (response.status === 404) {
          throw new Error('备份失败：指定的路径不存在。请检查服务器地址和路径。');
        } else {
          throw new Error(`备份失败：${response.status} ${response.statusText}`);
        }
      }

      return response;
    } catch (error) {
      console.error('WebDAV request failed:', error);
      // 检查错误类型并提供更详细的错误信息
      if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('network'))) {
        throw new Error('备份失败：网络连接问题。请检查服务器地址是否正确，以及网络连接是否正常。');
      } else if (error instanceof Error && error.message.includes('Failed to fetch')) {
        throw new Error('备份失败：无法连接到WebDAV服务器。请检查服务器地址、用户名和密码是否正确。');
      }
      throw error;
    }
  }

  // 列出目录内容
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

  // 创建目录
  async createDirectory(path: string): Promise<void> {
    try {
      await this.request('MKCOL', path);
    } catch (error) {
      console.error(`Failed to create directory ${path}:`, error);
      throw error;
    }
  }

  // 确保目录存在
  async ensureDirectoryExists(path: string): Promise<void> {
    const pathParts = path.split('/').filter(Boolean);
    let currentPath = '';
    
    for (const part of pathParts) {
      currentPath += `/${part}`;
      try {
        await this.createDirectory(currentPath);
      } catch (error) {
        // 目录可能已存在，忽略错误
        // 目录可能已存在
      }
    }
  }

  // 上传文件
  async uploadFile(path: string, content: string | Blob): Promise<void> {
    try {
      // 确保父目录存在
      const directoryPath = path.substring(0, path.lastIndexOf('/'));
      if (directoryPath) {
        await this.ensureDirectoryExists(directoryPath);
      }
      
      await this.request('PUT', path, content);
    } catch (error) {
      console.error(`Failed to upload file ${path}:`, error);
      throw error;
    }
  }

  // 下载文件
  async downloadFile(path: string): Promise<string> {
    try {
      const response = await this.request('GET', path);
      return await response.text();
    } catch (error) {
      console.error(`Failed to download file ${path}:`, error);
      throw error;
    }
  }

  // 删除文件
  async deleteFile(path: string): Promise<void> {
    try {
      await this.request('DELETE', path);
    } catch (error) {
      console.error(`Failed to delete file ${path}:`, error);
      throw error;
    }
  }

  // 获取文件信息
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
}

// 导出默认实例和类
export default WebDAVClient;
export type { WebDAVConfig, WebDAVFile };
