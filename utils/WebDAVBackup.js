// utils/WebDAVBackup.js
class WebDAVBackup {
  constructor(config = {}) {
    this.serverUrl = config.serverUrl || '';
    this.username = config.username || '';
    this.password = config.password || '';
    this.basePath = config.basePath || '/';
    this.authHeader = `Basic ${btoa(`${this.username}:${this.password}`)}`;
    this.debug = config.debug || false;
  }

  /**
   * 获取当前应用的端口号
   */
  getCurrentPort() {
    const port = window.location.port || (window.location.protocol === 'https:' ? '443' : '80');
    return port;
  }

  /**
   * 构建代理请求URL
   */
  buildProxyUrl(path) {
    // 使用代理路径避免CORS问题，适配现有插件
    const fullPath = `${this.basePath}${path}`.replace('//', '/');
    return `/webdav${fullPath}`;
  }

  /**
   * 发送WebDAV请求
   */
  async sendRequest(method, path, body = null, headers = {}) {
    const url = this.buildProxyUrl(path);
    
    const requestHeaders = {
      ...headers,
      'Authorization': this.authHeader,
      'Content-Type': 'application/xml; charset=utf-8',
      'X-Target-Url': `https://dav.jianguoyun.com/dav${this.basePath}${path}`.replace('//', '/'),
      ...headers
    };

    if(this.debug) {
      console.log(`[WebDAV Debug] ${method} ${url}`, { headers: requestHeaders, body });
      console.log(`[WebDAV Debug] Target URL: https://dav.jianguoyun.com/dav${this.basePath}${path}`);
    }

    const response = await fetch(url, {
      method: method,
      headers: requestHeaders,
      body: body,
      credentials: 'omit' // 不发送cookies
    });

    if(this.debug) {
      console.log(`[WebDAV Debug] Response Status: ${response.status}`);
    }

    return response;
  }

  /**
   * 测试连接
   */
  async testConnection() {
    try {
      const response = await this.sendRequest('PROPFIND', '/', null, {
        'Depth': '0'
      });
      
      if(response.ok) {
        console.log('[WebDAV] Connection test successful');
        return { success: true, message: '连接成功' };
      } else {
        const errorMessage = await response.text();
        console.error('[WebDAV] Connection test failed:', errorMessage);
        return { success: false, message: `连接失败: ${response.status} ${errorMessage}` };
      }
    } catch (error) {
      console.error('[WebDAV] Connection test error:', error);
      return { success: false, message: `网络错误: ${error.message}` };
    }
  }

  /**
   * 创建目录
   */
  async createDirectory(path) {
    try {
      const response = await this.sendRequest('MKCOL', path);
      
      if(response.ok || response.status === 405) { // 405表示目录已存在
        console.log(`[WebDAV] Directory created or already exists: ${path}`);
        return { success: true, message: '目录创建成功或已存在' };
      } else {
        const errorMessage = await response.text();
        console.error(`[WebDAV] Failed to create directory: ${path}`, errorMessage);
        return { success: false, message: `创建目录失败: ${response.status} ${errorMessage}` };
      }
    } catch (error) {
      console.error('[WebDAV] Create directory error:', error);
      return { success: false, message: `创建目录错误: ${error.message}` };
    }
  }

  /**
   * 上传文件
   */
  async uploadFile(filePath, fileContent) {
    try {
      // 确保目录存在
      const directoryPath = filePath.substring(0, filePath.lastIndexOf('/'));
      if(directoryPath && directoryPath !== '/') {
        await this.createDirectory(directoryPath);
      }

      const response = await this.sendRequest('PUT', filePath, fileContent, {
        'Content-Type': 'application/octet-stream'
      });

      if(response.ok) {
        console.log(`[WebDAV] File uploaded successfully: ${filePath}`);
        return { success: true, message: '文件上传成功' };
      } else {
        const errorMessage = await response.text();
        console.error(`[WebDAV] Failed to upload file: ${filePath}`, errorMessage);
        return { success: false, message: `上传文件失败: ${response.status} ${errorMessage}` };
      }
    } catch (error) {
      console.error('[WebDAV] Upload file error:', error);
      return { success: false, message: `上传文件错误: ${error.message}` };
    }
  }

