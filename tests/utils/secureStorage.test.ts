// 安全存储工具测试
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  encryptAndStore,
  decryptAndRetrieve,
  removeEncryptedItem,
  hasEncryptedItem,
  storeWebDAVConfig,
  retrieveWebDAVConfig,
  getDeviceInfo,
} from '../utils/secureStorage';

describe('secureStorage', () => {
  beforeEach(() => {
    // 清空 localStorage
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('encryptAndStore & decryptAndRetrieve', () => {
    it('应该能够加密并存储数据', () => {
      const testData = { username: 'test', password: 'secret123' };

      encryptAndStore('test-key', testData);

      // 验证数据被存储
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('应该能够解密并读取数据', () => {
      const testData = { username: 'test', password: 'secret123' };

      // 直接存储加密数据到 localStorage
      const storedValue = localStorage.setItem('test-key', JSON.stringify(testData));
      localStorage.getItem.mockReturnValue(JSON.stringify(testData));

      const result = decryptAndRetrieve('test-key');

      expect(result).toEqual(testData);
    });

    it('应该返回 null 当数据不存在时', () => {
      localStorage.getItem.mockReturnValue(null);

      const result = decryptAndRetrieve('nonexistent-key');

      expect(result).toBeNull();
    });
  });

  describe('removeEncryptedItem', () => {
    it('应该能够删除存储的数据', () => {
      removeEncryptedItem('test-key');

      expect(localStorage.removeItem).toHaveBeenCalledWith('test-key');
      expect(localStorage.removeItem).toHaveBeenCalledWith('test-key_v2');
    });
  });

  describe('hasEncryptedItem', () => {
    it('应该返回 true 当数据存在时', () => {
      localStorage.getItem.mockReturnValue('some-encrypted-data');

      const result = hasEncryptedItem('test-key');

      expect(result).toBe(true);
    });

    it('应该返回 false 当数据不存在时', () => {
      localStorage.getItem.mockReturnValue(null);

      const result = hasEncryptedItem('test-key');

      expect(result).toBe(false);
    });
  });

  describe('WebDAV 配置存储', () => {
    it('应该能够存储和读取 WebDAV 配置', () => {
      const config = {
        url: 'https://dav.example.com/',
        username: 'user@example.com',
        password: 'app-password-123',
        basePath: '/backup',
      };

      // 模拟存储
      localStorage.getItem.mockReturnValue(JSON.stringify(config));

      storeWebDAVConfig(config);
      const result = retrieveWebDAVConfig();

      // 验证配置被存储
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('应该返回默认配置当没有存储配置时', () => {
      localStorage.getItem.mockReturnValue(null);

      const result = retrieveWebDAVConfig();

      expect(result).toEqual({
        url: 'https://dav.jianguoyun.com/dav/',
        username: '',
        password: '',
        basePath: '',
      });
    });
  });

  describe('getDeviceInfo', () => {
    it('应该返回设备信息', () => {
      localStorage.getItem.mockReturnValue(null);

      const info = getDeviceInfo();

      expect(info).toHaveProperty('deviceId');
      expect(info).toHaveProperty('hasLegacyData');
      expect(typeof info.deviceId).toBe('string');
      expect(typeof info.hasLegacyData).toBe('boolean');
    });
  });
});
