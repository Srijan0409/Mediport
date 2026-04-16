// main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');
const startServer = require('./server'); // uses the startServer function we made

let mainWindow;
let serverInstance;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Load your public/index.html
  mainWindow.loadFile(path.join(__dirname, 'Public', 'index.html'));

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  try {
    // Start backend first on port 3000 to match frontend expectations
    serverInstance = await startServer(3000);
    console.log('✅ Backend server started on port 3000');

    // Then open Electron window
    await createWindow();
  } catch (err) {
    console.error('❌ Failed to start app:', err);
    app.quit();
  }
});

app.on('window-all-closed', function () {
  if (serverInstance && serverInstance.close) {
    serverInstance.close();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
