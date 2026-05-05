const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('swlcDesktop', {
  platform: process.platform,
  isDesktop: true,
});
