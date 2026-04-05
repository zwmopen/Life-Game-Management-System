import http from 'http';
import https from 'https';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BackupManager } from '@/utils/BackupManager';
import dataPersistenceManager from '@/utils/DataPersistenceManager';
import { storeWebDAVConfig } from '@/utils/secureStorage';
import WebDAVClient from '@/utils/webdavClient';

const webdavConfig = {
  url: process.env.JIANGUOYUN_URL || 'https://dav.jianguoyun.com/dav/',
  username: process.env.JIANGUOYUN_USERNAME || '',
  password: process.env.JIANGUOYUN_PASSWORD || '',
  basePath: process.env.JIANGUOYUN_BASE_PATH || '/人生游戏管理系统',
};

const describeIfConfigured = webdavConfig.username && webdavConfig.password ? describe : describe.skip;

const STORAGE_METHOD_KEYS = new Set([
  'getItem',
  'setItem',
  'removeItem',
  'clear',
  'key',
  'length',
]);

function createProxyHeaders(url: URL, headers: Record<string, string>, body: string) {
  const sanitizedHeaders: Record<string, string> = {};

  Object.entries(headers).forEach(([key, value]) => {
    const lowerKey = key.toLowerCase();
    if (lowerKey === 'host' || lowerKey === 'content-length') {
      return;
    }

    sanitizedHeaders[key] = value;
  });

  sanitizedHeaders.Host = url.hostname;

  if (body) {
    sanitizedHeaders['Content-Length'] = Buffer.byteLength(body).toString();
  }

  return sanitizedHeaders;
}

async function proxyWebDAVRequest(payload: {
  targetUrl: string;
  method: string;
  headers?: Record<string, string>;
  body?: string;
}) {
  const url = new URL(payload.targetUrl);
  const requestModule = url.protocol === 'https:' ? https : http;
  const body = payload.body || '';
  const headers = createProxyHeaders(url, payload.headers || {}, body);

  return await new Promise<{
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: string;
  }>((resolve, reject) => {
    const request = requestModule.request(
      {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + url.search,
        method: payload.method,
        headers,
      },
      response => {
        const chunks: Buffer[] = [];

        response.on('data', chunk => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });

        response.on('end', () => {
          const responseHeaders: Record<string, string> = {};
          Object.entries(response.headers).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              responseHeaders[key] = value.join(', ');
            } else if (typeof value === 'string') {
              responseHeaders[key] = value;
            }
          });

          resolve({
            status: response.statusCode || 500,
            statusText: response.statusMessage || 'Unknown Error',
            headers: responseHeaders,
            body: Buffer.concat(chunks).toString('utf8'),
          });
        });
      }
    );

    request.on('error', reject);
    request.setTimeout(60000, () => {
      request.destroy(new Error('WebDAV integration request timed out after 60000ms'));
    });

    if (body) {
      request.write(body);
    }

    request.end();
  });
}

function joinWebDAVPath(basePath: string, fileName: string) {
  const normalizedBasePath = basePath.trim().replace(/\/+$/, '');

  if (!normalizedBasePath) {
    return `/${fileName}`;
  }

  return `${normalizedBasePath.startsWith('/') ? normalizedBasePath : `/${normalizedBasePath}`}/${fileName}`;
}

describeIfConfigured('WebDAV backup integration', () => {
  let storage: Record<string, string>;

  beforeEach(() => {
    storage = {};

    const getItemMock = localStorage.getItem as unknown as ReturnType<typeof vi.fn>;
    const setItemMock = localStorage.setItem as unknown as ReturnType<typeof vi.fn>;
    const removeItemMock = localStorage.removeItem as unknown as ReturnType<typeof vi.fn>;
    const clearMock = localStorage.clear as unknown as ReturnType<typeof vi.fn>;
    const keyMock = localStorage.key as unknown as ReturnType<typeof vi.fn>;

    clearMock.mockImplementation(() => {
      Object.keys(storage).forEach(key => {
        delete storage[key];
      });

      Object.keys(localStorage).forEach(key => {
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

    Object.defineProperty(window, 'lifeGameElectron', {
      configurable: true,
      writable: true,
      value: {
        platform: 'electron',
        webdavRequest: proxyWebDAVRequest,
      },
    });

    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    delete (window as typeof window & { lifeGameElectron?: unknown }).lifeGameElectron;
  });

  it(
    'backs up to Jianguoyun and restores the same data',
    async () => {
      const backupId = `codex-webdav-${Date.now()}`;
      const client = new WebDAVClient(webdavConfig);
      const manager = new BackupManager({
        localAutoBackup: false,
        cloudAutoBackup: true,
        backupInterval: 0,
      });

      storeWebDAVConfig(webdavConfig);

      localStorage.setItem(
        'aes-global-data-v3',
        JSON.stringify({
          source: 'integration-test-before-backup',
          value: backupId,
        })
      );
      localStorage.setItem(
        'life-game-stats-v2',
        JSON.stringify({
          xp: 321,
          coins: 99,
        })
      );
      dataPersistenceManager.setItem('integration-custom-key', {
        marker: backupId,
        score: 42,
      });

      try {
        await manager.initialize(true);

        const backupInfo = await manager.createCloudBackup(backupId);
        expect(backupInfo.status).toBe('success');

        const backups = await manager.getCloudBackupList();
        expect(backups.some(backup => backup.id === backupId)).toBe(true);

        localStorage.setItem(
          'aes-global-data-v3',
          JSON.stringify({
            source: 'integration-test-after-mutation',
            value: 'mutated',
          })
        );
        localStorage.removeItem('life-game-stats-v2');
        dataPersistenceManager.removeItem('integration-custom-key');

        const restoreResult = await manager.restoreFromCloudBackup(backupId);
        expect(restoreResult.success).toBe(true);

        expect(JSON.parse(localStorage.getItem('aes-global-data-v3') || '{}')).toEqual({
          source: 'integration-test-before-backup',
          value: backupId,
        });
        expect(JSON.parse(localStorage.getItem('life-game-stats-v2') || '{}')).toEqual({
          xp: 321,
          coins: 99,
        });
        expect(dataPersistenceManager.getItem('integration-custom-key')).toEqual({
          marker: backupId,
          score: 42,
        });
      } finally {
        manager.destroy();
        await client.deleteFile(joinWebDAVPath(webdavConfig.basePath, `${backupId}.json`));
      }
    },
    120000
  );
});
