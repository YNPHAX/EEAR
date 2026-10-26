"""Confere que nada do material restrito (as apostilas de outro curso) vai para o site ou para o APK.

O build (web/build.py) chama esta conferência no fim e não termina sem ela: se ela falhar ou não puder rodar, a saída
é apagada. Os workflows chamam de novo antes de enviar qualquer coisa e conferem o APK compilado por dentro.

Uso:
  python3 web/verificar_publicacao.py verificar _site --site      (saída do build do site)
  python3 web/verificar_publicacao.py verificar app/www --app     (conteúdo do app de Android)
  python3 web/verificar_publicacao.py verificar missao-eear.apk --apk
  python3 web/verificar_publicacao.py validar                     (confere o arquivo de impressões)
  python3 web/verificar_publicacao.py autoteste [-v]              (confere a própria verificação, só com material de mentira)
  python3 web/verificar_publicacao.py conferir-workflows          (confere que os workflows verificam antes de enviar)
  python3 web/verificar_publicacao.py gerar curso/dados/apostila.js --aprovado curso web/legal
      (refaz web/impressoes-restritas.json; só quando o material restrito mudar ou para aprovar um texto público)

Saídas: 0 tudo certo; 1 achou algo (não publique); 2 não conseguiu verificar (também não publique).
As mensagens dizem só o arquivo, o motivo e quantidades, nunca o texto.

Como compara: o texto de cada arquivo (e o que estiver em base64, hexadecimal, %XX, gzip ou zip dentro dele) passa
por uma normalização (escapes de JavaScript, entidades HTML, acentos, maiúsculas, tags) e vira uma sequência só de
letras e números, sem espaços nem pontuação. Qualquer trecho de 41 letras seguidas (umas 8 palavras) igual ao material
é encontrado, mesmo emendado, picado, entre crases, com formatação HTML no meio ou escrito com escapes; trechos de 30
a 40 letras às vezes; com menos de 30, nunca. O arquivo de impressões guarda só hashes de 64 bits desses trechos.
Também barra: links simbólicos, arquivos especiais e caminhos fora da área do build; texto que não é UTF-8; arquivo
cujo conteúdo não corresponde à extensão; arquivo compactado escondido; entradas repetidas ou com caminho estranho
no APK; e, como antes, cópia exata, nomes e marcas das apostilas e arquivos fora da lista do que pode ser publicado.

Não detecta: paráfrase; texto com as palavras em outra ordem; texto dentro de imagem (só texto guardado nos bytes do
arquivo); trechos isolados com menos de umas 6 palavras; ofuscação deliberada (letras de outro alfabeto parecidas,
letras intercaladas com outros caracteres, criptografia, codificações não listadas acima). É uma rede de segurança e
não substitui a revisão. Quem tem permissão de escrita ainda pode desligar tudo, editando juntos este arquivo, o
build.py e os workflows, ou publicando por fora dos workflows; isso só se evita com regras de proteção da main."""
import base64, binascii, collections, contextlib, gzip, hashlib, html, io, json, os, random, re, stat, sys, tempfile
import unicodedata, urllib.parse, warnings, zipfile, zlib

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMPRESSOES = os.path.join(RAIZ, 'web', 'impressoes-restritas.json')
FONTES = [os.path.join(RAIZ, 'curso', 'dados', 'apostila.js')]
WORKFLOWS = os.path.join(RAIZ, '.github', 'workflows')
BUILD = os.path.join(RAIZ, 'web', 'build.py')
VERSAO, K, W = 2, 30, 12          # trechos de K letras; acha com certeza qualquer trecho comum de K + W - 1 = 41 letras
MIN_LETRAS = 10                   # trecho com menos letras diferentes que isso (gabarito, números) não vira impressão
LIMITE_APROVADO = 0.05            # no máximo 5% das impressões do material podem ser aprovadas como texto público
MIN_IMPRESSOES = 500
PROFUNDIDADE, MAX_BYTES, MAX_TAXA = 3, 1_500_000_000, 500
TEXTO = ('.js', '.mjs', '.html', '.htm', '.json', '.css', '.webmanifest', '.txt', '.map', '.svg', '.xml', '.md', '.csv')
ASSINATURA = {
    '.webp': lambda b: b[:4] == b'RIFF' and b[8:12] == b'WEBP', '.png': lambda b: b[:8] == b'\x89PNG\r\n\x1a\n',
    '.jpg': lambda b: b[:3] == b'\xff\xd8\xff', '.jpeg': lambda b: b[:3] == b'\xff\xd8\xff',
    '.gif': lambda b: b[:4] == b'GIF8', '.ico': lambda b: b[:4] == b'\x00\x00\x01\x00', '.woff2': lambda b: b[:4] == b'wOF2'}
# o que pode ir para o site e para dentro do app (no APK, vale para assets/public/)
PUBLICAVEL = [r'index\.html', r'app\.js', r'sw\.js', r'manifest\.webmanifest', r'\.nojekyll', r'(privacidade|termos)\.html',
  r'dados/[a-z0-9-]+\.js', r'provas/[a-z0-9_]+/[a-z0-9_-]+\.(webp|png|jpe?g)',
  r'imagens/(?:[a-z0-9_-]+/)*[a-z0-9_-]+\.(webp|png|jpe?g|gif|svg)', r'fontes/[A-Za-z0-9_.-]+\.(woff2|css|txt)',
  r'icones/[a-z0-9_-]+\.(png|webp|svg|ico)', r'marca/[a-z0-9_-]+\.(svg|png|webp)', r'cordova(_plugins)?\.js']
