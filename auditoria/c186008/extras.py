import os,subprocess,json,time,hashlib
from pathlib import Path
r=Path('/tmp/eear-audit3-runtime');out=Path('/tmp/eear-propriedades-c186008');(out/'null.json').write_text('null')
env=dict(os.environ,NODE_PATH='/tmp/eear-audit-deps/node_modules',PLAYWRIGHT_BROWSERS_PATH='/tmp/eear-audit-browsers',EEAR_FIREBASE_CONFIG=str(out/'null.json'))
h=hashlib.sha256((r/'curso/app.js').read_bytes()).hexdigest();result=[]
def run(n,args,cwd=r,expected=0,extra={}):
 start=time.time()
 with (out/(n+'.log')).open('w') as f:p=subprocess.run(args,cwd=cwd,env=dict(env,**extra),stdout=f,stderr=subprocess.STDOUT)
 assert hashlib.sha256((r/'curso/app.js').read_bytes()).hexdigest()==h
 x=dict(nome=n,comando=args,cwd=str(cwd),exit=p.returncode,exitEsperado=expected,segundos=round(time.time()-start,2),sha256=h);result.append(x);(out/'final-extras-resultados.json').write_text(json.dumps(result,indent=2));print(json.dumps(x),flush=True)
run('build-site',['python3','web/build.py',str(out/'site')])
run('validar-site',['python3','-I','web/verificar_publicacao.py','verificar',str(out/'site'),'--site'])
run('build-app',['python3','web/build.py',str(out/'app'),'--app'])
run('validar-app',['python3','-I','web/verificar_publicacao.py','verificar',str(out/'app'),'--app'])
for destino in ['site','app']:
 assert (out/destino/'app.js').read_bytes()==(r/'curso/app.js').read_bytes()
run('build-origem-d165',['python3','web/build.py',str(out/'site-d165')],Path('/tmp/eear-legado-encerramento'))
run('atualizacao-transacional',['node','testes/atualizacao-transacional.test.js',str(out/'site-d165'),str(out/'site')])
run('build-origem-2f',['python3','web/build.py',str(out/'site-2f')],Path('/tmp/eear-2f6cad6'))
run('downgrade-historico',['node','testes/atualizacao.js',str(out/'site-2f'),str(out/'site')],expected=1)
run('legado-historico',['node','testes/historicos-legado.test.js'],expected=1)
run('legado-epoca9',['node','testes/historicos-legado.test.js','epoca'],expected=1,extra={'EEAR_EPOCA':'9'})
