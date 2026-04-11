const packager = require('@electron/packager');
const { rebuild } = require('@electron/rebuild');
const path = require('path');
const fs = require('fs');

async function buildApp() {
    console.log('0. Cleaning up conflicting local backend node_modules...');
    const backendModules = path.join(__dirname, 'backend', 'node_modules');
    if (fs.existsSync(backendModules)) {
        fs.rmSync(backendModules, { recursive: true, force: true });
        console.log('✅ Local backend modules wiped to force hoisted ABI bindings.');
    }

    console.log('1. Rebuilding Native SQLite bindings for Electron...');
    try {
        await rebuild({
            buildPath: __dirname,
            electronVersion: '33.3.1',
            onlyModules: ['better-sqlite3'],
            force: true
        });
        console.log('✅ SQLite bound successfully!');
    } catch (e) {
        console.error('❌ SQLite Rebuild failed:', e);
        return;
    }

    console.log('2. Packaging Electron execution shell...');
    try {
        const appPaths = await packager({
            dir: '.',
            name: 'ICT Exam Portal V2',
            platform: 'win32',
            arch: 'x64',
            out: 'final-build',
            asar: true,
            overwrite: true,
            ignore: (filePath) => {
                // electron-packager passes a relative path starting with / or \
                const normalizedPath = filePath.replace(/\\/g, '/');
                
                // Strictly ignore only root-level directories to prevent corrupting node_modules
                if (normalizedPath.startsWith('/backend/node_modules')) return true;
                if (normalizedPath.startsWith('/frontend/src')) return true;
                if (normalizedPath.startsWith('/dist')) return true;
                if (normalizedPath.startsWith('/build-exe')) return true;
                if (normalizedPath.startsWith('/release')) return true;
                if (normalizedPath.startsWith('/final-build')) return true;
                if (normalizedPath.startsWith('/.git')) return true;
                return false;
            }
        });
        console.log(`✅ App packaged successfully into: ${appPaths[0]}`);
        console.log('You can now open the "ICT Exam Portal V2.exe" file in that folder!');
    } catch (e) {
        console.error('❌ Packaging failed:', e);
    }
}

buildApp();