# nomes que só existem no código das apostilas (não são trechos do material)
MARCAS = ['EEAR.apostila', '"porTira"', 'build_apostila', 'dados/apostila']
PADROES = [r'"(?:CFS2?|BCT)_[A-Z]{3}_\d"', r'"id":"[A-Z0-9]+-[A-Z]{3}-[a-z]+-[^"]+"']
B64 = re.compile(r'[A-Za-z0-9+/]{40,}={0,2}|[A-Za-z0-9_-]{40,}={0,2}')
HEX = re.compile(r'(?:[0-9a-fA-F]{2}){32,}')
UTF8 = re.compile(rb'(?:[\t\n\r\x20-\x7e]|[\xc2-\xdf][\x80-\xbf]|[\xe0-\xef][\x80-\xbf]{2}|[\xf0-\xf4][\x80-\xbf]{3}){16,}')
UTF16 = (re.compile(rb'(?:[\t\n\r\x20-\x7e\xa0-\xff]\x00){12,}'), re.compile(rb'(?:\x00[\t\n\r\x20-\x7e\xa0-\xff]){12,}'))


class NaoVerificavel(Exception):
    """A conferência não consegue concluir: o resultado é 2 e nada pode ser publicado."""


def sha256(b):
    return hashlib.sha256(b).hexdigest()


def _h(trecho):
    return hashlib.blake2b(trecho.encode(), digest_size=8).hexdigest()


# --- normalização: o mesmo texto, escrito de jeitos diferentes, vira a mesma sequência de letras e números ---

def sem_escapes(s):
    s = re.sub(r'\\u\{([0-9a-fA-F]{1,6})\}', lambda m: chr(min(int(m.group(1), 16), 0x10FFFF)), s)
    s = re.sub(r'\\u([0-9a-fA-F]{4})', lambda m: chr(int(m.group(1), 16)), s)
    s = re.sub(r'\\x([0-9a-fA-F]{2})', lambda m: chr(int(m.group(1), 16)), s)
    s = re.sub(r'\\([0-7]{1,3})', lambda m: chr(int(m.group(1), 8)), s)
    s = re.sub(r'\\[nrtbfv]', ' ', s)
    s = re.sub(r'\\(.)', r'\1', s)
    return s.encode('utf-16', 'surrogatepass').decode('utf-16', 'replace')  # junta os pares \uD83D\uDE00


def normalizar(s):
    s = sem_escapes(s.replace('\ufeff', ''))
    for _ in range(2):
        s = html.unescape(s)
    if '%' in s:
        s = urllib.parse.unquote(s, errors='replace')
    s = unicodedata.normalize('NFKD', s)
    return ''.join(c for c in s if not unicodedata.combining(c)).casefold()


def fluxos(texto):
    """As sequências só de letras e números do texto, com as tags HTML e sem elas (comentários HTML contam)."""
    n = normalizar(texto)
    sem_tags = re.sub(r'<[^<>]{0,500}>', ' ', n.replace('<!--', ' ').replace('-->', ' '))
    return {re.sub(r'[^a-z0-9]+', '', x) for x in (n, sem_tags)}


def todos(fl):
    return {_h(fl[i:i + K]) for i in range(len(fl) - K + 1)}


def selecionar(fl):
    """Winnowing: em cada janela de W trechos seguidos, guarda o de menor hash. Trechos com poucas letras diferentes
    (gabaritos, números) não entram, para não coincidir com os gabaritos do próprio curso."""
    hs = [_h(g) if len({c for c in g if c.isalpha()}) >= MIN_LETRAS else None
          for g in (fl[i:i + K] for i in range(len(fl) - K + 1))]
    sel = set()
    for i in range(max(len(hs) - W + 1, 1 if hs else 0)):
        janela = [x for x in hs[i:i + W] if x is not None]
        if janela:
            sel.add(min(janela))
    return sel


def impressoes_de(texto):
    sel = set()
    for fl in fluxos(texto):
        sel |= selecionar(fl)
    return sel


# --- leitura do que vai ser publicado ---

def percorrer(raiz):
    """Arquivos de uma pasta de build. Links simbólicos, arquivos especiais e caminhos de fora não são lidos."""
    base = os.path.realpath(raiz)
    for atual, dirs, fs in os.walk(raiz, followlinks=False):
        for d in dirs:
            p = os.path.join(atual, d)
            if os.path.islink(p):
                yield 'link', os.path.relpath(p, raiz).replace(os.sep, '/'), None
        for f in fs:
            p = os.path.join(atual, f)
            rel = os.path.relpath(p, raiz).replace(os.sep, '/')
            modo = os.lstat(p).st_mode
            if stat.S_ISLNK(modo):
                yield 'link', rel, None
            elif not stat.S_ISREG(modo):
                yield 'especial', rel, None
            elif not os.path.realpath(p).startswith(base + os.sep):
                yield 'fora', rel, None
            else:
                yield 'arquivo', rel, open(p, 'rb').read()


def desempacotar(b, ctx):
    """Todas as entradas de um zip (inclusive repetidas) e os problemas de estrutura. Exceção se não der para ler."""
    try:
        z = zipfile.ZipFile(io.BytesIO(b))
        infos = z.infolist()
    except (zipfile.BadZipFile, zipfile.LargeZipFile, OSError, ValueError, EOFError) as e:
        raise NaoVerificavel(f'arquivo compactado ilegível ({type(e).__name__})')
    itens, probs = [], []
    contagem = collections.Counter(i.filename for i in infos)
    probs += [(n, 'entrada repetida dentro do arquivo compactado') for n, c in sorted(contagem.items()) if c > 1]
    for i in infos:
        n = i.filename
        if i.flag_bits & 0x1:
            raise NaoVerificavel(f'{n}: entrada criptografada')
        if n.startswith('/') or '\\' in n or '\x00' in n or '..' in n.split('/') or re.match(r'^[A-Za-z]:', n):
            probs.append((n, 'caminho fora da área autorizada'))
            continue
        if n.endswith('/'):
            continue
        if i.file_size > 1_000_000 and i.file_size > MAX_TAXA * max(i.compress_size, 1):
            raise NaoVerificavel(f'{n}: taxa de compressão suspeita (possível bomba de descompressão)')
        ctx['bytes'] += i.file_size
        if ctx['bytes'] > MAX_BYTES:
            raise NaoVerificavel('conteúdo descompactado grande demais para conferir')
        try:
            itens.append((n, z.read(i)))
        except (zipfile.BadZipFile, NotImplementedError, RuntimeError, OSError, zlib.error, EOFError) as e:
            raise NaoVerificavel(f'{n}: não deu para descompactar ({type(e).__name__})')
    return itens, probs


