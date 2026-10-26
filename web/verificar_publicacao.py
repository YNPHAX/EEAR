"""Confere que nada do material restrito (as apostilas de outro curso) vai para o site ou para o APK.
Olha o conteúdo, não só o nome: um arquivo renomeado, reformatado ou com só alguns trechos também é barrado.

Uso:
  python3 web/verificar_publicacao.py verificar _site --site      (saída do build do site)
  python3 web/verificar_publicacao.py verificar app/www --app     (conteúdo do app de Android)
  python3 web/verificar_publicacao.py verificar missao-eear.apk --apk
  python3 web/verificar_publicacao.py validar                     (confere o arquivo de impressões)
  python3 web/verificar_publicacao.py autoteste                   (confere a própria verificação, sem material real)
  python3 web/verificar_publicacao.py gerar curso/dados/apostila.js --aprovado _site
      (refaz web/impressoes-restritas.json; rodar só quando o material restrito mudar)

Sai com 0 se está tudo certo, 1 se encontrar algo e 2 se não conseguir verificar. Os workflows param no primeiro
erro, antes de enviar qualquer coisa, então nada é publicado. As mensagens dizem só o arquivo e a quantidade de
ocorrências, nunca o texto. O arquivo de impressões guarda só hashes: não dá para reconstruir o conteúdo a partir dele.

Limites: não detecta paráfrase, texto dentro de imagem, conteúdo codificado (base64, por exemplo) nem texto picado
em pedaços com menos de 20 caracteres. É uma rede de segurança; não substitui a revisão."""
import contextlib, hashlib, html, io, json, os, re, sys, tempfile, unicodedata, zipfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMPRESSOES = os.path.join(RAIZ, 'web', 'impressoes-restritas.json')
FONTE = os.path.join(RAIZ, 'curso', 'dados', 'apostila.js')
MIN = 20  # trechos mais curtos que isso não contam (seriam comuns demais)
TEXTO = ('.js', '.html', '.htm', '.json', '.css', '.webmanifest', '.txt', '.map', '.svg', '.xml', '.md')
# o que pode ir para o site e para dentro do app (a mesma lista da suíte de testes)
PUBLICAVEL = [r'index\.html', r'app\.js', r'sw\.js', r'manifest\.webmanifest', r'\.nojekyll', r'(privacidade|termos)\.html',
  r'dados/[a-z0-9-]+\.js', r'provas/[a-z0-9_]+/[a-z0-9_-]+\.webp', r'fontes/[A-Za-z0-9_.-]+\.(woff2|css|txt)',
  r'icones/[a-z0-9_-]+\.png', r'marca/[a-z0-9_-]+\.(svg|png)', r'cordova(_plugins)?\.js']
# nomes que só existem no código das apostilas (não são trechos do material)
MARCAS = ['EEAR.apostila', '"porTira"', 'build_apostila', 'dados/apostila']
PADROES = [r'"(?:CFS2?|BCT)_[A-Z]{3}_\d"', r'"id":"[A-Z0-9]+-[A-Z]{3}-[a-z]+-[^"]+"']

def h(b):
    return hashlib.sha256(b).hexdigest()

def norm(t):
    try:
        t = json.loads('"' + t + '"')  # resolve \uXXXX, \" e companhia
    except ValueError:
        pass
    t = unicodedata.normalize('NFC', html.unescape(t))
    return re.sub(r'\s+', ' ', t).strip().lower()

def trechos(s):
    """Hashes dos trechos de texto de um arquivo: strings entre aspas, textos entre tags e linhas."""
    c = re.findall(r'"((?:[^"\\\n]|\\.){%d,})"' % MIN, s) + re.findall(r"'((?:[^'\\\n]|\\.){%d,})'" % MIN, s)
    c += re.findall(r'>([^<]{%d,})<' % MIN, s) + s.splitlines()
    return {h(n.encode())[:20] for n in map(norm, c) if len(n) >= MIN}

def arquivos(alvo):
    if os.path.isfile(alvo):
        with zipfile.ZipFile(alvo) as z:
            for n in z.namelist():
                if not n.endswith('/'):
                    yield n, z.read(n)
    else:
        for r, _, fs in os.walk(alvo):
            for f in fs:
                p = os.path.join(r, f)
                yield os.path.relpath(p, alvo).replace(os.sep, '/'), open(p, 'rb').read()