  /**
   * 下载文件
   */
  async downloadFile(filePath) {
    try {
      const response = await this.sendRequest('GET', filePath);

      if(response.ok) {
        const content = await response.text();
        console.log(`[WebDAV] File downloaded successfully: ${filePath}`);
        return { success: true, content: content, message: '文件下载成功' };
      } else {
        const errorMessage = await response.text();
        console.error(`[WebDAV] Failed to download file: ${filePath}`, errorMessage);
        return { success: false, message: `下载文件失败: ${response.status} ${errorMessage}` };
      }
    } catch (error) {
      console.error('[WebDAV] Download file error:', error);
      return { success: false, message: `下载文件错误: ${error.message}` };
    }
  }

  /**
   * 列出目录内容
   */
  async listDirectory(path = '/') {
    try {
      const propfindBody = `<?xml version="1.0" encoding="utf-8"?>
        <propfind xmlns="DAV:">
          <prop>
            <displayname/>
            <getlastmodified/>
            <getcontentlength/>
            <resourcetype/>
          </prop>
        </propfind>`;

      const response = await this.sendRequest('PROPFIND', path, propfindBody, {
        'Depth': '1'
      });

      if(response.ok) {
        const xmlText = await response.text();
        console.log(`[WebDAV] Directory listing for ${path}:`, xmlText);
        
        // 解析XML响应，提取文件信息
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        const responses = xmlDoc.getElementsByTagName('response');
        
        const items = [];
        for (let i = 0; i < responses.length; i++) {
          const responseEl = responses[i];
          const href = responseEl.getElementsByTagName('href')[0]?.textContent;
          const displayName = responseEl.getElementsByTagName('displayname')[0]?.textContent;
          
          if (href && href !== path) { // 排除自身
            const isCollection = responseEl.querySelector('collection') !== null;
            items.push({
              name: displayName || href.split('/').pop(),
              path: href,
              type: isCollection ? 'directory' : 'file'
            });
          }
        }
        
        return { success: true, items: items, message: '目录列表获取成功' };
      } else {
        const errorMessage = await response.text();
        console.error(`[WebDAV] Failed to list directory: ${path}`, errorMessage);
        return { success: false, message: `获取目录失败: ${response.status} ${errorMessage}` };
      }
    } catch (error) {
      console.error('[WebDAV] List directory error:', error);
      return { success: false, message: `获取目录错误: ${error.message}` };
    }
  }

  /**
   * 备份整个应用数据
   */
  async backupAppData(dataToBackup = {}) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupDir = `/人生游戏管理系统/backup_${timestamp}`;
      
      // 创建备份目录
      await this.createDirectory(backupDir);
      
      // 准备备份数据
      const backupData = {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        data: dataToBackup
      };
      
      // 上传备份数据
      const backupFilePath = `${backupDir}/backup.json`;
      const jsonContent = JSON.stringify(backupData, null, 2);
      
      const result = await this.uploadFile(backupFilePath, jsonContent);
      
      if(result.success) {
        console.log(`[WebDAV] Backup completed successfully at ${backupFilePath}`);
        return {
          success: true,
          backupPath: backupFilePath,
          message: `备份成功，保存至: ${backupFilePath}`
        };
      } else {
        return result;
      }
    } catch (error) {
      console.error('[WebDAV] Backup error:', error);
      return { success: false, message: `备份失败: ${error.message}` };
    }
  }

  /**
   * 从WebDAV恢复数据
   */
  async restoreFromWebDAV(backupPath) {
    try {
      const result = await this.downloadFile(backupPath);
      
      if(result.success) {
        try {
          const backupData = JSON.parse(result.content);
          console.log('[WebDAV] Restore data parsed successfully', backupData);
          return {
            success: true,
            data: backupData.data,
            message: '数据恢复成功'
          };
        } catch (parseError) {
          console.error('[WebDAV] Failed to parse backup data:', parseError);
          return { success: false, message: `备份文件格式错误: ${parseError.message}` };
        }
      } else {
        return result;
      }
    } catch (error) {
      console.error('[WebDAV] Restore error:', error);
      return { success: false, message: `数据恢复失败: ${error.message}` };
    }
  }
}

export default WebDAVBackup;