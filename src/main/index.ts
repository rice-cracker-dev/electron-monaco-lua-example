import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import luauLsp from '../../resources/luau-lsp.exe?asset&asarUnpack'
import apiDocs from '../../resources/api-docs.json?commonjs-external&asset'
import definitions from '../../resources/globalTypes.PluginSecurity.d.luau?asset&asarUnpack'
import { fileURLToPath } from 'url'
import { WebSocketServer } from 'ws'
import { startLanguageServer } from './languageServer'
import { IWebSocket } from 'vscode-ws-jsonrpc/socket'

const startServerProcess = (socket: IWebSocket): void =>
  startLanguageServer(socket, {
    serverName: 'lua',
    command: luauLsp,
    commandArgs: ['lsp', `--definitions=${definitions}`, `--docs=${apiDocs}`]
  })

// launch lsp
new WebSocketServer({ port: 3060 }).on('connection', (ws) => {
  const socket: IWebSocket = {
    send: (content) =>
      ws.send(content, (err) => {
        console.log(content)
        if (err) throw err
      }),

    onMessage: (callback) =>
      ws.on('message', (data) => {
        console.log(JSON.stringify(data))
        callback(data)
      }),
    onError: (callback) => ws.on('error', callback),
    onClose: (callback) => ws.on('close', callback),
    dispose: () => ws.close()
  }

  if (ws.readyState === ws.OPEN) {
    startServerProcess(socket)
  } else {
    ws.on('open', () => startServerProcess(socket))
  }
})

const createWindow = (): void => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: fileURLToPath(new URL('../preload/index.mjs', import.meta.url)),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(fileURLToPath(new URL('../renderer/index.html', import.meta.url)))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