def carregar(imp_arq):
    """Lê o arquivo de impressões e confere a forma. Qualquer defeito impede a verificação."""
    imp = json.load(open(imp_arq, encoding='utf-8'))
    if set(imp) != {'min', 'inteiros', 'trechos'} or imp['min'] != MIN:
        raise ValueError('formato ou versão diferente do esperado')
    for chave, tam, minimo in (('inteiros', 64, 1), ('trechos', 20, 100)):
        lista = imp[chave]
        if not isinstance(lista, list) or len(lista) < minimo:
            raise ValueError(f'"{chave}" vazio ou curto demais')
        if any(not isinstance(x, str) or not re.fullmatch('[0-9a-f]{%d}' % tam, x) for x in lista):
            raise ValueError(f'"{chave}" tem valores que não são hashes')
        if lista != sorted(set(lista)):
            raise ValueError(f'"{chave}" fora de ordem ou com repetições')
    return imp

def problemas(alvo, imp, modo):
    inteiros, imps = set(imp['inteiros']), set(imp['trechos'])
    achados, nomes = [], []
    for n, b in arquivos(alvo):
        web = n[len('assets/public/'):] if modo == 'apk' and n.startswith('assets/public/') else (n if modo != 'apk' else None)
        if web is not None:
            nomes.append(web)
            if not any(re.fullmatch(rx, web) for rx in PUBLICAVEL):
                achados.append((n, 'fora da lista do que pode ser publicado'))
        if 'apostila' in n.lower():
            achados.append((n, 'nome com "apostila"'))
        if h(b) in inteiros:
            achados.append((n, 'cópia exata de um arquivo restrito'))
        if n.lower().endswith(TEXTO) or (web or '').startswith('dados/'):
            s = b.decode('utf-8', 'replace')
            k = len(trechos(s) & imps)
            if k:
                achados.append((n, f'{k} trecho(s) do material restrito'))
            m = [x for x in MARCAS if x in s] + [p for p in PADROES if re.search(p, s)]
            if m:
                achados.append((n, f'{len(m)} marca(s) do material restrito'))
    if 'index.html' not in nomes:
        achados.append((alvo, 'sem index.html: a saída do build está vazia ou incompleta'))
    return achados

def verificar(alvo, modo, imp_arq=IMPRESSOES):
    try:
        imp = carregar(imp_arq)
    except Exception as e:
        print(f'ERRO: o arquivo de impressões {os.path.basename(imp_arq)} está ausente ou com defeito ({e}); nada pode ser publicado sem a verificação')
        return 2
    if not os.path.exists(alvo):
        print(f'ERRO: {alvo} não existe')
        return 2
    try:
        achados = problemas(alvo, imp, modo)
    except Exception as e:
        print(f'ERRO: não deu para ler {alvo} ({type(e).__name__}); nada pode ser publicado sem a verificação')
        return 2
    for n, motivo in achados:
        print(f'BLOQUEADO {n}: {motivo}')
    print(f'FALHOU: {len(achados)} problema(s); não publique' if achados else f'OK: nada restrito em {alvo}')
    return 1 if achados else 0

def validar(imp_arq=IMPRESSOES, fonte=FONTE):
    """Confere a forma do arquivo de impressões e, enquanto o material estiver no repositório, se ele corresponde ao material."""
    try:
        imp = carregar(imp_arq)
    except Exception as e:
        print(f'ERRO: o arquivo de impressões {os.path.basename(imp_arq)} está ausente ou com defeito ({e})')
        return 2
    if not os.path.exists(fonte):
        print(f'OK: impressões com forma válida ({len(imp["trechos"])} trechos); o material não está nesta cópia, então só a forma foi conferida')
        return 0
    b = open(fonte, 'rb').read()
    t = trechos(b.decode('utf-8', 'replace'))
    meus = set(imp['trechos'])
    if h(b) not in imp['inteiros'] or not meus <= t or len(meus) < 0.95 * len(t):
        print('ERRO: as impressões não correspondem ao material atual; gere de novo com "gerar" e revise o resultado')
        return 2
    print(f'OK: impressões válidas e correspondentes ao material ({len(meus)} de {len(t)} trechos; o resto já é público por outro motivo)')
    return 0

def gerar(restritos, aprovado, saida=IMPRESSOES):
    imps, inteiros = set(), set()
    for f in restritos:
        b = open(f, 'rb').read()
        inteiros.add(h(b))
        imps |= trechos(b.decode('utf-8', 'replace'))
    comuns = set()
    for n, b in arquivos(aprovado):
        if n.lower().endswith(TEXTO):
            comuns |= trechos(b.decode('utf-8', 'replace'))
    print(f'{len(imps & comuns)} trecho(s) já estão no build aprovado e não contam')
    imps -= comuns
    json.dump({'min': MIN, 'inteiros': sorted(inteiros), 'trechos': sorted(imps)}, open(saida, 'w', encoding='utf-8'), indent=0)
    print(f'{saida}: {len(inteiros)} arquivo(s) inteiro(s), {len(imps)} trechos')

