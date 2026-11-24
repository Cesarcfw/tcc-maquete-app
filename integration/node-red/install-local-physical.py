"""Ativa a API fisica na instancia local existente; preserva a bancada/historico."""
from pathlib import Path
from datetime import datetime
import copy,json,hashlib,os,urllib.request,urllib.error
repo=Path(__file__).resolve().parents[2]
runtime=repo.parent/'samahi-node-red'
target=runtime/'data/flows.json'
url='http://127.0.0.1:1880/flows'
try:
    with urllib.request.urlopen(urllib.request.Request(url,headers={'Node-RED-API-Version':'v2'}),timeout=4) as r: live=json.load(r)
    original=live['flows'];old=json.dumps(live,ensure_ascii=False,indent=2).encode('utf-8')
    with urllib.request.urlopen('http://127.0.0.1:1880/nodes',timeout=4) as r: registered=r.read().decode('utf-8')
    if 'samahi-physical-gateway' not in registered:raise SystemExit('Reinicie o Node-RED para carregar o tipo fisico e execute o instalador novamente. Nenhum fluxo alterado.')
except urllib.error.HTTPError:raise SystemExit('Acesso recusado; nenhum arquivo alterado.')
except urllib.error.URLError as e:
    if not isinstance(e.reason,ConnectionRefusedError):raise SystemExit('Estado da instancia incerto; nenhuma alteracao.')
    live=None;old=target.read_bytes();original=json.loads(old)
merged=copy.deepcopy(original)
source=next(n for n in merged if n['id']=='esp32wifi12udp')
assert source['type']=='udp in' and str(source['port'])=='4210'
assert any(n['id']=='esp32led14out' and n['type']=='udp out' for n in merged)
virtual=next((n for n in merged if n['id']=='samahi-local' and n['type']=='tab'),None)
if virtual:virtual['disabled']=True
if 'samahi-physical-bridge' not in source['wires'][0]:source['wires'][0].append('samahi-physical-bridge')
add=json.loads((repo/'integration/node-red/physical-flows.json').read_text(encoding='utf-8'))
ids={n['id'] for n in add}
merged=[n for n in merged if n['id'] not in ids]+add
assert len({n['id'] for n in merged})==len(merged)
untouched=[n for n in original if n['id'] not in ids|{'esp32wifi12udp','samahi-local'}]
assert all(next(n for n in merged if n['id']==oldnode['id'])==oldnode for oldnode in untouched)
if merged==original:print('API fisica ja preparada.');raise SystemExit(0)
backups=runtime/'backups';backups.mkdir(exist_ok=True)
backup=backups/('flows-before-physical-'+datetime.now().strftime('%Y%m%d-%H%M%S')+'.json');backup.write_bytes(old)
if live:
    req=urllib.request.Request(url,data=json.dumps({'rev':live['rev'],'flows':merged}).encode('utf-8'),method='POST',headers={'Node-RED-API-Version':'v2','Node-RED-Deployment-Type':'flows','Content-Type':'application/json'})
    with urllib.request.urlopen(req,timeout=10) as r:json.load(r)
    mode='API fisica ativada por deploy'
else:
    assert hashlib.sha256(target.read_bytes()).digest()==hashlib.sha256(old).digest(),'Arquivo mudou durante instalacao.'
    temp=target.with_suffix('.physical.tmp');temp.write_text(json.dumps(merged,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');os.replace(temp,target)
    mode='Configuracao preparada; iniciar Node-RED'
print(json.dumps({'mode':mode,'preservedNodes':len(untouched),'backup':str(backup)},ensure_ascii=False))
