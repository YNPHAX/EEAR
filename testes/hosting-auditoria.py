"""Sonda independente, sem deploy: python3 testes/hosting-auditoria.py /snapshot/do/repositorio.
Falhas são achados da auditoria, não devem ser ocultadas para aprovar o commit."""
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile

repo = Path(sys.argv[1]).resolve()
falhas = 0


def conferir(condicao, nome, detalhe=''):
    global falhas
    print(('✓ ' if condicao else '✗ ') + nome + (' — ' + detalhe if detalhe else ''), flush=True)
    if not condicao:
        falhas += 1


def verificar(pasta, modo):
    r = subprocess.run(['python3', '-I', 'web/verificar_publicacao.py', 'verificar', str(pasta), modo], cwd=repo, capture_output=True, text=True)
    return r.returncode


with tempfile.TemporaryDirectory(prefix='eear-hosting-audit-') as tmp:
    pasta = Path(tmp)
    cfg = pasta / 'config.json'
    valores = {'apiKey': 'ficticia-auditoria', 'authDomain': 'eear-teste.web.app', 'projectId': 'eear-teste', 'appId': '1:123:web:ficticio', 'sincronizar': True}

    def build(nome, config):
        cfg.write_text(json.dumps(config))
        saida = pasta / nome
        r = subprocess.run(['python3', 'web/build.py', str(saida)], cwd=repo, env=dict(os.environ, EEAR_FIREBASE_CONFIG=str(cfg)), capture_output=True, text=True)
        return saida, r.returncode

    firebase = json.loads((repo / 'firebase.json').read_text())
    rc = json.loads((repo / '.firebaserc').read_text())
    h = firebase['hosting']
    conferir(rc['projects']['default'] == 'eear-teste', 'alias padrão aponta ao projeto de teste')
    conferir(h['public'] == 'homologacao/site', 'artefatos de homologação em diretório separado')
    conferir(bool(h.get('predeploy')), 'Hosting declara predeploy (necessário; conteúdo exige auditoria)', 'sem hook, o CLI não executa o verificador Python')
    conferir(not h.get('rewrites'), 'nenhuma reescrita do app intercepta o handler reservado de OAuth')
    normal, cod = build('oficial', None)
    conferir(cod == 0 and verificar(normal, '--site') == 0, 'build oficial permitido no modo oficial')
    teste, cod = build('teste', valores)
    conferir(cod == 0 and verificar(teste, '--homologacao') == 0 and verificar(teste, '--site') == 1, 'build eear-teste aceito só como homologação')
    _, cod = build('outro-dominio', dict(valores, authDomain='outro-projeto.web.app'))
    conferir(cod != 0, 'authDomain de outro projeto recusado no build')
    _, cod = build('outro-projeto', dict(valores, projectId='eear-producao'))
    conferir(cod != 0, 'projectId de produção recusado no build')
    for nome, alterar in [
        ('sem-marcador', lambda s: s.replace(', "homologacao": true', '')),
        ('projeto-divergente', lambda s: s.replace('"projectId": "eear-teste"', '"projectId": "eear-producao"'))
    ]:
        destino = pasta / nome
        shutil.copytree(teste, destino)
        ix = destino / 'index.html'
        ix.write_text(alterar(ix.read_text()))
        modo = '--site' if nome == 'sem-marcador' else '--homologacao'
        retorno = verificar(destino, modo)
        conferir(retorno != 0, nome + ' é recusado por ' + modo, f'exit={retorno}')
    rotulado = pasta / 'rotulo-em-outra-pagina'
    shutil.copytree(normal, rotulado)
    with (rotulado / 'privacidade.html').open('a') as f:
        f.write('<script>const nota = {"homologacao": true};</script>')
    retorno = verificar(rotulado, '--homologacao')
    conferir(retorno != 0, 'marcador em página auxiliar não habilita app oficial como homologação', f'exit={retorno}')

print(f'Hosting: {falhas} falha(s); nenhuma operação no Firebase real.')
sys.exit(1 if falhas else 0)
