const { app, BrowserWindow, ipcMain, Menu, dialog, ipcRenderer, globalShortcut} = require('electron');
const path = require('path');
const {writeFile,readFile} = require('fs');
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}
var fpath = null
const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 540,
    frame: false,
    webPreferences:{
      nodeIntegration:true,
      contextIsolation:false
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  ipcMain.on("close",()=>{
    app.quit()
  })
  ipcMain.on("min",()=>{
    mainWindow.minimize()
  })
  ipcMain.on("max",()=>{
    if (mainWindow.isMaximized()){
      mainWindow.unmaximize()
    }
    else{
    mainWindow.maximize()
    }
  })
  globalShortcut.register("Ctrl+O",()=>{
    dialog.showOpenDialog(mainWindow,{properties:["openFile"]}).then(
    res=>{
      if (!res.canceled){
        let txt = readFile(res.filePaths[0],{encoding:"utf-8"},(err,data)=>{mainWindow.webContents.send("fileopened",data)})
        fpath = res.filePaths[0]
      }
    }
  ).catch(
    (reason)=>{
      console.log(reason)
    }
  )
})
  globalShortcut.register("Ctrl+Shift+S",()=>{
    dialog.showSaveDialog(mainWindow,{properties:["showOverwriteConfirmation","showHiddenFiles"]}).then(
      npath =>{
        mainWindow.webContents.send("wrreq","quick")
        ipcMain.on("txtoftxtarea",(event,data)=>{
          console.log(data)
          writeFile(npath.filePath,data,(err)=>{
            if (err){
              console.log(err)
            }
          })
        })
        
      }
    ).catch(reason=>{
      console.log(reason)
    })
  }

  )
  globalShortcut.register("Ctrl+S",()=>{
    if (fpath === null){
      dialog.showMessageBox(mainWindow,{type:"warning",message:"Pls kindly open a file first!",buttons:["Ok"]})
    }
    else{
      let filepath = fpath
      mainWindow.webContents.send("givemedata","quick")
      ipcMain.on("txtoftxtarea2",(event,data)=>{
        console.log(data)
        writeFile(filepath,data,(err)=>{
          if (err){
          dialog.showErrorBox("Error",err)
          }
        })
      })
      
    }
  
})
  mainWindow.webContents.on("did-finish-load",()=>{
    
  })
  var menus = [
    {
      label:"Dev",
      submenu:[{
        label:"Inspect",
        click: ()=>{
          mainWindow.webContents.openDevTools()
        }
      }]
    },
    {
      label:"File",
      submenu:[{
        label:"Open",
        accelerator:"Ctrl+O",
        click: ()=>{
            dialog.showOpenDialog(mainWindow,{properties:["openFile"]}).then(
            res=>{
              if (!res.canceled){
                let txt = readFile(res.filePaths[0],{encoding:"utf-8"},(err,data)=>{mainWindow.webContents.send("fileopened",data)})
                fpath = res.filePaths[0]
              }
            }
          ).catch(
            (reason)=>{
              console.log(reason)
            }
          )
        }
      },
    {
      label:"Save as",
      accelerator:"Ctrl+Shift+S",
      click: ()=>{
        dialog.showSaveDialog(mainWindow,{properties:["showOverwriteConfirmation","showHiddenFiles"]}).then(
          npath =>{
            mainWindow.webContents.send("wrreq","quick")
            ipcMain.on("txtoftxtarea",(event,data)=>{
              console.log(data)
              writeFile(npath.filePath,data,(err)=>{
                if (err){
                  console.log(err)
                }
              })
            })
            
          }
        ).catch(reason=>{
          console.log(reason)
        })
      }
    },{
      label:"Save",
      accelerator:"Ctrl+S",
      click:()=>{
          if (fpath === null){
            dialog.showMessageBox(mainWindow,{type:"warning",message:"Pls kindly open a file first!",buttons:["Ok"]})
          }
          else{
            let filepath = fpath
            mainWindow.webContents.send("givemedata","quick")
            ipcMain.on("txtoftxtarea2",(event,data)=>{
              console.log(data)
              writeFile(filepath,data,(err)=>{
                if (err){
                dialog.showErrorBox("Error",err)
                }
              })
            })
            
          }
        
      }
    }]
    }
  ]
  var menub = Menu.buildFromTemplate(menus)
  ipcMain.on("opm",(event,args)=>{
    menub.popup({
      window:mainWindow,
      x:10,
      y:args+3
    })
  })
  // Open the DevTools.
  //mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
