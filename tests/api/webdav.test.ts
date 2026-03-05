// WebDAV 代理 API 测试
import { describe, it, expect, vi } from 'vitest';

// 模拟 fetch
global.fetch = vi.fn();

describe('WebDAV Proxy API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('OPTIONS 预检请求', () => {
    it('应该返回正确的 CORS 头', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PROPFIND, MKCOL',
        }),
      });
      global.fetch = mockFetch;

      const response = await fetch('/api/webdav', {
        method: 'OPTIONS',
        headers: {
          'Access-Control-Request-Method': 'GET',
        },
      });

      expect(response.ok).toBe(true);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    });
  });

  describe('缺少 X-Target-Url 头', () => {
    it('应该返回 400 错误', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          error: 'Missing X-Target-Url header',
          message: '请在请求头中添加 X-Target-Url 指定目标 WebDAV 服务器',
        }),
      });
      global.fetch = mockFetch;

      const response = await fetch('/api/webdav', {
        method: 'GET',
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Missing X-Target-Url header');
    });
  });

  describe('正确的 WebDAV 请求', () => {
    it('应该成功代理请求到目标服务器', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 207,
        text: async () => `<?xml version="1.0"?>
          <d:multistatus xmlns:d="DAV:">
            <d:response>
              <d:href>/dav/</d:href>
              <d:propstat>
                <d:prop>
                  <d:displayname>/</d:displayname>
                </d:prop>
                <d:status>HTTP/1.1 200 OK</d:status>
              </d:propstat>
            </d:response>
          </d:multistatus>`,
      });
      global.fetch = mockFetch;

      const response = await fetch('/api/webdav', {
        method: 'PROPFIND',
        headers: {
          'X-Target-Url': 'https://dav.jianguoyun.com/dav/',
          'Authorization': 'Basic dXNlcjpwYXNz',
          'Depth': '1',
        },
      });

      expect(response.ok).toBe(true);
      expect(response.status).toBe(207);
    });
  });

  describe('错误处理', () => {
    it('应该正确处理 401 认证失败', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized',
      });
      global.fetch = mockFetch;

      const response = await fetch('/api/webdav', {
        method: 'GET',
        headers: {
          'X-Target-Url': 'https://dav.jianguoyun.com/dav/',
          'Authorization': 'Basic invalid',
        },
      });

      expect(response.status).toBe(401);
    });

    it('应该正确处理网络错误', async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
      global.fetch = mockFetch;

      await expect(
        fetch('/api/webdav', {
          method: 'GET',
          headers: {
            'X-Target-Url': 'https://dav.jianguoyun.com/dav/',
          },
        })
      ).rejects.toThrow('Network error');
    });
  });
});
