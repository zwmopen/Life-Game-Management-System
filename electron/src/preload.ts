require('./rt/electron-rt');
//////////////////////////////
// User Defined Preload scripts below
console.log('User Preload!');

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('lifeGameElectron', {
  platform: 'electron',
  webdavRequest: (payload: {
    targetUrl: string;
    method: string;
    headers?: Record<string, string>;
    body?: string;
  }) => ipcRenderer.invoke('webdav:request', payload),
});
