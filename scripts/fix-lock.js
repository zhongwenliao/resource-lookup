// 临时脚本：将 package-lock.json 中内网源替换为 npm 公网源
const fs = require('fs');
const path = require('path');

const lockPath = path.join(__dirname, '..', 'package-lock.json');
let content = fs.readFileSync(lockPath, 'utf8');
content = content.replace(
  /http:\/\/r\.tnpm\.oa\.com\/([^/]+)\/download\/(.+?)\.tgz/g,
  'https://registry.npmjs.org/$1/-/$2.tgz'
);
fs.writeFileSync(lockPath, content, 'utf8');
const remaining = (content.match(/tnpm/g) || []).length;
console.log('done, remaining tnpm refs:', remaining);
