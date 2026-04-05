// 安全存储工具，用于加密存储敏感信息
import * as CryptoJS from 'crypto-js';

// ============================================================
// 安全改进：使用设备指纹派生唯一密钥，而非硬编码密钥
// ============================================================

/**
 * 获取或创建设备唯一标识符
 * 使用多种浏览器特征生成稳定的设备指纹
 */
const getDeviceFingerprint = (): string => {
  // 尝试从存储中获取已有的设备ID
  const storedDeviceId = localStorage.getItem('_device_id');
  if (storedDeviceId) {
    return storedDeviceId;
  }

  // 生成新的设备指纹
  const components: string[] = [];

  // 1. 用户代理
  components.push(navigator.userAgent);

  // 2. 屏幕信息
  components.push(`${screen.width}x${screen.height}x${screen.colorDepth}`);

  // 3. 时区
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);

  // 4. 语言
  components.push(navigator.language);

  // 5. 平台
  components.push(navigator.platform);

  // 6. 随机生成一个 UUID 作为补充
  const randomId = crypto.randomUUID();
  components.push(randomId);

  // 组合生成指纹
  const fingerprint = components.join('|');

  // 使用 SHA-256 生成固定长度的设备ID
  const deviceId = CryptoJS.SHA256(fingerprint).toString().substring(0, 32);

  // 存储设备ID以便后续使用
  localStorage.setItem('_device_id', deviceId);

  return deviceId;
};

/**
 * 从设备指纹派生加密密钥
 * 使用 PBKDF2 算法增强安全性
 */
const deriveEncryptionKey = (salt: string = 'life_game_system'): string => {
  const deviceId = getDeviceFingerprint();

  // 使用 PBKDF2 派生密钥（迭代 1000 次增强安全性）
  const key = CryptoJS.PBKDF2(deviceId, CryptoJS.enc.Utf8.parse(salt), {
    keySize: 256 / 32, // 256 位密钥
    iterations: 1000
  }).toString();

  return key;
};

// 旧版本硬编码密钥（仅用于向后兼容迁移）
const LEGACY_KEY = 'life_game_system_default_key';

/**
 * 检查数据是否使用旧密钥加密
 */
const isLegacyEncrypted = (encryptedData: string): boolean => {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, LEGACY_KEY).toString(CryptoJS.enc.Utf8);
    return decrypted.length > 0;
  } catch {
    return false;
  }
};

/**
 * 迁移旧加密数据到新密钥
 */
const migrateLegacyData = (key: string, encryptedData: string): boolean => {
  try {
    // 使用旧密钥解密
    const decrypted = CryptoJS.AES.decrypt(encryptedData, LEGACY_KEY).toString(CryptoJS.enc.Utf8);
    if (!decrypted) return false;

    // 使用新密钥重新加密
    const newKey = deriveEncryptionKey();
    const reEncrypted = CryptoJS.AES.encrypt(decrypted, newKey).toString();

    // 更新存储
    localStorage.setItem(key, reEncrypted);
    console.log(`[安全存储] 已迁移 ${key} 到新加密方式`);

    return true;
  } catch (error) {
    console.error(`[安全存储] 迁移 ${key} 失败:`, error);
    return false;
  }
};

/**
 * 加密并存储数据
 * @param key 存储键
 * @param data 要存储的数据
 * @param password 可选密码，如果不提供则使用设备派生密钥
 */
export const encryptAndStore = (key: string, data: any, password?: string): void => {
  try {
    const jsonString = JSON.stringify(data);

    // 优先使用用户提供的密码，否则使用设备派生密钥
    const encryptionKey = password || deriveEncryptionKey();

    const encrypted = CryptoJS.AES.encrypt(jsonString, encryptionKey).toString();
    localStorage.setItem(key, encrypted);

    // 标记为新加密方式
    localStorage.setItem(`${key}_v2`, 'true');
  } catch (error) {
    console.error('加密存储失败:', error);
    // 如果加密失败，回退到普通存储（仅在开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.warn('[开发模式] 回退到普通存储');
      localStorage.setItem(key, JSON.stringify(data));
    }
  }
};

/**
 * 解密并读取数据
 * @param key 存储键
 * @param password 可选密码，如果不提供则使用设备派生密钥
 * @returns 解密后的数据，如果解密失败则返回null
 */
