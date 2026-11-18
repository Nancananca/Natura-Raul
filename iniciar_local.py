"""Arranca exclusivamente esta entrega de Natura; reutiliza su servidor si existe."""
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from pathlib import Path
from urllib.request import urlopen
from urllib.parse import urlsplit
from functools import partial
import argparse,json,os,subprocess,sys,tempfile,time,webbrowser,hashlib
ROOT=Path(__file__).resolve().parent
REV='20261118-r13'
IDENTITY=hashlib.sha256(str(ROOT).lower().encode()).hexdigest()[:16]
INFO={'project':'Natura Villamayor','revision':REV,'instance':IDENTITY}

class Handler(SimpleHTTPRequestHandler):
 def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(ROOT),**kwargs)
 def end_headers(self):
  self.send_header('Cache-Control','no-store, max-age=0')
  self.send_header('X-Natura-Revision',REV)
  super().end_headers()
 def do_GET(self):
  path=urlsplit(self.path).path
  if path=='/__natura_status':
   data=json.dumps(INFO).encode();self.send_response(200);self.send_header('Content-Type','application/json');self.send_header('Content-Length',str(len(data)));self.end_headers();self.wfile.write(data);return
  if path=='/':
   self.send_response(302);self.send_header('Location','/index.html?revision='+REV+'#inicio');self.send_header('Content-Length','0');self.end_headers();return
  return super().do_GET()
 def list_directory(self,path):self.send_error(404,'Abre la plataforma desde index.html.');return None

def verify():
 required=['index.html','assets/opciones.js','assets/paquete.js','assets/lector.js','assets/cliente.js','assets/experiencia.js']
 for file in ['documentos.json','documentos-opcion1.json','documentos-opcion2.json']:
  path=ROOT/'assets'/file
  required.append('assets/'+file)
  if path.is_file():
   for doc in json.loads(path.read_text(encoding='utf-8')).values():required.extend(p['src'].split('?')[0] for p in doc['pages'])
 manifest=ROOT/'MANIFIESTO_SHA256.json'
 if manifest.is_file():required.extend(json.loads(manifest.read_text(encoding='utf-8')).keys())
 missing=[r for r in required if not (ROOT/r).is_file()]
 if missing:raise SystemExit('La entrega está incompleta. Descomprime toda la carpeta. Faltan: '+', '.join(missing[:8]))

def status(port):
 try:
  with urlopen(f'http://127.0.0.1:{port}/__natura_status',timeout=.35) as r:return json.load(r)
 except Exception:return None

def main():
 ap=argparse.ArgumentParser();ap.add_argument('--serve',action='store_true');ap.add_argument('--sin-navegador',action='store_true');ap.add_argument('--comprobar',action='store_true');ap.add_argument('--port',type=int,default=8826);args=ap.parse_args()
 verify()
 if args.comprobar:print('Natura R13: archivos completos.');return
 if args.serve:
  server=ThreadingHTTPServer(('127.0.0.1',args.port),Handler)
  try:server.serve_forever()
  except KeyboardInterrupt:pass
  finally:server.server_close()
  return
 logdir=Path(tempfile.gettempdir())/'Natura130'/IDENTITY;logdir.mkdir(parents=True,exist_ok=True)
 for port in range(args.port,args.port+10):
  current=status(port)
  if current==INFO:break
  if current:continue
  with (logdir/'servidor.log').open('a',encoding='utf-8') as log:
   flags=(subprocess.CREATE_NO_WINDOW|subprocess.CREATE_NEW_PROCESS_GROUP) if os.name=='nt' else 0
   child=subprocess.Popen([sys.executable,str(Path(__file__).resolve()),'--serve','--port',str(port)],cwd=str(ROOT),stdin=subprocess.DEVNULL,stdout=log,stderr=log,creationflags=flags)
  for _ in range(40):
   if status(port)==INFO:break
   if child.poll() is not None:break
   time.sleep(.15)
  if status(port)==INFO:break
 else:raise SystemExit('No se ha podido iniciar Natura. Consulta el registro en '+str(logdir))
 url=f'http://127.0.0.1:{port}/index.html?revision={REV}#inicio'
 print('NATURA / REVISIÓN 18 NOVIEMBRE 2026\n'+url+'\nEl servidor sigue activo al cerrar esta ventana.')
 if not args.sin_navegador:webbrowser.open(url,new=2)

if __name__=='__main__':main()
