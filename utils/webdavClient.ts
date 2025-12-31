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
    return `Basic ${btoa(`${username}:${password}`)}`;
  }

  // 构建完整URL
  private buildUrl(path: string): string {
    const baseUrl = this.config.url.replace(/\/$/, '');
    const basePath = this.config.basePath.replace(/^\//, '').replace(/\/$/, '');
    const filePath = path.replace(/^\//, '');
    
    if (!basePath) {
      return `${baseUrl}/${filePath}`;
    }
    return `${baseUrl}/${basePath}/${filePath}`;
  }

  // 发送请求
  private async request(
    method: string,
    path: string,
    body?: BodyInit,
    headers?: Record<string, string>
  ): Promise<Response> {
    const url = this.buildUrl(path);
    const authHeader = this.getAuthHeader();
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
          ...headers,
        },
        body,
        credentials: 'include',
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`WebDAV request failed: ${response.status} ${response.statusText}`);
      }

      return response;
    } catch (error) {
      console.error('WebDAV request failed:', error);
      // 添加更详细的错误信息，帮助用户理解可能的原因
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('备份失败：可能是由于跨域资源共享(CORS)限制。请确保您的WebDAV服务允许来自当前域名的请求，或者尝试使用支持CORS的WebDAV服务。');
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
        console.log(`Directory ${currentPath} may already exist`);
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
