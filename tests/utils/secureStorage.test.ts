import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  decryptAndRetrieve,
  encryptAndStore,
  getDeviceInfo,
  hasEncryptedItem,
  removeEncryptedItem,
  retrieveWebDAVConfig,
  storeWebDAVConfig,
} from '@/utils/secureStorage';

const STORAGE_METHOD_KEYS = new Set([
  'getItem',
  'setItem',
  'removeItem',
  'clear',
  'key',
  'length',
]);

describe('secureStorage', () => {
  let storage: Record<string, string>;

  beforeEach(() => {
    storage = {};

    const getItemMock = localStorage.getItem as unknown as ReturnType<typeof vi.fn>;
    const setItemMock = localStorage.setItem as unknown as ReturnType<typeof vi.fn>;
    const removeItemMock = localStorage.removeItem as unknown as ReturnType<typeof vi.fn>;
    const clearMock = localStorage.clear as unknown as ReturnType<typeof vi.fn>;
    const keyMock = localStorage.key as unknown as ReturnType<typeof vi.fn>;

    clearMock.mockImplementation(() => {
      Object.keys(storage).forEach((key) => {
        delete storage[key];
      });

      Object.keys(localStorage).forEach((key) => {
        if (!STORAGE_METHOD_KEYS.has(key)) {
          delete (localStorage as Record<string, unknown>)[key];
        }
      });
    });

    setItemMock.mockImplementation((key: string, value: string) => {
      storage[key] = String(value);
      (localStorage as Record<string, unknown>)[key] = String(value);
    });

    getItemMock.mockImplementation((key: string) => storage[key] ?? null);

    removeItemMock.mockImplementation((key: string) => {
      delete storage[key];
      delete (localStorage as Record<string, unknown>)[key];
    });

    keyMock.mockImplementation((index: number) => Object.keys(storage)[index] ?? null);

    Object.defineProperty(localStorage, 'length', {
      configurable: true,
      get: () => Object.keys(storage).length,
    });

    localStorage.clear();
    vi.clearAllMocks();
  });

  it('stores encrypted payloads and marker keys', () => {
    const payload = { username: 'test', password: 'secret123' };

    encryptAndStore('test-key', payload);

    expect(localStorage.setItem).toHaveBeenCalledWith('test-key', expect.any(String));
    expect(localStorage.setItem).toHaveBeenCalledWith('test-key_v2', 'true');
    expect(storage['test-key']).not.toContain(JSON.stringify(payload));
  });

  it('reads back previously encrypted payloads', () => {
    const payload = { username: 'test', password: 'secret123' };

    encryptAndStore('test-key', payload);

    expect(decryptAndRetrieve('test-key')).toEqual(payload);
  });

  it('returns null for missing encrypted items', () => {
    expect(decryptAndRetrieve('missing-key')).toBeNull();
  });

  it('removes encrypted items and version markers together', () => {
    encryptAndStore('test-key', { enabled: true });

    removeEncryptedItem('test-key');

    expect(hasEncryptedItem('test-key')).toBe(false);
    expect(localStorage.removeItem).toHaveBeenCalledWith('test-key');
    expect(localStorage.removeItem).toHaveBeenCalledWith('test-key_v2');
  });

  it('stores and retrieves WebDAV config safely', () => {
    const config = {
      url: 'https://dav.example.com/',
      username: 'user@example.com',
      password: 'app-password-123',
      basePath: '/backup',
    };

    storeWebDAVConfig(config);

    expect(retrieveWebDAVConfig()).toMatchObject(config);
  });

  it('returns the default WebDAV config when nothing is stored', () => {
    expect(retrieveWebDAVConfig()).toEqual({
      url: 'https://dav.jianguoyun.com/dav/',
      username: '',
      password: '',
      basePath: '/人生游戏管理系统',
    });
  });

  it('reports device info and detects legacy WebDAV keys', () => {
    localStorage.setItem('webdav-url', 'https://dav.example.com/');

    const info = getDeviceInfo();

    expect(info.deviceId).toMatch(/^[a-f0-9]{8}\.\.\.$/i);
    expect(info.hasLegacyData).toBe(true);
  });
});
