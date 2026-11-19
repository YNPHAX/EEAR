import datetime, hashlib, json, os, pathlib, subprocess, sys, time
ROOT = pathlib.Path('/workspace/eear-audit')
OUT = pathlib.Path('/workspace/audit-results')
ENV = dict(os.environ, NODE_PATH='/workspace/audit-tools/node_modules',
    PLAYWRIGHT_BROWSERS_PATH='/workspace/audit-tools/browsers',
    EEAR_FIREBASE_SDK='/workspace/audit-tools/node_modules/firebase',
    EEAR_FIREBASE_CLI='/workspace/audit-tools/node_modules/.bin/firebase',
    FIREBASE_EMULATORS_PATH='/workspace/audit-tools/emulators',
    XDG_CONFIG_HOME='/workspace/audit-tools/config', XDG_CACHE_HOME='/workspace/audit-tools/cache',
    npm_config_cache='/workspace/audit-tools/npm-cache', CI='true',
    EEAR_REPO_ALVO=str(ROOT), EEAR_REPO_REPROVADO_IA07='/workspace/eear-c186',
    EEAR_REPO_REPROVADO='/workspace/eear-a35', EEAR_REPO_LEGADO='/workspace/eear-2f6',
    EEAR_REPO_REPROVADO_IA05='/workspace/eear-a636', EEAR_REPO_CLIENTE_V3='/workspace/eear-v3',
    EEAR_AUDITORIA_SAIDA=str(OUT/'gate'), EEAR_RUNTIME_SHA256='e29b24880ea17f7973ca9bbb82694bee2d1c88bae7df684a15fcc3d6ab326a4d',
    EEAR_CARGA_SAIDA=str(OUT/'carga-browser.json'), EEAR_CARGA_FALHA=str(OUT/'carga-falha.json'))
def run(name, cmd, env=None, cwd=ROOT, expected=0):
    before=hashlib.sha256((ROOT/'curso/app.js').read_bytes()).hexdigest()
    start=time.time(); print('START '+name,flush=True)
    with (OUT/(name+'.log')).open('w') as f:
        p=subprocess.run(cmd,cwd=cwd,env=ENV| (env or {}),stdout=f,stderr=subprocess.STDOUT)
    after=hashlib.sha256((ROOT/'curso/app.js').read_bytes()).hexdigest()
    r=dict(name=name,cmd=cmd,cwd=str(cwd),env=env or {},exit=p.returncode,expected=expected,
        seconds=round(time.time()-start,2),utc=datetime.datetime.now(datetime.timezone.utc).isoformat(),before=before,after=after)
    (OUT/(name+'.result.json')).write_text(json.dumps(r,indent=2))
    print('END '+name+' '+str(p.returncode)+' '+str(r['seconds'])+'s',flush=True)
    return r
if __name__=='__main__':
    mode=sys.argv[1]
    if mode=='local':
        for n,c in [
            ('montagem',['python3','-I','web/montar_app.py','--conferir']),
            ('autoteste',['python3','-I','web/verificar_publicacao.py','autoteste']),
            ('integridade',['python3','-I','web/verificar_publicacao.py','validar']),
            ('workflows',['python3','-I','web/verificar_publicacao.py','conferir-workflows']),
            ('build-web',['python3','web/build.py','/workspace/audit-build/site']),
            ('barreira-web',['python3','-I','web/verificar_publicacao.py','verificar','/workspace/audit-build/site','--site']),
            ('build-app',['python3','web/build.py','/workspace/audit-build/app','--app']),
            ('barreira-app',['python3','-I','web/verificar_publicacao.py','verificar','/workspace/audit-build/app','--app']),
            ('hosting',['python3','testes/hosting-auditoria.py',str(ROOT)]),
            ('hosting-gates',['python3','testes/hosting-gates-auditoria.py',str(ROOT)]),
            ('hosting-contexto',['python3','testes/hosting-contexto-auditoria.py',str(ROOT)]),
            ('lint',['/workspace/audit-tools/node_modules/.bin/eslint','curso/app.js','curso/app','curso/dados','web/sw.js','testes']),
        ]: run(n,c,{'EEAR_FIREBASE_CONFIG':'/workspace/audit-results/null.json'})
        for n in ['operacoes','transferencia-identidades','importacoes-propriedades','legado-contrato','legado-bloqueio','ciclo-sincronia','plataforma']:
            run(n,['node','testes/'+n+'.test.js'])
    if mode=='firebase':
        for n in ['integridade-regressoes','firebase-emulador','persistencia-regressoes','bloqueadores-auditoria','importacoes-regressoes','sincronia-firebase','operacoes-dupla-falha','cache-restaurado','depurador-transacao']:
            run(n,['node','testes/'+n+'.test.js'])
    if mode=='load':
        run('carga-nucleo',['node','testes/carga-nucleo.test.js'],{'EEAR_CARGA_ESTADO':str(OUT/'carga-estado.json')})
        run('carga-browser',['node','testes/carga-metadados.test.js'])
        run('metadados-limite',['node','testes/metadados-limite.test.js'],{'EEAR_CARGA_ESTADO':str(OUT/'carga-estado.json')})