def descomprimir(b, wbits):
    d = zlib.decompressobj(wbits)
    try:
        saida = d.decompress(b, 200_000_000)
    except zlib.error:
        return None
    if d.unconsumed_tail:
        raise NaoVerificavel('conteúdo comprimido grande demais para conferir')
    return saida


def textos_de_binario(b):
    """Texto guardado nos bytes de um arquivo binário (UTF-8 e UTF-16), na ordem em que aparece."""
    partes = [m.group().decode('utf-8', 'replace') for m in UTF8.finditer(b)]
    partes += [m.group().decode('utf-16-le' if i == 0 else 'utf-16-be', 'replace') for i, rx in enumerate(UTF16) for m in rx.finditer(b)]
    return '\n'.join(partes)


def codificados(s):
    """Bytes escondidos em base64 ou hexadecimal dentro de um texto."""
    for m in B64.finditer(s):
        t = m.group()
        for dec in (base64.b64decode, base64.urlsafe_b64decode):
            try:
                b = dec(t + '=' * (-len(t.rstrip('=')) % 4))
            except (binascii.Error, ValueError):
                continue
            if len(b) >= 24:
                yield b
                break
    for m in HEX.finditer(s):
        yield bytes.fromhex(m.group())


def analisar_texto(t, imp, ctx, nivel, nome):
    probs = []
    bruto = [t, sem_escapes(t)]
    m = [x for x in MARCAS if any(x in s for s in bruto)] + [p for p in PADROES if any(re.search(p, s) for s in bruto)]
    if m:
        probs.append(f'{len(m)} marca(s) do material restrito')
    k = set()
    for fl in fluxos(t):
        k |= todos(fl) & imp['impressoes']
    if k:
        probs.append(f'{len(k)} impressão(ões) do material restrito')
    for b in codificados(t):
        probs += [f'dentro de um trecho codificado: {p}' for p in analisar(nome, b, imp, ctx, nivel + 1, False)]
    return probs


def analisar(nome, b, imp, ctx, nivel=0, estrito=False):
    """Problemas de um arquivo ou de algo de dentro dele. estrito: texto publicado, que tem de ser UTF-8 válido."""
    if nivel > PROFUNDIDADE:
        raise NaoVerificavel(f'{nome}: conteúdo aninhado demais para conferir')
    probs = ['cópia exata de um arquivo restrito'] if sha256(b) in imp['inteiros'] else []
    if estrito:
        if b[:2] in (b'\xff\xfe', b'\xfe\xff') or b[:4] in (b'\x00\x00\xfe\xff', b'\xff\xfe\x00\x00'):
            return probs + ['texto em UTF-16 ou UTF-32 (só UTF-8 pode ser publicado)']
        if b'\x00' in b:
            return probs + ['texto com byte nulo (provável UTF-16 sem marca; só UTF-8 pode ser publicado)']
        try:
            return probs + analisar_texto(b.decode('utf-8'), imp, ctx, nivel, nome)
        except UnicodeDecodeError:
            return probs + ['texto que não é UTF-8 válido (ex.: Windows-1252; só UTF-8 pode ser publicado)']
    if b[:4] == b'PK\x03\x04' or (len(b) > 22 and zipfile.is_zipfile(io.BytesIO(b))):
        itens, estrutura = desempacotar(b, ctx)
        probs += [f'dentro do arquivo compactado, {n}: {p}' for n, p in estrutura]
        for n, d in itens:
            probs += [f'dentro do arquivo compactado, {n}: {p}' for p in analisar(f'{nome}!{n}', d, imp, ctx, nivel + 1, False)]
        return probs
    for cab, wbits in ((b'\x1f\x8b', 16 + zlib.MAX_WBITS), (b'\x78', zlib.MAX_WBITS)):
        if b[:len(cab)] == cab and (cab != b'\x78' or len(b) > 2 and (b[0] * 256 + b[1]) % 31 == 0):
            d = descomprimir(b, wbits)
            if d is not None:
                return probs + [f'dentro de um trecho comprimido: {p}' for p in analisar(nome, d, imp, ctx, nivel + 1, False)]
    try:
        t = b.decode('utf-8')
    except UnicodeDecodeError:
        t = textos_de_binario(b)
    return probs + analisar_texto(t, imp, ctx, nivel, nome)


def analisar_publico(rel, b, imp, ctx):
    """Arquivo que vai para o site ou para assets/public/ do APK."""
    probs = []
    if not any(re.fullmatch(rx, rel) for rx in PUBLICAVEL):
        probs.append('fora da lista do que pode ser publicado')
    if 'apostila' in rel.lower():
        probs.append('nome com "apostila"')
    ext = os.path.splitext(rel.lower())[1]
    if ext in ASSINATURA:
        if not ASSINATURA[ext](b):
            probs.append('o conteúdo não corresponde à extensão do arquivo')
        elif zipfile.is_zipfile(io.BytesIO(b)):
            probs.append('arquivo compactado escondido dentro do arquivo')
    return probs + analisar(rel, b, imp, ctx, 0, ext in TEXTO or rel.startswith('dados/'))


def problemas(alvo, imp, modo):
    ctx, achados, publicos = {'bytes': 0}, [], []
    if modo == 'apk':
        itens, achados = desempacotar(open(alvo, 'rb').read(), ctx)
        for n, d in itens:
            if n.startswith('assets/public/'):
                publicos.append(n[len('assets/public/'):])
                achados += [(n, p) for p in analisar_publico(publicos[-1], d, imp, ctx)]
            else:
                achados += [(n, p) for p in analisar(n, d, imp, ctx, 0, False)]
    else:
        motivo = {'link': 'link simbólico (só arquivos de verdade podem ser publicados)', 'especial': 'arquivo especial',
                  'fora': 'caminho fora da pasta do build'}
        for tipo, rel, d in percorrer(alvo):
            if tipo != 'arquivo':
                achados.append((rel, motivo[tipo]))
                continue
            publicos.append(rel)
            achados += [(rel, p) for p in analisar_publico(rel, d, imp, ctx)]
    if 'index.html' not in publicos:
        achados.append((alvo, 'sem index.html: a saída do build está vazia ou incompleta'))
    return achados


