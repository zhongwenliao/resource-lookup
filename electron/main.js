// Electron 主进程：质检二维码标签生成器
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { execSync, spawn } = require('child_process');
const license = require('./license');

// 随应用打包的 static 目录：.btw 模板经 asarUnpack 解包到 app.asar.unpacked，
// BarTender 等外部程序才能按绝对路径读取（asar 归档内的文件外部程序不可见）
function bundledStaticDir () {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'app.asar.unpacked', 'dist', 'static');
  }
  // 开发模式：优先读源码 static/（不依赖先 build），不存在再回退 dist/static
  const src = path.join(__dirname, '..', 'static');
  return fs.existsSync(src) ? src : path.join(__dirname, '..', 'dist', 'static');
}

// 列出内置 BarTender 模板（static/ 中的 .btw），返回绝对路径供渲染进程写入 BTXML <Format>
ipcMain.handle('btw:list-templates', () => {
  try {
    return fs.readdirSync(bundledStaticDir())
      .filter(f => /\.btw$/i.test(f))
      .map(f => ({ name: f, path: path.join(bundledStaticDir(), f) }));
  } catch (e) {
    return []; // dist 未构建或目录不存在
  }
});

// 探测本机 BarTend.exe：PATH → 常见安装目录 → 注册表 InstallPath
function findBarTendExe () {
  try {
    const out = execSync('where BarTend', { windowsHide: true, encoding: 'utf8' });
    const hit = out.split(/\r?\n/).map(s => s.trim()).find(s => /\.exe$/i.test(s) && fs.existsSync(s));
    if (hit) return hit;
  } catch (e) { /* PATH 中无 BarTend，继续找 */ }
  const candidates = [
    'C:\\Program Files\\Seagull\\BarTender Suite\\BarTend.exe',
    'C:\\Program Files (x86)\\Seagull\\BarTender Suite\\BarTend.exe'
  ];
  for (const c of candidates) if (fs.existsSync(c)) return c;
  try {
    const out = execSync('reg query "HKLM\\SOFTWARE\\Seagull Scientific\\BarTender" /v InstallPath',
      { windowsHide: true, encoding: 'utf8' });
    const m = out.match(/InstallPath\s+REG_SZ\s+(\S.*)/i);
    if (m) {
      const p = path.join(m[1].trim(), 'BarTend.exe');
      if (fs.existsSync(p)) return p;
    }
  } catch (e) { /* 注册表无此键 */ }
  return null;
}

// ==================== 授权(试用期 + 授权码)====================
// 渲染进程启动时查询状态;过期后界面锁死,激活需输入与机器码绑定的授权码
ipcMain.handle('license:get-state', () => license.getState());
ipcMain.handle('license:activate', (event, code) => license.activate(code));

// 直接打印：BTXML 写临时文件 → 调 BarTend.exe /XMLScript 执行（一键完成，无需命令行）
ipcMain.handle('btw:print-btxml', async (event, xml) => {
  try {
    // 主进程侧授权校验(纵深防御:即使渲染层被绕过,过期后打印通道同样关闭)
    const st = license.getState();
    if (st.status === 'expired') {
      return { ok: false, error: '试用期已结束，请激活后再使用打印功能' };
    }
    if (!xml || typeof xml !== 'string') return { ok: false, error: '打印内容为空' };
    const exe = findBarTendExe();
    if (!exe) {
      return { ok: false, error: '未找到 BarTend.exe：请确认本机已安装 BarTender；若装在非默认目录，请将该目录加入系统 PATH 后重试' };
    }
    const file = path.join(app.getPath('temp'), 'qc-label-' + Date.now() + '.btxml');
    // \ufeff BOM：防止 BarTender 把无 BOM 的 UTF-8 按 ANSI 误读中文
    fs.writeFileSync(file, '\ufeff' + xml, 'utf8');
    const child = spawn(exe, ['/XMLScript=' + file, '/NOSPLASH'], { windowsHide: true });
    const result = await new Promise(resolve => {
      const done = r => resolve(r);
      child.on('error', err => done({ ok: false, error: '调起 BarTender 失败：' + err.message }));
      child.on('spawn', () => done({ ok: true }));
      setTimeout(() => done({ ok: true }), 3000); // 兜底：进程已创建但事件未触发
    });
    if (result.ok) {
      // BarTend 读取脚本需要时间，延迟清理临时文件
      setTimeout(() => { try { fs.unlinkSync(file); } catch (e) { /* 已被清理则忽略 */ } }, 5 * 60 * 1000);
    }
    return result;
  } catch (e) {
    return { ok: false, error: '打印失败：' + e.message };
  }
});

function createWindow () {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    title: '质检二维码标签生成器',
    icon: path.join(__dirname, '..', 'build-res', 'icon.ico'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });
  win.setMenuBarVisibility(false);
  win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});
