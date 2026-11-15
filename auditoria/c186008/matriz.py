import os,sys,json,subprocess,time,hashlib
from pathlib import Path
repo=Path('/tmp/eear-audit3-runtime');out=Path('/tmp/eear-propriedades-c186008');g=sys.argv[1]
env=dict(os.environ,EEAR_REPO_REPROVADO_IA05='/tmp/eear-audit2-runtime',EEAR_REPO_CLIENTE_V3='/tmp/eear-ia05-verificado',NODE_PATH='/tmp/eear-audit-deps/node_modules',PLAYWRIGHT_BROWSERS_PATH='/tmp/eear-audit-browsers',EEAR_FIREBASE_SDK='/tmp/eear-audit-deps/node_modules/firebase',EEAR_FIREBASE_CLI='/tmp/eear-audit-deps/node_modules/.bin/firebase',EEAR_REPO_ALVO=str(repo),EEAR_REPO_LEGADO='/tmp/eear-2f6cad6',EEAR_REPO_REPROVADO='/tmp/eear-audit-a35-source')
linhas=subprocess.check_output(['git','ls-tree','-r','HEAD'],cwd=repo,text=True).splitlines();entradas=[]
for linha in linhas:
 meta,nome=linha.split('\t',1);modo,tipo,sha=meta.split()
 if tipo=='blob' and (nome.startswith(('curso/','web/','testes/','.github/workflows/')) or nome in ['firebase.json','.firebaserc']):entradas.append(dict(path=nome,sha=sha))
def conferir():
 for x in entradas:
  p=repo/x['path'];b=p.read_bytes();s=hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()
  assert s==x['sha'],x['path']
 return hashlib.sha256((repo/'curso/app.js').read_bytes()).hexdigest()
casos={
'firebase': [('firebase-53','node testes/firebase-emulador.test.js',{}),('persistencia-13','node testes/persistencia-regressoes.test.js',{}),('dupla-falha','node testes/operacoes-dupla-falha.test.js',{}),('sincronia-firebase','node testes/sincronia-firebase.test.js',{}),('f01-riscos','node testes/f01-riscos.test.js',{'EEAR_F01_RISCOS':'zerar-nuvem,zerar-unica,suspensa,exclusao-surda,contagens,escrita-interrompida'}),('diarios','node testes/diarios-auditoria.test.js',{}),('orfaos-9','node testes/orfaos-auditoria.test.js',{'EEAR_ORFAOS_CENARIOS':'segunda-escrita-30min','EEAR_ORFAOS_SEQUENCIAS':'9'}),('crash-sem-locks','node testes/duravel-candidato.test.js',{'EEAR_DURAVEL_SEM_TRAVAS':'1'}),('migracao-8bd','node testes/diario-legado-auditoria.test.js',{'EEAR_REPO_LEGADO':'/tmp/eear-8bd32d2'}),('migracao-2f6','node testes/diario-legado-auditoria.test.js',{}),('metadados-limite','node testes/metadados-limite.test.js',{'EEAR_CARGA_ESTADO':str(out/'estado-limite.json')})],
'bloqueadores':[('bloqueadores-originais','node testes/bloqueadores-auditoria.test.js',{}),('ia05-ia06-integral','node testes/importacoes-regressoes.test.js',{})],
'local':[('montagem','python3 -I web/montar_app.py --conferir',{}),('integridade','python3 -I web/verificar_publicacao.py validar',{}),('workflows','python3 -I web/verificar_publicacao.py conferir-workflows',{}),('lint','/tmp/eear-audit-deps/node_modules/.bin/eslint curso/app.js curso/app curso/dados web/sw.js testes',{}),('hosting-autoteste','python3 -I web/verificar_publicacao.py autoteste',{}),('hosting-sondas','python3 testes/hosting-auditoria.py .',{}),('hosting-gates','python3 testes/hosting-gates-auditoria.py .',{}),('hosting-contextos','python3 testes/hosting-contexto-auditoria.py .',{}),('operacoes','node testes/operacoes.test.js',{}),('transferencia-algebra','node testes/transferencia-identidades.test.js',{}),('importacao-propriedades','node testes/importacoes-propriedades.test.js',{}),('legado-contrato','node testes/legado-contrato.test.js',{}),('legado-bloqueio','node testes/legado-bloqueio.test.js',{}),('ciclo','node testes/ciclo-sincronia.test.js',{}),('plataforma','node testes/plataforma.test.js',{}),('cache','node testes/cache-restaurado.test.js',{}),('depurador','node testes/depurador-transacao.test.js',{}),('carga-nucleo','node testes/carga-nucleo.test.js',{'EEAR_CARGA_ESTADO':str(out/'estado-limite.json')}),('carga-navegador','node testes/carga-metadados.test.js',{'EEAR_CARGA_SAIDA':str(out/'carga-medidas.json')})]
}[g]
r=[]
for nome,cmd,variaveis in casos:
 h=conferir();start=time.time()
 if nome=='metadados-limite' and not (out/'estado-limite.json').exists():
  print('Carga ainda não produziu entrada de limite; grupo pendente, não aprovado.',flush=True);break
 with (out/(nome+'.log')).open('w') as f:p=subprocess.run(cmd.split(),cwd=repo,env=dict(env,**variaveis),stdout=f,stderr=subprocess.STDOUT)
 depois=conferir();x=dict(nome=nome,comando=cmd,variaveis=variaveis,exit=p.returncode,segundos=round(time.time()-start,2),sha256Antes=h,sha256Depois=depois,arquivosConferidos=len(entradas));r.append(x);(out/('final-'+g+'-resultados.json')).write_text(json.dumps(r,indent=2));print(json.dumps(x),flush=True)
