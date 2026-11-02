from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from pathlib import Path
import threading, webbrowser
root=Path(__file__).resolve().parent
for port in range(8810,8830):
    try:
        server=ThreadingHTTPServer(('127.0.0.1',port),partial(SimpleHTTPRequestHandler,directory=str(root)))
        break
    except OSError:
        continue
else:
    raise SystemExit('No hay un puerto local disponible entre 8810 y 8829.')
url=f'http://127.0.0.1:{port}/index.html'
print('NATURA · NANCA × CUEVA\n'+url+'\nCtrl+C para detener el servidor.')
threading.Timer(.5,lambda:webbrowser.open(url)).start()
try:
    server.serve_forever()
except KeyboardInterrupt:
    pass
finally:
    server.server_close()
