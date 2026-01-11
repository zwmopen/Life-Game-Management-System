// 安全存储工具，用于加密存储敏感信息
import * as CryptoJS from 'crypto-js';

// 默认密钥（在实际生产环境中，应使用更复杂的密钥生成策略）
const DEFAULT_KEY = 'life_game_system_default_key';

/**
 * 加密并存储数据
 * @param key 存储键
 * @param data 要存储的数据
 * @param password 可选密码，如果不提供则使用默认密钥
 */
export const encryptAndStore = (key: string, data: any, password?: string): void => {
  try {
    const jsonString = JSON.stringify(data);
    const encryptionKey = password || DEFAULT_KEY;
    const encrypted = CryptoJS.AES.encrypt(jsonString, encryptionKey).toString();
    localStorage.setItem(key, encrypted);
  } catch (error) {
    console.error('加密存储失败:', error);
    // 如果加密失败，回退到普通存储
    localStorage.setItem(key, JSON.stringify(data));
  }
};

/**
 * 解密并读取数据
 * @param key 存储键
 * @param password 可选密码，如果不提供则使用默认密钥
 * @returns 解密后的数据，如果解密失败则返回null
 */
export const decryptAndRetrieve = (key: string, password?: string): any => {
  try {
    const encryptedData = localStorage.getItem(key);
    if (!encryptedData) {
      return null;
    }

    const decryptionKey = password || DEFAULT_KEY;
    const decrypted = CryptoJS.AES.decrypt(encryptedData, decryptionKey).toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('解密读取失败:', error);
    // 尝试作为普通数据读取（向后兼容）
    try {
      const rawData = localStorage.getItem(key);
      return rawData ? JSON.parse(rawData) : null;
    } catch (parseError) {
      return null;
    }
  }
};

/**
 * 清除加密存储的数据
 * @param key 存储键
 */
export const removeEncryptedItem = (key: string): void => {
  localStorage.removeItem(key);
};

/**
 * 专门用于存储WebDAV配置的安全方法
 * @param config WebDAV配置对象
 */
export const storeWebDAVConfig = (config: { url: string; username: string; password: string }): void => {
  // 对于WebDAV配置，我们将密码单独加密存储
  encryptAndStore('webdav-config', {
    url: config.url,
    username: config.username,
    // 密码会被加密存储
    password: config.password
  });
};

/**
 * 专门用于读取WebDAV配置的安全方法
 * @returns WebDAV配置对象
 */
export const retrieveWebDAVConfig = (): { url: string; username: string; password: string } => {
  const defaultConfig = {
    url: 'https://dav.jianguoyun.com/dav/',
    username: '',
    password: ''
  };

  try {
    const config = decryptAndRetrieve('webdav-config');
    if (config && typeof config === 'object') {
      return {
        url: config.url || defaultConfig.url,
        username: config.username || defaultConfig.username,
        password: config.password || defaultConfig.password
      };
    }
  } catch (error) {
    console.error('读取WebDAV配置失败:', error);
  }

  return defaultConfig;
};

/**
 * 迁移旧的WebDAV配置到新的安全存储
 */
export const migrateOldWebDAVConfig = (): void => {
  // 检查是否有旧的配置存储
  const oldUrl = localStorage.getItem('webdav-url');
  const oldUsername = localStorage.getItem('webdav-username');
  const oldPassword = localStorage.getItem('webdav-password');

  if (oldUrl || oldUsername || oldPassword) {
    // 如果存在旧配置，将其迁移到新的安全存储
    const newConfig = {
      url: oldUrl || 'https://dav.jianguoyun.com/dav/',
      username: oldUsername || '',
      password: oldPassword || ''
    };

    storeWebDAVConfig(newConfig);

    // 迁移完成后删除旧的存储项
    localStorage.removeItem('webdav-url');
    localStorage.removeItem('webdav-username');
    localStorage.removeItem('webdav-password');

    console.log('WebDAV配置已从旧存储迁移到安全存储');
  }
};