export const decryptAndRetrieve = (key: string, password?: string): any => {
  try {
    const encryptedData = localStorage.getItem(key);
    if (!encryptedData) {
      return null;
    }

    // 检查是否是新版本加密
    const isNewVersion = localStorage.getItem(`${key}_v2`) === 'true';

    // 确定使用的密钥
    const decryptionKey = password || deriveEncryptionKey();

    // 尝试解密
    let decrypted: string;

    if (isNewVersion) {
      // 新版本直接解密
      decrypted = CryptoJS.AES.decrypt(encryptedData, decryptionKey).toString(CryptoJS.enc.Utf8);
    } else {
      // 旧版本，尝试迁移
      if (isLegacyEncrypted(encryptedData)) {
        // 使用旧密钥解密
        decrypted = CryptoJS.AES.decrypt(encryptedData, LEGACY_KEY).toString(CryptoJS.enc.Utf8);

        // 后台迁移到新密钥
        setTimeout(() => {
          migrateLegacyData(key, encryptedData);
        }, 0);
      } else {
        // 尝试新密钥解密（可能是已迁移但标记未更新的数据）
        decrypted = CryptoJS.AES.decrypt(encryptedData, decryptionKey).toString(CryptoJS.enc.Utf8);
      }
    }

    if (!decrypted) {
      console.warn(`[安全存储] 解密失败: ${key}`);
      return null;
    }

    return JSON.parse(decrypted);
  } catch (error) {
    console.error('解密读取失败:', error);

    // 尝试作为普通数据读取（向后兼容）
    try {
      const rawData = localStorage.getItem(key);
      if (rawData) {
        // 检查是否是 JSON 格式（未加密的数据）
        if (rawData.startsWith('{') || rawData.startsWith('[')) {
          return JSON.parse(rawData);
        }
      }
    } catch (parseError) {
      console.error('普通数据读取也失败:', parseError);
    }

    return null;
  }
};

/**
 * 清除加密存储的数据
 * @param key 存储键
 */
export const removeEncryptedItem = (key: string): void => {
  localStorage.removeItem(key);
  localStorage.removeItem(`${key}_v2`);
};

/**
 * 检查存储项是否存在
 * @param key 存储键
 */
export const hasEncryptedItem = (key: string): boolean => {
  return localStorage.getItem(key) !== null;
};

/**
 * 安全清除所有加密数据
 */
export const clearAllEncryptedData = (): void => {
  // 获取所有存储的键
  const keys = Object.keys(localStorage);

  // 清除所有加密数据
  keys.forEach(key => {
    if (key.endsWith('_v2') || key.startsWith('webdav-') || key.startsWith('backup_')) {
      localStorage.removeItem(key);
    }
  });

  // 清除设备ID（强制重新生成）
  localStorage.removeItem('_device_id');
};

/**
 * 专门用于存储WebDAV配置的安全方法
 * @param config WebDAV配置对象
 */
export const storeWebDAVConfig = (config: { url: string; username: string; password: string; basePath?: string }): void => {
  // 验证配置
  if (!config.url || !config.username || !config.password) {
    console.warn('[安全存储] WebDAV配置不完整，跳过存储');
    return;
  }

  // 加密存储配置
  encryptAndStore('webdav-config', {
    url: config.url,
    username: config.username,
    password: config.password,
    basePath: config.basePath || '',
    updatedAt: new Date().toISOString()
  });

  console.log('[安全存储] WebDAV配置已加密存储');
};

/**
 * 专门用于读取WebDAV配置的安全方法
 * @returns WebDAV配置对象
 */
export const retrieveWebDAVConfig = (): { url: string; username: string; password: string; basePath: string } => {
  const defaultConfig = {
    url: 'https://dav.jianguoyun.com/dav/',
    username: '',
    password: '',
    basePath: '/人生游戏管理系统'
  };

  try {
    const config = decryptAndRetrieve('webdav-config');

    if (config && typeof config === 'object') {
      return {
        url: config.url || defaultConfig.url,
        username: config.username || defaultConfig.username,
        password: config.password || defaultConfig.password,
        basePath: config.basePath || defaultConfig.basePath
      };
    }
  } catch (error) {
    console.error('[安全存储] 读取WebDAV配置失败:', error);
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
    console.log('[安全存储] 检测到旧的WebDAV配置，开始迁移...');

    // 如果存在旧配置，将其迁移到新的安全存储
    const newConfig = {
      url: oldUrl || 'https://dav.jianguoyun.com/dav/',
      username: oldUsername || '',
      password: oldPassword || '',
      basePath: ''
    };

    storeWebDAVConfig(newConfig);

    // 迁移完成后删除旧的存储项
    localStorage.removeItem('webdav-url');
    localStorage.removeItem('webdav-username');
    localStorage.removeItem('webdav-password');

    console.log('[安全存储] WebDAV配置迁移完成');
  }
};

/**
 * 获取设备信息（用于调试）
 */
export const getDeviceInfo = (): { deviceId: string; hasLegacyData: boolean } => {
  const deviceId = getDeviceFingerprint();
  const keys = Object.keys(localStorage);
  const legacyKeys = keys.filter(k =>
    !k.endsWith('_v2') &&
    (k.startsWith('webdav-') || k.startsWith('backup_')) &&
    localStorage.getItem(k)
  );

  return {
    deviceId: deviceId.substring(0, 8) + '...', // 只显示前8位
    hasLegacyData: legacyKeys.length > 0
  };
};