# --- arquivo de impressões ---

def carregar(imp_arq):
    """Lê o arquivo de impressões e confere a forma. Qualquer defeito impede a verificação."""
    imp = json.load(open(imp_arq, encoding='utf-8'))
    if not isinstance(imp, dict) or set(imp) != {'versao', 'k', 'w', 'min_letras', 'inteiros', 'impressoes', 'aprovadas'}:
        raise ValueError('formato diferente do esperado')
    if (imp['versao'], imp['k'], imp['w'], imp['min_letras']) != (VERSAO, K, W, MIN_LETRAS):
        raise ValueError('versão ou parâmetros diferentes dos desta verificação')
    for chave, tam, minimo in (('inteiros', 64, 1), ('impressoes', 16, MIN_IMPRESSOES), ('aprovadas', 16, 0)):
        lista = imp[chave]
        if not isinstance(lista, list) or len(lista) < minimo:
            raise ValueError(f'"{chave}" vazio ou curto demais')
        if any(not isinstance(x, str) or not re.fullmatch('[0-9a-f]{%d}' % tam, x) for x in lista):
            raise ValueError(f'"{chave}" tem valores que não são hashes')
        if lista != sorted(set(lista)):
            raise ValueError(f'"{chave}" fora de ordem ou com repetições')
    if set(imp['impressoes']) & set(imp['aprovadas']):
        raise ValueError('impressões e aprovações se sobrepõem')
    if len(imp['aprovadas']) > LIMITE_APROVADO * (len(imp['impressoes']) + len(imp['aprovadas'])):
        raise ValueError('mais texto aprovado como público do que o limite permite')
    return {c: set(imp[c]) for c in ('inteiros', 'impressoes', 'aprovadas')}


def verificar(alvo, modo, imp_arq=IMPRESSOES):
    try:
        imp = carregar(imp_arq)
    except Exception as e:
        print(f'ERRO: o arquivo de impressões {os.path.basename(imp_arq)} está ausente ou com defeito ({e}); nada pode ser publicado')
        return 2
    if os.path.abspath(imp_arq) == IMPRESSOES:
        # com o arquivo do projeto, confere também que ele corresponde ao material (pega hash trocado por outro válido)
        with contextlib.redirect_stdout(io.StringIO()) as buf:
            r = validar(imp_arq)
        if r:
            print(buf.getvalue(), end='')
            print('ERRO: nada pode ser publicado sem impressões válidas')
            return 2
    if not os.path.exists(alvo):
        print(f'ERRO: {alvo} não existe')
        return 2
    try:
        achados = problemas(alvo, imp, modo)
    except NaoVerificavel as e:
        print(f'ERRO: a conferência não pôde terminar ({e}); nada pode ser publicado')
        return 2
    except Exception as e:
        print(f'ERRO: a conferência não pôde terminar ({type(e).__name__}); nada pode ser publicado')
        return 2
    for n, motivo in achados:
        print(f'BLOQUEADO {n}: {motivo}')
    print(f'FALHOU: {len(achados)} problema(s); não publique' if achados else f'OK: nada restrito em {alvo}')
    return 1 if achados else 0


def validar(imp_arq=IMPRESSOES, fontes=FONTES):
    """Confere a forma do arquivo de impressões e, enquanto o material estiver no repositório, se corresponde a ele."""
    try:
        imp = carregar(imp_arq)
    except Exception as e:
        print(f'ERRO: o arquivo de impressões {os.path.basename(imp_arq)} está ausente ou com defeito ({e})')
        return 2
    if not all(os.path.exists(f) for f in fontes):
        print(f'OK: impressões com forma válida ({len(imp["impressoes"])}); o material não está nesta cópia, então só a forma foi conferida')
        return 0
    sel, inteiros = set(), set()
    for f in fontes:
        b = open(f, 'rb').read()
        inteiros.add(sha256(b))
        sel |= impressoes_de(b.decode('utf-8', 'replace'))
    if not inteiros <= imp['inteiros'] or sel != imp['impressoes'] | imp['aprovadas']:
        print('ERRO: as impressões não correspondem ao material atual; gere de novo com "gerar" e revise o resultado')
        return 2
    print(f'OK: impressões válidas e correspondentes ao material ({len(imp["impressoes"])}, mais {len(imp["aprovadas"])} aprovadas como texto público)')
    return 0


def textos_aprovados(caminhos, excluir):
    for c in caminhos:
        lista = [c] if os.path.isfile(c) else [os.path.join(r, f) for r, _, fs in os.walk(c) for f in sorted(fs)]
        for p in lista:
            if os.path.realpath(p) not in excluir and p.lower().endswith(TEXTO):
                yield open(p, 'rb').read().decode('utf-8', 'replace')


def gerar(fontes, aprovados, saida=IMPRESSOES):
    """Gera as impressões do material. Trechos que também estão nos textos aprovados (o próprio curso, uma prova
    oficial pública) não contam, até o limite de 5%: acima disso é sinal de que o "aprovado" tem o material."""
    sel, inteiros = set(), set()
    for f in fontes:
        b = open(f, 'rb').read()
        inteiros.add(sha256(b))
        sel |= impressoes_de(b.decode('utf-8', 'replace'))
    publico = set()
    for t in textos_aprovados(aprovados, {os.path.realpath(f) for f in fontes}):
        for fl in fluxos(t):
            publico |= todos(fl)
    aprov = sel & publico
    if len(aprov) > LIMITE_APROVADO * len(sel):
        print(f'ERRO: {len(aprov)} de {len(sel)} impressões estariam aprovadas como públicas (limite: {LIMITE_APROVADO:.0%}); '
              'o texto "aprovado" parece conter o material restrito. Nada foi gravado.')
        return 2
    json.dump({'versao': VERSAO, 'k': K, 'w': W, 'min_letras': MIN_LETRAS, 'inteiros': sorted(inteiros),
               'impressoes': sorted(sel - aprov), 'aprovadas': sorted(aprov)}, open(saida, 'w', encoding='utf-8'), indent=0)
    print(f'{saida}: {len(sel - aprov)} impressões, {len(aprov)} aprovadas como texto público, {len(inteiros)} arquivo(s) inteiro(s)')
    return 0


