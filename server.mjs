import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const root = path.dirname(fileURLToPath(import.meta.url));
const publicRoot = path.join(root, 'public');
const maxImageBytes = 8 * 1024 * 1024;
const contentTypes = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon'};

function send(res, status, body, type = 'application/json; charset=utf-8') {
  res.writeHead(status, {'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []; let size = 0;
    req.on('data', chunk => { size += chunk.length; if (size > maxImageBytes) { reject(new Error('Ảnh lớn hơn 8 MB.')); req.destroy(); } else chunks.push(chunk); });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function typeOfImage(buf) {
  if (buf.length > 8 && buf.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return '.png';
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return '.jpg';
  if (buf.length > 12 && buf.toString('ascii',0,4) === 'RIFF' && buf.toString('ascii',8,12) === 'WEBP') return '.webp';
  return null;
}

function recognize(file) {
  return new Promise((resolve, reject) => {
    const proc = spawn(process.env.TESSERACT_CMD || 'tesseract',[file,'stdout','-l','vie+eng','--tessdata-dir',path.join(root,'tessdata'),'-c','tessedit_create_tsv=1','-c','tessedit_create_txt=0'],{stdio:['ignore','pipe','pipe']});
    let output = '', error = '', settled = false;
    const timer = setTimeout(() => proc.kill('SIGKILL'), 45000);
    proc.stdout.setEncoding('utf8'); proc.stderr.setEncoding('utf8');
    proc.stdout.on('data', c => { output += c; if (output.length > 12_000_000) proc.kill('SIGKILL'); });
    proc.stderr.on('data', c => error += c.slice(0,3000));
    proc.on('error', e => { if (!settled) { settled = true; clearTimeout(timer); reject(e); } });
    proc.on('close', code => { if (settled) return; settled = true; clearTimeout(timer); code === 0 ? resolve(output) : reject(new Error(error || 'OCR không hoàn tất.')); });
  });
}

function linesFromTsv(tsv) {
  const groups = new Map();
  for (const row of tsv.split(/\r?\n/).slice(1)) {
    const cols = row.split('\t');
    if (cols.length < 12 || cols[0] !== '5' || !cols.slice(11).join('\t').trim()) continue;
    const key = cols.slice(1,5).join('-');
    const item = groups.get(key) || {words:[],left:Infinity,top:Infinity,right:0,bottom:0};
    item.words.push(cols.slice(11).join('\t').trim());
    const [left,top,width,height] = cols.slice(6,10).map(Number);
    item.left=Math.min(item.left,left); item.top=Math.min(item.top,top); item.right=Math.max(item.right,left+width); item.bottom=Math.max(item.bottom,top+height);
    groups.set(key,item);
  }
  return [...groups.values()].sort((a,b)=>a.top-b.top||a.left-b.left).map((g,i)=>({id:`L${i+1}`,text:g.words.join(' '),bbox:{left:g.left,top:g.top,width:g.right-g.left,height:g.bottom-g.top}}));
}

const server = http.createServer(async (req,res) => {
  if (req.method === 'POST' && req.url === '/api/ocr') {
    let folder;
    try {
      const bytes = await readBody(req);
      const ext = typeOfImage(bytes);
      if (!ext) return send(res,415,{error:'Chọn ảnh PNG, JPEG hoặc WebP hợp lệ.'});
      folder = await fs.mkdtemp(path.join(os.tmpdir(),'nhac-dung-viec-'));
      const image = path.join(folder,'upload'+ext);
      await fs.writeFile(image,bytes,{mode:0o600});
      const lines = linesFromTsv(await recognize(image));
      return send(res,200,{lines});
    } catch (err) {
      if (!res.destroyed) send(res,500,{error:err.code === 'ENOENT' ? 'Không tìm thấy Tesseract. Hãy cài Tesseract OCR rồi chạy lại.' : `Không đọc được ảnh: ${err.message}`});
    } finally { if (folder) await fs.rm(folder,{recursive:true,force:true}); }
    return;
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res,405,{error:'Method not allowed'});
  let filename;
  try { filename = decodeURIComponent(new URL(req.url,'http://localhost').pathname); } catch { return send(res,400,{error:'Đường dẫn không hợp lệ'}); }
  const safe = path.resolve(publicRoot,'.'+filename.replace(/\/$/,'/index.html'));
  if (!safe.startsWith(publicRoot + path.sep)) return send(res,403,{error:'Forbidden'});
  try {
    const data = await fs.readFile(safe);
    return send(res,200,req.method === 'HEAD' ? '' : data,contentTypes[path.extname(safe)] || 'application/octet-stream');
  } catch { return send(res,404,{error:'Không tìm thấy trang.'}); }
});

const port = Number(process.env.PORT || 4173);
server.listen(port,'127.0.0.1',()=>console.log(`Nhắc Đúng Việc: http://localhost:${port}`));
