import subprocess,time,json
from pathlib import Path
o=Path('/tmp/eear-propriedades-c186008');ps={}
for g in ['firebase','bloqueadores','local','extras']:
 f=(o/('progresso-'+g+'.log')).open('w');a=['python3',str(o/('extras.py' if g=='extras' else 'matriz.py'))]+([] if g=='extras' else [g]);ps[g]=(subprocess.Popen(a,stdout=f,stderr=subprocess.STDOUT),f)
while ps:
 for g,(p,f) in list(ps.items()):
  if p.poll() is not None:print(g+': controlador terminou com '+str(p.returncode),flush=True);f.close();del ps[g]
 print('Matriz integral em andamento: '+', '.join(ps),flush=True)
 if ps:time.sleep(20)
r=[]
for g,total in [('firebase',11),('bloqueadores',2),('local',19),('extras',10)]:
 p=o/('final-'+g+'-resultados.json');a=json.loads(p.read_text()) if p.exists() else [];falhas=[x['nome'] for x in a if x['exit']!=x.get('exitEsperado',0)];r.append(dict(grupo=g,esperados=total,executados=len(a),falhas=falhas));print(json.dumps(r[-1]),flush=True)
(o/'matriz-integral-resumo.json').write_text(json.dumps(r,indent=2))
raise SystemExit(1 if any(x['esperados']!=x['executados'] or x['falhas'] for x in r) else 0)
