// 预加载脚本：contextIsolation 下向渲染进程安全暴露主进程能力（不放开 nodeIntegration）
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // 随应用打包的 BarTender 模板列表（static/ 中的 .btw，返回解包后的绝对路径）
  listBtwTemplates: () => ipcRenderer.invoke('btw:list-templates'),
  // 直接调起本机 BarTender 执行 BTXML 打印任务（xml 为脚本内容，主进程写临时文件后调 BarTend.exe）
  printBtxml: (xml) => ipcRenderer.invoke('btw:print-btxml', xml),
  // 授权:查询试用期/激活状态;输入授权码激活(与机器码绑定)
  getLicenseState: () => ipcRenderer.invoke('license:get-state'),
  activateLicense: (code) => ipcRenderer.invoke('license:activate', code)
});