# --- proteção contra remoção acidental ---

def conferir_workflows(pasta=WORKFLOWS, build_py=BUILD):
    """A conferência tem de rodar no build e antes de qualquer envio do Pages, do APK ou de Release."""
    probs = []
    try:
        b = open(build_py, encoding='utf-8').read()
    except OSError:
        b = ''
    if 'conferir_build(' not in b:
        probs.append('web/build.py não chama a conferência do conteúdo')
    for f in sorted(os.listdir(pasta)) if os.path.isdir(pasta) else []:
        if not f.endswith(('.yml', '.yaml')):
            continue
        t = open(os.path.join(pasta, f), encoding='utf-8').read()
        pos = lambda rx: (lambda m: m.start() if m else None)(re.search(rx, t))
        site, apk = pos(r'verificar_publicacao\.py verificar \S+ --site'), pos(r'verificar_publicacao\.py verificar \S+\.apk --apk')
        for alvo, rx, antes in (('o envio do pacote do Pages', r'upload-pages-artifact', site), ('o deploy do Pages', r'deploy-pages', site),
                                ('o envio do APK', r'actions/upload-artifact' if '.apk' in t else r'(?!x)x', apk),
                                ('a criação de Release', r'gh release|action-gh-release|create-release', apk)):
            p = pos(rx)
            if p is not None and (antes is None or antes > p):
                probs.append(f'{f}: {alvo} sem a verificação antes')
    return probs


def conferir_build(saida, modo):
    """Chamada pelo build.py no fim: autoteste, impressões, workflows e a saída. Devolve 0, 1 ou 2."""
    try:
        with contextlib.redirect_stdout(io.StringIO()) as buf:
            r = autoteste()
        if r:
            print(buf.getvalue(), end='')
            print('ERRO: o autoteste da verificação falhou; nada pode ser publicado')
            return 2
        if validar():
            return 2
        probs = conferir_workflows()
        for p in probs:
            print(f'ERRO: {p}')
        if probs:
            print('ERRO: os workflows precisam conferir o conteúdo antes de enviar; nada pode ser publicado')
            return 2
        return verificar(saida, modo)
    except Exception as e:
        print(f'ERRO: a conferência não pôde terminar ({type(e).__name__}); nada pode ser publicado')
        return 2


# --- autoteste, só com material de mentira ---

PALAVRAS = ('candidato prova questão alternativa resposta exercício capítulo página gabarito comentário função equação '
    'fração conjunto número inteiro primo divisor múltiplo potência raiz quadrada triângulo retângulo círculo perímetro '
    'área volume velocidade aceleração força energia trabalho campo elétrico resistência corrente tensão circuito onda '
    'frequência período óptica lente espelho imagem objeto leitura interpretação sintaxe sujeito predicado verbo adjetivo '
    'advérbio substantivo pronome preposição conjunção oração coordenada subordinada concordância regência crase pontuação '
    'acentuação ortografia semântica sinônimo antônimo metáfora ironia vocabulário gramática revisão resumo tabela gráfico '
    'exemplo modelo treino simulado caderno anotação professor turma escola sargento aeronáutica especialista formação').split()
OFICIAL = ('Questão doze da prova oficial: um avião percorre quatrocentos e cinquenta quilômetros em uma hora e meia; '
           'calcule a velocidade média do avião durante todo o percurso descrito.')


def frases(semente, n):
    r = random.Random(semente)
    return [' '.join(r.choice(PALAVRAS) for _ in range(r.randint(10, 16))).capitalize() + '.' for _ in range(n)]


