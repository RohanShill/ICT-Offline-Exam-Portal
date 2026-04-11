const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

// 1. Ensure absolute persistence for SQLite DB when packed into Read-Only App.asar
const userDataPath = app.getPath('userData');
process.env.DB_PATH = path.join(userDataPath, 'exam.db');

if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
}

let mainWindow;

// Get Local IP Address for Students
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const devName in interfaces) {
        const iface = interfaces[devName];
        for (let i = 0; i < iface.length; i++) {
            const alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
    return '127.0.0.1';
}

ipcMain.handle('get-ip', () => getLocalIP());

// Core Express Injection
let { app: expressApp, server: expressServer } = require('./backend/server.js');

// ─── Native IP Activity Tracking ──────────────────────────────
const activeIPs = new Map();
expressApp.use((req, res, next) => {
    // Track unique connected LAN devices automatically
    if (req.ip && !req.ip.includes('127.0.0.1') && !req.ip.includes('::1')) {
        activeIPs.set(req.ip, Date.now());
    }
    next();
});

ipcMain.handle('get-active-students', () => {
    const now = Date.now();
    let count = 0;
    for (const [ip, time] of activeIPs.entries()) {
        if (now - time < 30000) count++; // Consider active if seen within 30 seconds
        else activeIPs.delete(ip); // Prune old IPs
    }
    return count;
});

// ─── Start/Stop Server Controls ────────────────────────────────
ipcMain.handle('start-server', () => {
    if (!expressServer) {
        expressServer = expressApp.listen(3000, '0.0.0.0');
    }
    return true;
});

ipcMain.handle('stop-server', () => {
    if (expressServer) {
        expressServer.close();
        expressServer = null;
    }
    return false;
});

// ─── External Opening Hooks ──────────────────────────────────
ipcMain.handle('open-admin', () => shell.openExternal('http://localhost:3000/admin/login'));
ipcMain.handle('open-student', () => shell.openExternal('http://localhost:3000/'));

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        autoHideMenuBar: true,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    setTimeout(() => {
        mainWindow.loadFile('server.html');
        
        mainWindow.once('ready-to-show', () => {
            mainWindow.center();
            mainWindow.show();
        });
    }, 500);

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});