def autoteste():
    """Confere a verificação com um material de mentira, numa pasta temporária. Nada do material real é usado."""
    falso = [f'Trecho de teste número {i}: o candidato marca a alternativa correta da questão {i * 7}.' for i in range(120)]
    restrito = 'window.X = ' + json.dumps(falso, ensure_ascii=False) + ';'
    falhas = []
    with tempfile.TemporaryDirectory() as tmp:
        def site(nome, extra):
            d = os.path.join(tmp, nome)
            os.makedirs(os.path.join(d, 'dados'))
            open(os.path.join(d, 'index.html'), 'w').write('<!doctype html><p>Curso preparatório para a prova da EEAR.</p>')
            open(os.path.join(d, 'app.js'), 'w').write('console.log("app do curso, sem nada restrito");')
            for f, t in extra.items():
                open(os.path.join(d, f), 'w', encoding='utf-8').write(t)
            return d
        def arq(nome, conteudo):
            p = os.path.join(tmp, nome)
            open(p, 'w').write(conteudo)
            return p
        fonte = arq('restrito.js', restrito)
        imp = os.path.join(tmp, 'imp.json')
        limpo = site('limpo', {})
        with contextlib.redirect_stdout(io.StringIO()):
            gerar([fonte], limpo, imp)
        bom = json.load(open(imp))
        apk = os.path.join(tmp, 'teste.apk')
        with zipfile.ZipFile(apk, 'w') as z:
            z.writestr('assets/public/index.html', '<p>x</p>')
            z.writestr('assets/public/dados/a.js', restrito)
        vazio = os.path.join(tmp, 'vazio')
        os.makedirs(vazio)
        defeituoso = dict(bom, trechos=['0' * 20] * len(bom['trechos']))
        casos = [
            ('site limpo', limpo, 'site', imp, 0),
            ('cópia renomeada', site('renomeado', {'dados/material.js': restrito}), 'site', imp, 1),
            ('3 trechos reformatados', site('parcial', {'dados/extra.js': 'var a=' + json.dumps(falso[5:8], indent=3)}), 'site', imp, 1),
            ('1 trecho em maiúsculas no HTML', site('html', {'termos.html': '<p>' + falso[9].upper() + '</p>'}), 'site', imp, 1),
            ('1 trecho com entidades HTML', site('ent', {'termos.html': '<p>' + html.escape(falso[11]).replace('ú', '&uacute;') + '</p>'}), 'site', imp, 1),
            ('1 trecho com escapes \\u', site('esc', {'dados/b.js': 'x=' + json.dumps(falso[13], ensure_ascii=True)}), 'site', imp, 1),
            ('arquivo fora da lista', site('extra', {'material.pdf': 'x'}), 'site', imp, 1),
            ('saída vazia', vazio, 'site', imp, 1),
            ('APK com o material', apk, 'apk', imp, 1),
            ('impressões ausentes', limpo, 'site', os.path.join(tmp, 'nao-existe.json'), 2),
            ('impressões que não são JSON', limpo, 'site', arq('ruim.json', '{"min": 20, "inteiros": ['), 2),
            ('impressões vazias', limpo, 'site', arq('vazio.json', json.dumps({'min': MIN, 'inteiros': [], 'trechos': []})), 2),
            ('impressões de outra versão', limpo, 'site', arq('versao.json', json.dumps(dict(bom, min=12))), 2),
            ('impressões adulteradas', limpo, 'site', arq('adulterado.json', json.dumps(defeituoso)), 2),
            ('alvo inexistente', os.path.join(tmp, 'nada'), 'site', imp, 2),
        ]
        for nome, alvo, modo, imp_arq, esperado in casos:
            with contextlib.redirect_stdout(io.StringIO()):
                r = verificar(alvo, modo, imp_arq)
            if r != esperado:
                falhas.append(f'{nome}: esperado {esperado}, veio {r}')
        with contextlib.redirect_stdout(io.StringIO()):
            v = [validar(imp, fonte), validar(imp, arq('mudou.js', restrito.replace('teste', 'TESTE')))]
        if v != [0, 2]:
            falhas.append(f'validar: esperado [0, 2], veio {v}')
    for f in falhas:
        print('AUTOTESTE FALHOU:', f)
    print(f'OK: autoteste da verificação ({len(casos) + 2} casos)' if not falhas else 'FALHOU: a verificação não está funcionando')
    return 1 if falhas else 0

if __name__ == '__main__':
    a = sys.argv[1:]
    if a[:1] == ['verificar'] and len(a) == 3 and a[2] in ('--site', '--app', '--apk'):
        sys.exit(verificar(a[1], a[2][2:]))
    if a == ['validar']:
        sys.exit(validar())
    if a == ['autoteste']:
        sys.exit(autoteste())
    if a[:1] == ['gerar'] and '--aprovado' in a:
        i = a.index('--aprovado')
        gerar(a[1:i], a[i + 1])
        sys.exit(0)
    print(__doc__)
    sys.exit(2)