def autoteste(verboso=False):
    r, outro = random.Random(7), random.Random(3)
    sigilo, livre = frases(1, 80) + [OFICIAL], frases(2, 40)
    restrito = 'window.X = ' + json.dumps({'itens': [{'id': i, 'texto': t} for i, t in enumerate(sigilo)]}, ensure_ascii=False) + ';'
    trecho = ' '.join(sigilo[3:6])
    falhas, linhas = [], []
    with tempfile.TemporaryDirectory() as tmp:
        cam = lambda *p: os.path.join(tmp, *p)

        def escrever(p, c):
            os.makedirs(os.path.dirname(p), exist_ok=True)
            open(p, 'wb').write(c if isinstance(c, bytes) else c.encode('utf-8'))
            return p

        def site(nome, extra=None):
            d = cam(nome)
            escrever(os.path.join(d, 'index.html'), '<!doctype html><p>Curso preparatório da EEAR: aulas, questões e simulados.</p>')
            escrever(os.path.join(d, 'app.js'), 'console.log("app do curso");')
            escrever(os.path.join(d, 'dados', 'aulas.js'), 'window.A = ' + json.dumps(livre, ensure_ascii=False) + ';')
            for f, c in (extra or {}).items():
                escrever(os.path.join(d, f), c)
            return d

        def zipar(entradas, comprimir=zipfile.ZIP_DEFLATED):
            buf = io.BytesIO()
            with zipfile.ZipFile(buf, 'w', comprimir) as z, warnings.catch_warnings():
                warnings.simplefilter('ignore')  # nomes repetidos, de propósito
                for n, c in entradas:
                    z.writestr(n, c)
            return buf.getvalue()

        def cifrar(b, nome):
            # marca a entrada como criptografada (bit 0 das flags), como faria um zip com senha
            b, n = bytearray(b), nome.encode()
            for sig, flag, inicio in ((b'PK\x03\x04', 6, 30), (b'PK\x01\x02', 8, 46)):
                i = b.find(sig)
                while i != -1:
                    if b[i + inicio:i + inicio + len(n)] == n:
                        b[i + flag] |= 1
                    i = b.find(sig, i + 1)
            return bytes(b)

        base_apk = [('AndroidManifest.xml', b'\x03\x00\x08\x00' + bytes(range(256))),
                    ('classes.dex', b'dex\n035\x00' + bytes(r.getrandbits(8) for _ in range(2000))),
                    ('assets/public/index.html', '<p>Curso</p>')]
        apk = lambda nome, entradas: escrever(cam(nome), zipar(base_apk + entradas))

        ruido = lambda n: bytes(r.getrandbits(8) for _ in range(n))
        webp = lambda: b'RIFF' + (3008).to_bytes(4, 'little') + b'WEBPVP8 ' + ruido(3000)
        png, jpg = (lambda: b'\x89PNG\r\n\x1a\n' + ruido(3000)), (lambda: b'\xff\xd8\xff\xe0' + ruido(3000))
        fonte = escrever(cam('restrito.js'), restrito)
        binario = webp()
        imp = cam('imp.json')
        with contextlib.redirect_stdout(io.StringIO()):
            if gerar([fonte], [site('aprovado')], imp):
                return 1
        bom = json.load(open(imp))
        aula_oficial = site('aula-oficial', {'dados/prova.js': 'window.P = ' + json.dumps([OFICIAL], ensure_ascii=False) + ';'})
        imp2 = cam('imp-oficial.json')
        with contextlib.redirect_stdout(io.StringIO()):
            g2 = gerar([fonte], [site('aprovado2'), aula_oficial], imp2)
            g3 = gerar([fonte], [site('aprovado3', {'dados/muito.js': json.dumps(sigilo[:30])})], cam('imp-recusado.json'))
        ext = cam('fora')
        escrever(os.path.join(ext, 'dados.js'), restrito)
        link_pasta = site('link-pasta')
        os.symlink(ext, os.path.join(link_pasta, 'dados', 'extra'))
        link_arq = site('link-arquivo')
        os.symlink(os.path.join(ext, 'dados.js'), os.path.join(link_arq, 'dados', 'b.js'))
        link_interno = site('link-interno')
        os.symlink('aulas.js', os.path.join(link_interno, 'dados', 'copia.js'))
        fifo = site('fifo')
        if hasattr(os, 'mkfifo'):
            os.mkfifo(os.path.join(fifo, 'dados', 'c.js'))
        palavras = trecho.split()
        curta = ''
        for p in sigilo[10].split():
            if len(re.sub(r'[^a-z]', '', normalizar(curta + p))) >= K - 1:
                break
            curta += p + ' '
        com_tags = '<p>' + ' '.join(f'<b>{p}</b>' if i % 3 == 0 else (f'{p}<br>' if i % 5 == 0 else p) for i, p in enumerate(palavras)) + '</p>'
        escapado = ''.join(f'\\x{ord(c):02x}' if ord(c) < 128 and i % 2 else (f'\\u{ord(c):04x}' if ord(c) > 127 else c) for i, c in enumerate(trecho))
        emendado = ' + '.join(json.dumps(' '.join(palavras[i:i + 4]), ensure_ascii=False) for i in range(0, len(palavras), 4))
        picado = json.dumps([trecho[i:i + 7] for i in range(0, len(trecho), 7)], ensure_ascii=False)
        sem_acento = ''.join(c for c in unicodedata.normalize('NFD', trecho) if not unicodedata.combining(c)).upper().replace(' ', '   ')
        def com_corrompido(nome, mudar):
            d = json.loads(json.dumps(bom))
            mudar(d)
            return escrever(cam(nome), json.dumps(d) if not isinstance(d, str) else d)
        oficial_novo = site('oficial-novo', {'dados/prova.js': 'window.P = ' + json.dumps([OFICIAL], ensure_ascii=False) + ';'})
        outro_trecho = site('outro-trecho', {'dados/x.js': json.dumps(' '.join(sigilo[20:23]), ensure_ascii=False)})
        wf_ok = {'site.yml': 'run: python3 web/verificar_publicacao.py verificar _site --site\n- uses: actions/upload-pages-artifact@v3\n- uses: actions/deploy-pages@v4\n',
                 'android.yml': 'run: python3 web/verificar_publicacao.py verificar missao-eear.apk --apk\n- uses: actions/upload-artifact@v4\n  path: missao-eear.apk\n  run: gh release create x missao-eear.apk\n'}
        def wf(nome, arqs, build='r = conferir_build(OUT, modo)'):
            # 2 se a conferência dos workflows acusar algum problema, 0 se não
            d = cam(nome, 'wf')
            for f, c in arqs.items():
                escrever(os.path.join(d, f), c)
            return 2 if conferir_workflows(d, escrever(cam(nome, 'build.py'), build)) else 0
        sem_site = '- uses: actions/upload-pages-artifact@v3\n- uses: actions/deploy-pages@v4\n'
        apk_depois = '- uses: actions/upload-artifact@v4\n  path: missao-eear.apk\nrun: python3 web/verificar_publicacao.py verificar missao-eear.apk --apk\n'
        casos = [
            # (grupo, nome, função que devolve o resultado, esperado)
            ('legítimo', 'site limpo, sem correspondência', lambda: verificar(site('limpo'), 'site', imp), 0),
            ('legítimo', 'UTF-8 válido com acentos', lambda: verificar(site('utf8', {'dados/b.js': 'x="ação, função, área"'}), 'site', imp), 0),
            ('legítimo', 'imagens novas (webp, png, jpg) em provas/ e imagens/', lambda: verificar(site('imagens', {
                'provas/p1/q01.webp': webp(), 'provas/p1/q02.png': png(), 'imagens/aula1/fig.jpg': jpg()}), 'site', imp), 0),
            ('legítimo', 'frase curta coincidente (menos de 30 letras do material)', lambda: verificar(site('curta', {
                'dados/b.js': json.dumps(curta, ensure_ascii=False)}), 'site', imp), 0),
            ('legítimo', 'base64 legítimo (imagem em data URI)', lambda: verificar(site('b64-ok', {
                'fontes/x.css': 'a{background:url(data:image/png;base64,' + base64.b64encode(png()).decode() + ')}'}), 'site', imp), 0),
            ('legítimo', 'ZIP interno legítimo no APK (fora de assets/public)', lambda: verificar(apk('zip-ok.apk', [
                ('res/raw/dados.zip', zipar([('a.txt', ' '.join(livre[:5]))]))]), 'apk', imp), 0),
            ('legítimo', 'APK limpo com XML binário do Android', lambda: verificar(apk('limpo.apk', []), 'apk', imp), 0),
            ('questão oficial', 'questão oficial também presente no material, sem aprovação', lambda: verificar(oficial_novo, 'site', imp), 1),
            ('questão oficial', 'a mesma questão, depois de aprovada como texto público', lambda: g2 or verificar(oficial_novo, 'site', imp2), 0),
            ('questão oficial', 'a aprovação não libera o resto do material', lambda: verificar(outro_trecho, 'site', imp2), 1),
            ('questão oficial', 'aprovar mais de 5% do material é recusado', lambda: g3, 2),
            ('contorno 1', 'link simbólico para pasta externa', lambda: verificar(link_pasta, 'site', imp), 1),
            ('contorno 2', 'Windows-1252', lambda: verificar(site('cp1252', {'dados/b.js': ('x="' + trecho + '"').encode('cp1252')}), 'site', imp), 1),
            ('contorno 3', 'UTF-16 (com marca)', lambda: verificar(site('utf16', {'dados/b.js': ('x="' + trecho + '"').encode('utf-16')}), 'site', imp), 1),
            ('contorno 3', 'UTF-16 sem marca', lambda: verificar(site('utf16le', {'dados/b.js': ('x="' + trecho + '"').encode('utf-16-le')}), 'site', imp), 1),
            ('contorno 4', 'trechos separados e emendados com +', lambda: verificar(site('emendado', {'dados/b.js': 'x = ' + emendado + ';'}), 'site', imp), 1),
            ('contorno 5', 'template literal (crase) numa linha com código', lambda: verificar(site('crase', {'dados/b.js': 'const x = `' + trecho + '`, y = 1;'}), 'site', imp), 1),
            ('contorno 6', 'HTML com formatação no meio do texto', lambda: verificar(site('html', {'termos.html': com_tags}), 'site', imp), 1),
            ('contorno 7', 'escapes \\x41 e \\u00e9', lambda: verificar(site('escape', {'dados/b.js': 'x="' + escapado + '"'}), 'site', imp), 1),
            ('contorno 8', 'entradas duplicadas no APK', lambda: verificar(apk('dup.apk', [('assets/public/dados/d.js', restrito), ('assets/public/dados/d.js', 'x=1')]), 'apk', imp), 1),
            ('contorno 8', 'entradas duplicadas no APK, mesmo com conteúdo legítimo', lambda: verificar(apk('dup-ok.apk', [('res/raw/a.txt', 'x=1'), ('res/raw/a.txt', 'x=2')]), 'apk', imp), 1),
            ('contorno 9', 'ZIP interno ao APK com o material', lambda: verificar(apk('zip.apk', [('res/raw/dados.zip', zipar([('a.txt', trecho)]))]), 'apk', imp), 1),
            ('codificação', 'UTF-8 inválido', lambda: verificar(site('utf8-ruim', {'dados/b.js': b'x="\xff\xfe\xc3("'}), 'site', imp), 1),
            ('caminhos', 'link simbólico para arquivo de dentro do build', lambda: verificar(link_interno, 'site', imp), 1),
            ('caminhos', 'link simbólico para arquivo externo', lambda: verificar(link_arq, 'site', imp), 1),
            ('caminhos', 'caminho externo fora de assets/public, com conteúdo legítimo', lambda: verificar(apk('fora-ok.apk', [('res/../../x.txt', 'x=1')]), 'apk', imp), 1),
            ('caminhos', 'caminho externo dentro do APK (../)', lambda: verificar(apk('fora.apk', [('assets/public/../../x.js', 'x=1')]), 'apk', imp), 1),
            ('caminhos', 'arquivo especial (FIFO)', lambda: verificar(fifo, 'site', imp) if hasattr(os, 'mkfifo') else 1, 1),
            ('codificado', 'base64 do material', lambda: verificar(site('b64', {'dados/b.js': 'x="' + base64.b64encode(trecho.encode()).decode() + '"'}), 'site', imp), 1),
            ('codificado', 'base64 de gzip do material', lambda: verificar(site('b64gz', {'dados/b.js': 'x="' + base64.b64encode(gzip.compress(trecho.encode())).decode() + '"'}), 'site', imp), 1),
            ('codificado', 'hexadecimal', lambda: verificar(site('hex', {'dados/b.js': 'x="' + trecho.encode().hex() + '"'}), 'site', imp), 1),
            ('codificado', '%XX (URL)', lambda: verificar(site('url', {'dados/b.js': 'x="' + urllib.parse.quote(trecho) + '"'}), 'site', imp), 1),
            ('fragmentos', 'texto picado em pedaços de 7 caracteres', lambda: verificar(site('picado', {'dados/b.js': 'x=' + picado}), 'site', imp), 1),
            ('normalização', 'sem acentos, em maiúsculas, espaços trocados', lambda: verificar(site('acento', {'dados/b.js': 'x="' + sem_acento + '"'}), 'site', imp), 1),
            ('normalização', 'caracteres invisíveis entre as letras', lambda: verificar(site('invis', {'dados/b.js': 'x="' + '\u200b'.join(trecho) + '"'}), 'site', imp), 1),
            ('html', 'comentário HTML', lambda: verificar(site('coment', {'termos.html': '<!-- ' + trecho + ' --><p>ok</p>'}), 'site', imp), 1),
            ('html', 'atributo HTML', lambda: verificar(site('atrib', {'termos.html': '<span title="' + html.escape(trecho) + '">x</span>'}), 'site', imp), 1),
            ('imagem', 'texto guardado nos bytes de uma imagem', lambda: verificar(site('img-texto', {'provas/p1/q01.webp': webp() + trecho.encode()}), 'site', imp), 1),
            ('imagem', 'ZIP escondido dentro de uma imagem', lambda: verificar(site('img-zip', {'provas/p1/q01.webp': webp() + zipar([('a.txt', 'x')])}), 'site', imp), 1),
            ('imagem', 'texto legítimo com extensão de imagem', lambda: verificar(site('img-falsa-ok', {'provas/p1/q01.webp': 'texto qualquer'}), 'site', imp), 1),
            ('imagem', 'texto com extensão de imagem', lambda: verificar(site('img-falsa', {'provas/p1/q01.webp': trecho}), 'site', imp), 1),
            ('outros', 'cópia exata com outro nome', lambda: verificar(site('copia', {'dados/material.js': restrito}), 'site', imp), 1),
            ('outros', 'marca do código das apostilas', lambda: verificar(site('marca', {'dados/b.js': 'EEAR.apostila = {}'}), 'site', imp), 1),
            ('outros', 'arquivo fora da lista (material.pdf)', lambda: verificar(site('pdf', {'material.pdf': 'x'}), 'site', imp), 1),
            ('outros', 'saída vazia (sem index.html)', lambda: verificar(os.makedirs(cam('vazio')) or cam('vazio'), 'site', imp), 1),
            ('outros', 'nome com "apostila", mesmo com conteúdo legítimo', lambda: verificar(site('nome', {'dados/apostila-propria.js': 'x=1'}), 'site', imp), 1),
            ('outros', 'cópia exata de um arquivo restrito binário (só o hash a reconhece)', lambda: verificar(site('binario', {
                'provas/p1/q09.webp': binario}), 'site', com_corrompido('bin.json', lambda d: d.update(inteiros=sorted(d['inteiros'] + [sha256(binario)])))), 1),
            ('APK', 'entrada criptografada', lambda: verificar(escrever(cam('cripto.apk'), cifrar(zipar(base_apk + [('res/raw/a.bin', b'x')]), 'res/raw/a.bin')), 'apk', imp), 2),
            ('APK', 'bomba de descompressão', lambda: verificar(apk('bomba.apk', [('res/raw/z.bin', b'\x00' * 10_000_000)]), 'apk', imp), 2),
            ('falha segura', 'impressões ausentes', lambda: verificar(site('f1'), 'site', cam('nao-existe.json')), 2),
            ('falha segura', 'impressões que não são JSON', lambda: verificar(site('f2'), 'site', escrever(cam('ruim.json'), '{"versao": 2,')), 2),
            ('falha segura', 'impressões de outra versão', lambda: verificar(site('f3'), 'site', com_corrompido('v.json', lambda d: d.update(versao=1))), 2),
            ('falha segura', 'impressões com valor que não é hash', lambda: verificar(site('f4'), 'site', com_corrompido('h.json', lambda d: d['impressoes'].__setitem__(0, 'texto'))), 2),
            ('falha segura', 'impressões fora de ordem', lambda: verificar(site('f5'), 'site', com_corrompido('o.json', lambda d: d['impressoes'].reverse())), 2),
            ('falha segura', 'impressões cortadas (poucas)', lambda: verificar(site('f6'), 'site', com_corrompido('p.json', lambda d: d.update(impressoes=d['impressoes'][:10]))), 2),
            ('falha segura', 'aprovação acima do limite', lambda: verificar(site('f7'), 'site', com_corrompido('a.json', lambda d: d.update(
                aprovadas=d['impressoes'][:100], impressoes=d['impressoes'][100:]))), 2),
            ('falha segura', 'impressões trocadas por hashes de outra coisa (validar)', lambda: validar(com_corrompido('t.json', lambda d: d.update(
                impressoes=sorted({'%016x' % outro.getrandbits(64) for _ in d['impressoes']}))), [fonte]), 2),
            ('falha segura', 'impressões corretas (validar)', lambda: validar(imp, [fonte]), 0),
            ('falha segura', 'alvo inexistente', lambda: verificar(cam('nada'), 'site', imp), 2),
            ('remoção', 'workflows e build.py corretos', lambda: wf('w1', wf_ok), 0),
            ('remoção', 'site.yml sem a verificação', lambda: wf('w2', dict(wf_ok, **{'site.yml': sem_site})), 2),
            ('remoção', 'android.yml com a verificação depois do envio', lambda: wf('w3', dict(wf_ok, **{'android.yml': apk_depois})), 2),
            ('remoção', 'build.py sem a conferência', lambda: wf('w4', wf_ok, 'print("sem conferência")'), 2),
            ('limite conhecido', 'palavras em outra ordem (não detecta)', lambda: verificar(site('ordem', {'dados/b.js': json.dumps(' '.join(reversed(palavras)), ensure_ascii=False)}), 'site', imp), 0),
        ]
        for grupo, nome, f, esperado in casos:
            with contextlib.redirect_stdout(io.StringIO()):
                try:
                    obtido = f()
                except Exception as e:
                    obtido = f'exceção {type(e).__name__}: {e}'
            ok = obtido == esperado
            linhas.append(f"{'✓' if ok else '✗'} [{grupo}] {nome}: esperado {esperado}, obtido {obtido}")
            if not ok:
                falhas.append(linhas[-1])
    if verboso:
        print('\n'.join(linhas))
    for f in falhas:
        print('AUTOTESTE FALHOU:', f)
    print(f'OK: autoteste da verificação ({len(linhas)} casos)' if not falhas else f'FALHOU: {len(falhas)} de {len(linhas)} casos do autoteste')
    return 1 if falhas else 0


if __name__ == '__main__':
    a = sys.argv[1:]
    if a[:1] == ['verificar'] and len(a) == 3 and a[2] in ('--site', '--app', '--apk'):
        sys.exit(verificar(a[1], a[2][2:]))
    if a == ['validar']:
        sys.exit(validar())
    if a[:1] == ['autoteste'] and a[1:] in ([], ['-v']):
        sys.exit(autoteste(a[1:] == ['-v']))
    if a == ['conferir-workflows']:
        p = conferir_workflows()
        print('\n'.join(f'ERRO: {x}' for x in p) or 'OK: o build e os workflows conferem o conteúdo antes de enviar')
        sys.exit(2 if p else 0)
    if a[:1] == ['gerar'] and '--aprovado' in a:
        i = a.index('--aprovado')
        sys.exit(gerar(a[1:i], a[i + 1:]))
    print(__doc__)
    sys.exit(2)
