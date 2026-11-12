"""Comprova a execução da configuração canônica pelo parser HTML, sem carregar app/SDK ou fazer deploy.
Uso: NODE_PATH=<playwright> PLAYWRIGHT_BROWSERS_PATH=<chromium> python3 testes/hosting-contexto-auditoria.py <snapshot>.
O verificador é o do alvo; o HTML usa somente configuração fictícia e todas as requisições do browser são bloqueadas.
"""
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile

repo = Path(sys.argv[1]).resolve()
browser_js = r"""
const fs=require('fs'),{chromium}=require('playwright');
(async()=>{const b=await chromium.launch();try{for(const arq of process.argv.slice(1)){
const c=await b.newContext({serviceWorkers:'block'});await c.route('**/*',r=>r.abort());const p=await c.newPage();
await p.setContent(fs.readFileSync(arq,'utf8'),{waitUntil:'domcontentloaded'});
console.log(JSON.stringify({arquivo:arq,executou:await p.evaluate(()=>!!window.EEAR_FIREBASE),projeto:await p.evaluate(()=>window.EEAR_FIREBASE&&window.EEAR_FIREBASE.projectId||null)}));
await c.close();}}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
"""

with tempfile.TemporaryDirectory(prefix='eear-contexto-h02-') as d:
    raiz = Path(d)
    cfg = raiz / 'config.json'
    fake = {'apiKey': 'ficticia-contexto', 'authDomain': 'eear-teste.web.app', 'projectId': 'eear-teste', 'appId': '1:123:web:ficticio', 'sincronizar': False}
    for nome, obj in [('oficial', None), ('teste', fake)]:
        cfg.write_text(json.dumps(obj))
        subprocess.run(['python3', 'web/build.py', str(raiz / nome)], cwd=repo, env=dict(os.environ, EEAR_FIREBASE_CONFIG=str(cfg)), stdout=subprocess.DEVNULL, check=True)
    html = (raiz / 'teste/index.html').read_text()
    m = re.search(r'<script>window\.EEAR_SITE = "site";.*?window\.EEAR_FIREBASE = .*?</script>', html, re.S)
    if not m:
        raise RuntimeError('Não encontrou o script canônico real do build; revisar preparação.')
    canon = m.group(0)
    casos = [('canonica-ativa', raiz / 'teste', True)]
    for nome, prefixo, sufixo in [
        ('canonica-em-script-texto', '<script type="text/plain">', '</script>'),
        ('canonica-em-template-com-comentario', '<template><!-- </template> -->', '</template>'),
    ]:
        dest = raiz / nome
        shutil.copytree(raiz / 'oficial', dest)
        p = dest / 'index.html'
        original = p.read_text()
        if '<script src=' not in original:
            raise RuntimeError('Não encontrou a entrada de scripts do app.')
        p.write_text(original.replace('<script src=', prefixo + canon + sufixo + '\n<script src=', 1))
        casos.append((nome, dest, False))
    r = subprocess.run(['node', '-e', browser_js, *[str(p / 'index.html') for _, p, _ in casos]], capture_output=True, text=True, check=True)
    runtime = [json.loads(l) for l in r.stdout.splitlines()]
    falhas = 0
    for (nome, pasta, ativa), observacao in zip(casos, runtime, strict=True):
        v = subprocess.run(['python3', '-I', 'web/verificar_publicacao.py', 'verificar-hosting', str(pasta), 'eear-teste'], cwd=repo, capture_output=True, text=True)
        passou = observacao['executou'] is ativa and ((v.returncode == 0) is ativa)
        print(f'{"✓" if passou else "✗"} {nome}: ' + json.dumps({'gateExit': v.returncode, 'configExecutada': observacao['executou'], 'projetoRuntime': observacao['projeto'], 'deveriaAceitar': ativa}), flush=True)
        if not passou:
            falhas += 1
    print(f'Contexto H02: {falhas} falha(s). Sem deploy, SDK ou Firebase real.')
    sys.exit(1 if falhas else 0)
