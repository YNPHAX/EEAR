"""Testes independentes do predeploy: executa somente o verificador local, nunca firebase deploy.
Uso: python3 testes/hosting-gates-auditoria.py <snapshot>. Exit 1 indica uma barreira esperada que não funcionou."""
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile

repo = Path(sys.argv[1]).resolve()
falhas = 0


def conferir(nome, pasta, projeto, permitido=False):
    global falhas
    r = subprocess.run(['python3', '-I', 'web/verificar_publicacao.py', 'verificar-hosting', str(pasta), projeto], cwd=repo, capture_output=True, text=True)
    passou = (r.returncode == 0) == permitido
    print(f'{"✓" if passou else "✗"} {nome}: exit={r.returncode}; esperado={"permitir" if permitido else "recusar"}', flush=True)
    if not passou:
        falhas += 1


with tempfile.TemporaryDirectory(prefix='eear-gates-audit-') as d:
    raiz = Path(d)
    cfg = raiz / 'config.json'
    teste = {'apiKey': 'ficticia-auditoria', 'authDomain': 'eear-teste.web.app', 'projectId': 'eear-teste', 'appId': '1:123:web:ficticio', 'sincronizar': False}
    for nome, config in [('oficial', None), ('teste', teste)]:
        cfg.write_text(json.dumps(config))
        subprocess.run(['python3', 'web/build.py', str(raiz / nome)], cwd=repo, env=dict(os.environ, EEAR_FIREBASE_CONFIG=str(cfg)), stdout=subprocess.DEVNULL, check=True)
    boa = raiz / 'teste'
    conferir('artefato e destino de teste', boa, 'eear-teste', True)
    conferir('destino de produção', boa, 'eear-producao')
    conferir('destino vazio', boa, '')
    conferir('pasta ausente', raiz / 'ausente', 'eear-teste')
    conferir('artefato oficial', raiz / 'oficial', 'eear-teste')

    def copiar(nome, origem=boa):
        dest = raiz / nome
        shutil.copytree(origem, dest)
        return dest

    prod = copiar('config-divergente')
    ix = prod / 'index.html'
    ix.write_text(ix.read_text().replace('"projectId": "eear-teste"', '"projectId": "eear-producao"'))
    conferir('configuração divergente', prod, 'eear-teste')
    duas = copiar('duas-configs')
    with (duas / 'index.html').open('a') as f:
        f.write('<script>window.EEAR_FIREBASE = ' + json.dumps(dict(teste, homologacao=True)) + ';</script>')
    conferir('duas configurações literais', duas, 'eear-teste')
    restrito = copiar('arquivo-proibido')
    (restrito / 'material.pdf').write_text('fixture fictícia, sem conteúdo restrito')
    conferir('arquivo proibido pelo verificador de conteúdo', restrito, 'eear-teste')

    comentario = copiar('config-comentada', raiz / 'oficial')
    with (comentario / 'index.html').open('a') as f:
        f.write('<!-- window.EEAR_FIREBASE = ' + json.dumps(dict(teste, homologacao=True)) + '; -->')
    conferir('configuração apenas em comentário não habilita homologação', comentario, 'eear-teste')

    externo = copiar('config-externa')
    ix = externo / 'index.html'
    html = ix.read_text()
    marcador = '<script src="app.js"></script>'
    if marcador not in html:
        raise RuntimeError('Revisar ponto anterior ao app.js para este snapshot')
    ix.write_text(html.replace(marcador, '<script src="dados/ambiente-auditoria.js"></script>\n' + marcador))
    (externo / 'dados/ambiente-auditoria.js').write_text('window.EEAR_FIREBASE = ' + json.dumps(dict(teste, projectId='eear-producao', authDomain='eear-producao.web.app')) + ';')
    conferir('configuração sobrescrita por script antes do app', externo, 'eear-teste')

    for nome, inicio, fim in [
        ('configuração em comentário JavaScript', '<script>// ', '\n</script>'),
        ('configuração em script não executável', '<script type="application/json">', '</script>'),
    ]:
        inerte = copiar(nome.replace(' ', '-'), raiz / 'oficial')
        with (inerte / 'index.html').open('a') as f:
            f.write(inicio + 'window.EEAR_FIREBASE = ' + json.dumps(dict(teste, homologacao=True)) + ';' + fim)
        conferir(nome + ' não habilita homologação', inerte, 'eear-teste')

print(f'Gates: {falhas} falha(s). Sem deploy; configurações fictícias não executaram SDK.')
sys.exit(1 if falhas else 0)
