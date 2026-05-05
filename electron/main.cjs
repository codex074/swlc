const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { app, BrowserWindow, net, protocol, shell } = require('electron');

const APP_PROTOCOL = 'app';
const DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;
const DIST_DIR = path.join(__dirname, '..', 'dist');

protocol.registerSchemesAsPrivileged([
  {
    scheme: APP_PROTOCOL,
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      stream: true,
    },
  },
]);

function isSafeInternalUrl(targetUrl) {
  if (!targetUrl) {
    return false;
  }

  if (DEV_SERVER_URL && targetUrl.startsWith(DEV_SERVER_URL)) {
    return true;
  }

  return targetUrl.startsWith(`${APP_PROTOCOL}://`);
}

async function registerAppProtocol() {
  await protocol.handle(APP_PROTOCOL, (request) => {
    const { pathname } = new URL(request.url);
    const relativePath = pathname === '/' ? '/index.html' : pathname;
    const filePath = path.join(DIST_DIR, decodeURIComponent(relativePath));

    return net.fetch(pathToFileURL(filePath).toString());
  });
}

function wireNavigationGuards(window) {
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (!isSafeInternalUrl(url)) {
      shell.openExternal(url);
      return { action: 'deny' };
    }

    return { action: 'allow' };
  });

  window.webContents.on('will-navigate', (event, url) => {
    if (!isSafeInternalUrl(url)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });
}

async function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 1100,
    minHeight: 760,
    autoHideMenuBar: true,
    backgroundColor: '#eff6ff',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  wireNavigationGuards(mainWindow);

  if (DEV_SERVER_URL) {
    await mainWindow.loadURL(DEV_SERVER_URL);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
    return;
  }

  await mainWindow.loadURL(`${APP_PROTOCOL}://-/index.html`);
}

app.whenReady().then(async () => {
  if (!DEV_SERVER_URL) {
    await registerAppProtocol();
  }

  await createMainWindow();

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
