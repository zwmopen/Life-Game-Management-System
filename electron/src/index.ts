import type { CapacitorElectronConfig } from '@capacitor-community/electron';
import { getCapacitorElectronConfig, setupElectronDeepLinking } from '@capacitor-community/electron';
import type { MenuItemConstructorOptions } from 'electron';
import { app, ipcMain, MenuItem } from 'electron';
import electronIsDev from 'electron-is-dev';
import { existsSync } from 'fs';
import http from 'http';
import https from 'https';
import path from 'path';
import unhandled from 'electron-unhandled';
import { autoUpdater } from 'electron-updater';

import { ElectronCapacitorApp, setupContentSecurityPolicy, setupReloadWatcher } from './setup';

// Graceful handling of unhandled errors.
unhandled();

// Define our menu templates (these are optional)
const trayMenuTemplate: (MenuItemConstructorOptions | MenuItem)[] = [new MenuItem({ label: 'Quit App', role: 'quit' })];
const appMenuBarMenuTemplate: (MenuItemConstructorOptions | MenuItem)[] = [
  { role: process.platform === 'darwin' ? 'appMenu' : 'fileMenu' },
  { role: 'viewMenu' },
];

// Get Config options from capacitor.config
const capacitorFileConfig: CapacitorElectronConfig = getCapacitorElectronConfig();

// Initialize our app. You can pass menu templates into the app here.
// const myCapacitorApp = new ElectronCapacitorApp(capacitorFileConfig);
const myCapacitorApp = new ElectronCapacitorApp(capacitorFileConfig, trayMenuTemplate, appMenuBarMenuTemplate);

// If deeplinking is enabled then we will set it up here.
if (capacitorFileConfig.electron?.deepLinkingEnabled) {
  setupElectronDeepLinking(myCapacitorApp, {
    customProtocol: capacitorFileConfig.electron.deepLinkingCustomProtocol ?? 'mycapacitorapp',
  });
}

// If we are in Dev mode, use the file watcher components.
if (electronIsDev) {
  setupReloadWatcher(myCapacitorApp);
}

interface WebDAVProxyPayload {
  targetUrl: string;
  method: string;
  headers?: Record<string, string>;
  body?: string;
}

function sanitizeProxyHeaders(url: URL, headers: Record<string, string>, body: string) {
  const sanitizedHeaders: Record<string, string> = {};

  for (const [key, value] of Object.entries(headers)) {
    const headerKey = key.toLowerCase();
    if (headerKey === 'host' || headerKey === 'content-length') {
      continue;
    }
    sanitizedHeaders[key] = value;
  }

  sanitizedHeaders.Host = url.hostname;

  if (body) {
    sanitizedHeaders['Content-Length'] = Buffer.byteLength(body).toString();
  } else {
    delete sanitizedHeaders['Content-Length'];
  }

  return sanitizedHeaders;
}

async function proxyWebDAVRequest(payload: WebDAVProxyPayload) {
  const { targetUrl, method, headers = {}, body = '' } = payload;
  const url = new URL(targetUrl);
  const requestModule = url.protocol === 'https:' ? https : http;
  const requestHeaders = sanitizeProxyHeaders(url, headers, body);

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
        method,
        headers: requestHeaders,
      },
      response => {
        const chunks: Buffer[] = [];
        response.on('data', chunk => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });
        response.on('end', () => {
          const responseBody = Buffer.concat(chunks).toString('utf8');
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
            body: responseBody,
          });
        });
      }
    );

    request.on('error', error => {
      reject(error);
    });

    request.setTimeout(60000, () => {
      request.destroy(new Error('WebDAV request timed out after 60000ms'));
    });

    if (body) {
      request.write(body);
    }

    request.end();
  });
}

ipcMain.handle('webdav:request', async (_event, payload: WebDAVProxyPayload) => {
  return await proxyWebDAVRequest(payload);
});

function shouldCheckForUpdates() {
  if (!app.isPackaged) {
    return false;
  }

  const updateConfigPath = path.join(process.resourcesPath, 'app-update.yml');
  return existsSync(updateConfigPath);
}

async function safelyCheckForUpdates() {
  if (!shouldCheckForUpdates()) {
    console.info('[updater] Skip update check: app-update.yml not found for this build.');
    return;
  }

  try {
    await autoUpdater.checkForUpdatesAndNotify();
  } catch (error) {
    console.error('[updater] Update check failed:', error);
  }
}

// Run Application
(async () => {
  // Wait for electron app to be ready.
  await app.whenReady();
  // Security - Set Content-Security-Policy based on whether or not we are in dev mode.
  setupContentSecurityPolicy(myCapacitorApp.getCustomURLScheme());
  // Initialize our app, build windows, and load content.
  await myCapacitorApp.init();
  // Only check for updates when the packaged app includes updater metadata.
  await safelyCheckForUpdates();
})();

// Handle when all of our windows are close (platforms have their own expectations).
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// When the dock icon is clicked.
app.on('activate', async function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (myCapacitorApp.getMainWindow().isDestroyed()) {
    await myCapacitorApp.init();
  }
});

// Place all ipc or other electron api calls and custom functionality under this line
