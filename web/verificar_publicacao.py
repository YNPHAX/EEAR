"""Confere que nada do material restrito (as apostilas de outro curso) vai para o site ou para o APK.

Camadas. Cada uma pega o que outra deixar passar por engano. Nenhuma impede quem tem permissão de escrita de desligar
tudo de propósito: isso só as regras da main no GitHub impedem, e elas ficam fora do repositório.
  1. web/build.py não copia o material e termina chamando conferir_build() (autoteste, impressões, workflows e a
     saída). Se algo falhar ou não puder rodar, a saída é apagada.
  2. Nos workflows, o passo imediatamente anterior a cada envio (pacote do Pages, artefato do APK) roda esta
     verificação sobre o mesmo caminho enviado. Os jobs com permissão de escrita não baixam o código: só publicam o
     que outro job já enviou verificado.
  3. conferir-workflows lê os workflows como YAML e o build.py pela árvore do Python (comentários e textos soltos não
     contam) e falha se a camada 1 ou a 2 deixar de valer, ou se aparecer ação, gatilho, permissão ou segredo fora do
     previsto.
  4. O arquivo de impressões tem o hash fixado aqui (IMPRESSOES_SHA256): trocar um exige trocar o outro. Cada
     impressão aprovada como texto público tem a origem registrada (o arquivo do curso em que ela está), é conferida
     a cada build e só é aceita nesse mesmo arquivo publicado (nos bytes do próprio APK, fora das entradas, valem
     todas, porque as entradas guardadas sem compressão aparecem ali). Enquanto o material estiver no repositório,
     validar também refaz as impressões a partir dele e compara.
  5. Fora do repositório, quando o dono configurar no GitHub: ruleset da main (PR, verificações obrigatórias,
     revisão do dono do código pelo CODEOWNERS) e o ambiente github-pages restrito à main. Sem isso, quem tem
     permissão de escrita pode mudar as camadas 1 a 4 num commit.

Uso:
  python3 -I web/verificar_publicacao.py verificar _site --site      (saída do build do site)
  python3 -I web/verificar_publicacao.py verificar app/www --app     (conteúdo do app de Android)
  python3 -I web/verificar_publicacao.py verificar missao-eear.apk --apk
  python3 -I web/verificar_publicacao.py validar                     (confere o arquivo de impressões)
  python3 -I web/verificar_publicacao.py autoteste [-v]              (confere a própria verificação, com material de mentira)
  python3 -I web/verificar_publicacao.py conferir-workflows          (confere as camadas 1 e 2)
  python3 -I web/verificar_publicacao.py cobertura                   (mede, só com números, a garantia descrita abaixo)
  python3 -I web/verificar_publicacao.py gerar curso/dados/apostila.js --aprovado curso/dados/provas.js curso/dados/videoaulas.js
      (refaz web/impressoes-restritas.json; só quando o material mudar ou para aprovar um texto público. Aprova só
      arquivos, nunca pastas, e diz o novo valor de IMPRESSOES_SHA256, que tem de mudar no mesmo PR.)

Saídas: 0 tudo certo; 1 achou algo (não publique); 2 não conseguiu verificar (também não publique).
As mensagens dizem só o arquivo, o motivo e quantidades, nunca o texto.

Como compara. O texto de cada arquivo, e o que estiver dentro dele em base64 (padrão ou url-safe, também quebrado em
linhas), hexadecimal (também separado por espaços), %XX, gzip (um ou mais membros), zlib (e o que vier depois do fim)
ou zip, até 3 níveis, passa por uma normalização (escapes \\xNN, \\uNNNN, \\u{N} e octais, entidades HTML, acentos,
maiúsculas, tags) e vira uma sequência só de letras e números. As impressões são hashes de 64 bits de trechos de 30
letras do material, escolhidos por winnowing (o menor hash de cada 12 trechos seguidos).
  - Em texto corrido (em que cada 30 letras seguidas têm pelo menos 10 letras diferentes), qualquer pedaço de 41
    letras ou mais igual ao material é encontrado; de 30 a 40, às vezes; com menos de 30, nunca.
  - Nas partes do material com pouca variedade de letras (gabaritos, números, tabelas) não há impressões e a garantia
    de 41 não vale. Medido no material atual com "cobertura": 14,28% das letras ficam em regiões assim, e na pior
    delas só um pedaço de 173 letras é garantido.
  - Um texto que não é do material pode coincidir com uma impressão por acaso (hash de 64 bits): bloqueio sem motivo,
    com chance desprezível. Não há garantia matemática além destas; é uma rede de segurança e não substitui a revisão.
Também barra: links simbólicos, arquivos especiais, pastas ilegíveis e caminhos fora da área do build; texto publicado
que não é UTF-8 (UTF-16, UTF-32, Windows-1252); arquivo cujo conteúdo não corresponde à extensão; arquivo compactado
escondido em imagem; entradas repetidas, criptografadas ou com caminho estranho em zip e APK; aninhamento demais e
bombas de descompressão (estes dois dão 2); cópia exata, nomes e marcas das apostilas; arquivos fora da lista do que
pode ser publicado.
Não detecta: paráfrase; palavras em outra ordem; texto dentro de imagem (só o que está guardado nos bytes); pedaços
com menos de 30 letras; ofuscação deliberada (letras de outro alfabeto parecidas, letras intercaladas com outros
caracteres ou números, criptografia, codificações não listadas acima, como escapes de CSS, deflate sem cabeçalho e
texto comprimido nos metadados de PNG)."""
import ast, base64, binascii, collections, contextlib, gzip, hashlib, html, io, json, os, random, re, stat, sys, tempfile
import unicodedata, urllib.parse, warnings, zipfile, zlib

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMPRESSOES = os.path.join(RAIZ, 'web', 'impressoes-restritas.json')
# sha256 da forma canônica de web/impressoes-restritas.json; "gerar" diz o valor novo quando o arquivo é refeito
IMPRESSOES_SHA256 = 'd3420e2e25b9ace1d0cdddae99ffc7626c08f2d7b65ea175448d33c64b5e6895'
MATERIAL = ['curso/dados/apostila.js']   # caminhos dentro do repositório
FONTES = [os.path.join(RAIZ, *m.split('/')) for m in MATERIAL]
WORKFLOWS = os.path.join(RAIZ, '.github', 'workflows')
BUILD = os.path.join(RAIZ, 'web', 'build.py')
VERSAO, K, W = 3, 30, 12          # trechos de K letras; acha com certeza qualquer trecho comum de K + W - 1 = 41 letras
MIN_LETRAS = 10                   # trecho com menos letras diferentes que isso (gabarito, números) não vira impressão
LIMITE_APROVADO = 0.01            # no máximo 1% das impressões do material podem ser aprovadas como texto público
MIN_IMPRESSOES = 500
PROFUNDIDADE, MAX_BYTES, MAX_TAXA, MAX_SAIDA = 3, 1_500_000_000, 500, 100_000_000
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
B64 = re.compile(r'(?:[A-Za-z0-9+/_-]|\\[nr]|\r?\n){40,}={0,2}')
B64_URL = str.maketrans('-_', '+/')
HEX = re.compile(r'[0-9a-fA-F](?:[0-9a-fA-F]|[ :](?=[0-9a-fA-F])){63,}')
UTF8 = re.compile(rb'(?:[\t\n\r\x20-\x7e]|[\xc2-\xdf][\x80-\xbf]|[\xe0-\xef][\x80-\xbf]{2}|[\xf0-\xf4][\x80-\xbf]{3}){16,}')
UTF16 = (re.compile(rb'(?:[\t\n\r\x20-\x7e\xa0-\xff]\x00){12,}'), re.compile(rb'(?:\x00[\t\n\r\x20-\x7e\xa0-\xff]){12,}'))


class NaoVerificavel(Exception):
    """A conferência não consegue concluir: o resultado é 2 e nada pode ser publicado."""


def sha256(b):
    return hashlib.sha256(b).hexdigest()


def canonico(dados):
    """O hash do conteúdo do arquivo de impressões, sem depender de espaços ou quebras de linha (Windows)."""
    return sha256(json.dumps(dados, sort_keys=True, separators=(',', ':')).encode())


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


def todos_do_texto(texto):
    return set().union(*(todos(fl) for fl in fluxos(texto)))


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
    """Arquivos de uma pasta de build. Links simbólicos, arquivos especiais e caminhos de fora não são lidos; uma pasta
    que não dá para ler interrompe a conferência."""
    base = os.path.realpath(raiz)
    juncao = getattr(os.path, 'isjunction', lambda p: False)  # Windows

    def erro(e):
        raise NaoVerificavel(f'pasta que não dá para ler ({type(e).__name__})')
    for atual, dirs, fs in os.walk(raiz, followlinks=False, onerror=erro):
        for d in list(dirs):
            p = os.path.join(atual, d)
            if os.path.islink(p) or juncao(p):
                dirs.remove(d)
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


def contar(ctx, saida, entrada):
    """Soma o que já foi descompactado e barra o que parece bomba de descompressão."""
    if saida > 1_000_000 and saida > MAX_TAXA * max(entrada, 1):
        raise NaoVerificavel('taxa de compressão suspeita (possível bomba de descompressão)')
    ctx['bytes'] += saida
    if ctx['bytes'] > MAX_BYTES:
        raise NaoVerificavel('conteúdo descompactado grande demais para conferir')


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
        contar(ctx, i.file_size, i.compress_size)
        try:
            itens.append((n, z.read(i)))
        except (zipfile.BadZipFile, NotImplementedError, RuntimeError, OSError, zlib.error, EOFError) as e:
            raise NaoVerificavel(f'{n}: não deu para descompactar ({type(e).__name__})')
    return itens, probs


def descomprimir(b, ctx):
    """O conteúdo de um gzip (todos os membros, emendados) ou de um zlib, e o que sobra depois do fim. None se não for."""
    gz = b[:2] == b'\x1f\x8b'
    partes, resto = [], b
    while True:
        d = zlib.decompressobj(16 + zlib.MAX_WBITS if gz else zlib.MAX_WBITS)
        try:
            saida = d.decompress(resto, MAX_SAIDA)
        except zlib.error:
            break                      # o que sobrou não é outro membro: é conferido como bytes
        if d.unconsumed_tail:
            raise NaoVerificavel('conteúdo comprimido grande demais para conferir')
        contar(ctx, len(saida), len(resto) - len(d.unused_data))
        partes.append(saida)
        resto = d.unused_data if d.eof else b''
        if not (gz and resto[:2] == b'\x1f\x8b'):
            break
    return (b''.join(partes), resto) if partes else None


def textos_de_binario(b):
    """Texto guardado nos bytes de um arquivo binário (UTF-8, UTF-16 LE e UTF-16 BE), na ordem em que aparece."""
    partes = [m.group().decode('utf-8', 'replace') for m in UTF8.finditer(b)]
    partes += [m.group().decode('utf-16-le' if i == 0 else 'utf-16-be', 'replace') for i, rx in enumerate(UTF16) for m in rx.finditer(b)]
    return '\n'.join(partes)


def codificados(s):
    """Bytes que podem estar escondidos num texto em base64 (padrão ou url-safe, com ou sem quebras de linha) ou em
    hexadecimal. Tenta todos os alinhamentos, para não perder a sequência quando há letras coladas antes dela."""
    for m in B64.finditer(s):
        t = re.sub(r'\\[nr]|[\r\n=]', '', m.group()).translate(B64_URL)
        for i in range(4):
            u = t[i:]
            u = u[:len(u) - (len(u) % 4 == 1)]            # um caractere sozinho no fim não forma byte
            try:
                b = base64.b64decode(u + '=' * (-len(u) % 4), validate=True)
            except (binascii.Error, ValueError):
                continue
            if len(b) >= 24:
                yield b
    for m in HEX.finditer(s):
        t = re.sub('[ :]', '', m.group())
        for i in range(2):
            yield bytes.fromhex(t[i:len(t) - (len(t) - i) % 2])


def analisar_texto(t, imp, ctx, nivel, nome, livres):
    probs = []
    bruto = [t, sem_escapes(t)]
    m = [x for x in MARCAS if any(x in s for s in bruto)] + [p for p in PADROES if any(re.search(p, s) for s in bruto)]
    if m:
        probs.append(f'{len(m)} marca(s) do material restrito')
    k = set()
    for fl in fluxos(t):
        k |= todos(fl) & imp['protegidas']
    k -= livres
    if k:
        probs.append(f'{len(k)} impressão(ões) do material restrito')
    for b in codificados(t):
        probs += [f'dentro de um trecho codificado: {p}' for p in analisar(nome, b, imp, ctx, nivel + 1, False, livres)]
    return probs


def analisar(nome, b, imp, ctx, nivel=0, estrito=False, livres=frozenset()):
    """Problemas de um arquivo ou de algo de dentro dele. estrito: texto publicado, que tem de ser UTF-8 válido.
    livres: as impressões aprovadas para este arquivo publicado (as aprovadas para outros arquivos não valem aqui)."""
    if nivel > PROFUNDIDADE:
        raise NaoVerificavel(f'{nome}: conteúdo aninhado demais para conferir')
    probs = ['cópia exata de um arquivo restrito'] if sha256(b) in imp['inteiros'] else []
    if estrito:
        if b[:2] in (b'\xff\xfe', b'\xfe\xff') or b[:4] in (b'\x00\x00\xfe\xff', b'\xff\xfe\x00\x00'):
            return probs + ['texto em UTF-16 ou UTF-32 (só UTF-8 pode ser publicado)']
        if b'\x00' in b:
            return probs + ['texto com byte nulo (provável UTF-16 sem marca; só UTF-8 pode ser publicado)']
        try:
            return probs + analisar_texto(b.decode('utf-8'), imp, ctx, nivel, nome, livres)
        except UnicodeDecodeError:
            return probs + ['texto que não é UTF-8 válido (ex.: Windows-1252; só UTF-8 pode ser publicado)']
    dentro = lambda rotulo, d: [f'{rotulo}: {p}' for p in analisar(nome, d, imp, ctx, nivel + 1, False, livres)]
    if b[:4] == b'PK\x03\x04' or (len(b) > 22 and zipfile.is_zipfile(io.BytesIO(b))):
        itens, estrutura = desempacotar(b, ctx)
        probs += [f'dentro do arquivo compactado, {n}: {p}' for n, p in estrutura]
        for n, d in itens:
            probs += [f'dentro do arquivo compactado, {n}: {p}' for p in analisar(f'{nome}!{n}', d, imp, ctx, nivel + 1, False, livres)]
    elif b[:2] == b'\x1f\x8b' or (b[:1] == b'\x78' and len(b) > 2 and (b[0] * 256 + b[1]) % 31 == 0):
        r = descomprimir(b, ctx)
        if r:
            probs += dentro('dentro de um trecho comprimido', r[0])
            if r[1]:
                probs += dentro('depois do fim de um trecho comprimido', r[1])
    # e sempre os próprios bytes também: nada escondido fora das entradas do zip ou depois do fim de um trecho passa
    try:
        t = b.decode('utf-8')
    except UnicodeDecodeError:
        t = textos_de_binario(b)
    return probs + analisar_texto(t, imp, ctx, nivel, nome, livres)


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
    return probs + analisar(rel, b, imp, ctx, 0, ext in TEXTO or rel.startswith('dados/'), imp['aprovadas'].get(rel, frozenset()))


def problemas(alvo, imp, modo):
    ctx, achados, publicos = {'bytes': 0}, [], []
    if os.path.islink(alvo):
        return [(alvo, 'link simbólico (só arquivos de verdade podem ser publicados)')]
    if modo == 'apk':
        b = open(alvo, 'rb').read()
        itens, achados = desempacotar(b, ctx)
        for n, d in itens:
            if n.startswith('assets/public/'):
                publicos.append(n[len('assets/public/'):])
                achados += [(n, p) for p in analisar_publico(publicos[-1], d, imp, ctx)]
            else:
                achados += [(n, p) for p in analisar(n, d, imp, ctx)]
        # os bytes do próprio APK (o que estiver fora das entradas); aqui valem todas as aprovações, porque as entradas
        # guardadas sem compressão, como dados/provas.js, aparecem também nos bytes
        livres = frozenset().union(*imp['aprovadas'].values())
        achados += [(os.path.basename(alvo), f'nos bytes do próprio APK: {p}') for p in analisar_texto(textos_de_binario(b), imp, ctx, 0, alvo, livres)]
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

def publicado(arq):
    """Onde um arquivo do curso aparece no site: curso/dados/provas.js vira dados/provas.js."""
    return re.sub(r'^(?:curso|web/legal)/', '', arq)


def aprovavel(arq):
    """Só um arquivo do curso que é publicado pode justificar uma aprovação: nunca uma pasta, nunca o material."""
    return (isinstance(arq, str) and re.fullmatch(r'(?:curso|web/legal)/[a-z0-9_/-]+\.(?:js|html)', arq) is not None
            and '..' not in arq.split('/') and arq not in MATERIAL and 'apostila' not in arq
            and any(re.fullmatch(rx, publicado(arq)) for rx in PUBLICAVEL))


def carregar(imp_arq):
    """Lê o arquivo de impressões e confere a forma. Qualquer defeito impede a verificação."""
    imp = json.load(open(imp_arq, encoding='utf-8'))
    if not isinstance(imp, dict) or set(imp) != {'versao', 'k', 'w', 'min_letras', 'inteiros', 'impressoes', 'aprovadas'}:
        raise ValueError('formato diferente do esperado')
    if (imp['versao'], imp['k'], imp['w'], imp['min_letras']) != (VERSAO, K, W, MIN_LETRAS):
        raise ValueError('versão ou parâmetros diferentes dos desta verificação')

    def hashes(lista, tam, minimo, nome):
        if not isinstance(lista, list) or len(lista) < minimo:
            raise ValueError(f'"{nome}" vazio ou curto demais')
        if any(not isinstance(x, str) or not re.fullmatch('[0-9a-f]{%d}' % tam, x) for x in lista):
            raise ValueError(f'"{nome}" tem valores que não são hashes')
        if lista != sorted(set(lista)):
            raise ValueError(f'"{nome}" fora de ordem ou com repetições')
        return frozenset(lista)
    inteiros, impressoes = hashes(imp['inteiros'], 64, 1, 'inteiros'), hashes(imp['impressoes'], 16, MIN_IMPRESSOES, 'impressoes')
    if not isinstance(imp['aprovadas'], dict):
        raise ValueError('"aprovadas" tem de dizer de que arquivo vem cada aprovação')
    origem = {}
    for arq, lista in imp['aprovadas'].items():
        if not aprovavel(arq):
            raise ValueError(f'aprovação com origem que não pode aprovar ({arq})')
        origem[arq] = hashes(lista, 16, 1, f'aprovadas de {arq}')
    aprovadas = frozenset().union(*origem.values())
    if aprovadas & impressoes:
        raise ValueError('impressões e aprovações se sobrepõem')
    if len(aprovadas) > LIMITE_APROVADO * (len(impressoes) + len(aprovadas)):
        raise ValueError('mais texto aprovado como público do que o limite permite')
    return {'inteiros': inteiros, 'impressoes': impressoes, 'protegidas': impressoes | aprovadas, 'origem': origem,
            'aprovadas': {publicado(a): s for a, s in origem.items()}, 'sha': canonico(imp)}


def verificar(alvo, modo, imp_arq=IMPRESSOES):
    try:
        imp = carregar(imp_arq)
    except Exception as e:
        print(f'ERRO: o arquivo de impressões {os.path.basename(imp_arq)} está ausente ou com defeito ({e}); nada pode ser publicado')
        return 2
    if os.path.abspath(imp_arq) == IMPRESSOES:
        # com o arquivo do projeto, confere também o hash fixado, a origem das aprovações e o material
        with contextlib.redirect_stdout(io.StringIO()) as buf:
            r = validar(imp_arq)
        if r:
            print(buf.getvalue(), end='')
            print('ERRO: nada pode ser publicado sem impressões válidas')
            return 2
    if not os.path.lexists(alvo):
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


def validar(imp_arq=IMPRESSOES, fontes=FONTES, fixado=IMPRESSOES_SHA256, raiz=RAIZ):
    """Confere o arquivo de impressões: a forma; o hash fixado no verificador; que cada aprovação ainda está no arquivo
    de origem; e, enquanto o material estiver no repositório, que as impressões são as dele."""
    try:
        imp = carregar(imp_arq)
    except Exception as e:
        print(f'ERRO: o arquivo de impressões {os.path.basename(imp_arq)} está ausente ou com defeito ({e})')
        return 2
    if imp['sha'] != fixado:
        print('ERRO: o arquivo de impressões não é o fixado no verificador (IMPRESSOES_SHA256). Se ele foi refeito de '
              'propósito com "gerar", mude os dois no mesmo PR, para a troca aparecer na revisão.')
        return 2
    for arq, hs in sorted(imp['origem'].items()):
        try:
            t = open(os.path.join(raiz, *arq.split('/')), 'rb').read().decode('utf-8')
        except (OSError, UnicodeDecodeError):
            print(f'ERRO: a aprovação vem de {arq}, que não existe nesta cópia ou não é UTF-8')
            return 2
        sumiram = hs - todos_do_texto(t)
        if sumiram:
            print(f'ERRO: {len(sumiram)} impressão(ões) aprovadas por {arq} não estão mais nesse arquivo; refaça com "gerar"')
            return 2
    presentes = [f for f in fontes if os.path.exists(f)]
    n = f'{len(imp["impressoes"])} impressões, mais {len(imp["protegidas"]) - len(imp["impressoes"])} aprovadas com origem conferida'
    if not presentes:
        print(f'OK: {n}, iguais às fixadas no verificador; o material não está nesta cópia, então não foram refeitas a partir dele')
        return 0
    if len(presentes) != len(fontes):
        print('ERRO: só parte do material está nesta cópia; não dá para conferir as impressões')
        return 2
    sel, inteiros = set(), set()
    for f in fontes:
        b = open(f, 'rb').read()
        inteiros.add(sha256(b))
        sel |= impressoes_de(b.decode('utf-8', 'replace'))
    if not inteiros <= imp['inteiros'] or sel != imp['protegidas']:
        print('ERRO: as impressões não correspondem ao material atual; refaça com "gerar" e revise o resultado')
        return 2
    print(f'OK: {n}, fixadas no verificador e correspondentes ao material')
    return 0


def gerar(fontes, aprovados, saida=IMPRESSOES, raiz=RAIZ):
    """Gera as impressões do material. As que também estão num arquivo aprovado (o próprio curso, uma prova oficial
    pública) ficam registradas com esse arquivo como origem e só são aceitas nele, até o limite de 1% do total."""
    origens = []
    for a in aprovados:
        rel = os.path.relpath(os.path.abspath(a), raiz).replace(os.sep, '/')
        if not os.path.isfile(a) or not aprovavel(rel):
            print(f'ERRO: {a} não pode aprovar texto (só arquivos publicados do curso, um por um; nunca pastas nem o material). Nada foi gravado.')
            return 2
        origens.append((rel, open(a, 'rb').read().decode('utf-8', 'replace')))
    sel, inteiros = set(), set()
    for f in fontes:
        b = open(f, 'rb').read()
        inteiros.add(sha256(b))
        sel |= impressoes_de(b.decode('utf-8', 'replace'))
    aprovadas = {rel: sorted(sel & todos_do_texto(t)) for rel, t in origens}
    aprovadas = {rel: hs for rel, hs in aprovadas.items() if hs}
    juntas = set().union(*aprovadas.values())
    if len(juntas) > LIMITE_APROVADO * len(sel):
        print(f'ERRO: {len(juntas)} de {len(sel)} impressões estariam aprovadas como públicas (limite: {LIMITE_APROVADO:.0%}); '
              'o texto "aprovado" parece conter o material restrito. Nada foi gravado.')
        return 2
    dados = {'versao': VERSAO, 'k': K, 'w': W, 'min_letras': MIN_LETRAS, 'inteiros': sorted(inteiros),
             'impressoes': sorted(sel - juntas), 'aprovadas': aprovadas}
    with open(saida, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(dados, f, indent=0, sort_keys=True)
        f.write('\n')
    print(f'{saida}: {len(sel - juntas)} impressões, {len(inteiros)} arquivo(s) inteiro(s), aprovadas: '
          + (', '.join(f'{len(hs)} de {rel}' for rel, hs in sorted(aprovadas.items())) or 'nenhuma'))
    print(f'IMPRESSOES_SHA256 = {canonico(dados)!r}  (mude no verificador, no mesmo PR)')
    return 0


def cobertura(fontes=FONTES, imp_arq=IMPRESSOES):
    """Mede onde a garantia de 41 letras não vale no material, só com números (para conferir a documentação)."""
    imp = carregar(imp_arq)
    if not all(os.path.exists(f) for f in fontes):
        print('ERRO: o material não está nesta cópia')
        return 2
    total = fora = pior = 0
    for f in fontes:
        for fl in fluxos(open(f, 'rb').read().decode('utf-8', 'replace')):
            pos = [-1] + [i for i in range(len(fl) - K + 1) if _h(fl[i:i + K]) in imp['impressoes']] + [len(fl) - K + 1]
            total, letras = total + len(fl), set()
            for a, b in zip(pos, pos[1:]):
                if b - a > W:          # entre duas impressões, as letras a+1 .. b+K-2 podem passar sem ser vistas
                    letras.update(range(a + 1, min(b + K - 1, len(fl))))
                    pior = max(pior, b - a + K - 1)
            fora += len(letras)
    print(f'{fora / total:.2%} das letras do material ficam em regiões em que a garantia de {K + W - 1} letras não vale; '
          f'na pior delas, só um pedaço de {pior} letras é garantido')
    return 0


# --- proteção contra remoção acidental: workflows e build.py ---

class Yaml:
    """Leitor do subconjunto de YAML dos workflows: mapas e listas em blocos, textos simples ou entre aspas, listas
    curtas [a, b] e blocos |. Qualquer outra construção (âncoras, tags, mapas {..}, chaves repetidas, escapes,
    tabulação, valor em várias linhas) dá ValueError: a conferência falha em vez de adivinhar como o GitHub leria."""

    def __init__(s, texto):
        texto = texto.replace('\r\n', '\n')
        if '\t' in texto or '\r' in texto:
            raise ValueError('tabulação ou quebra de linha estranha')
        s.l, s.i = texto.split('\n'), 0
        s.pular()
        s.raiz = s.no(0) if s.i < len(s.l) else None
        if s.i < len(s.l):
            raise ValueError(f'linha {s.i + 1}: fora da estrutura')

    def pular(s):
        while s.i < len(s.l) and (not s.l[s.i].strip() or s.l[s.i].lstrip().startswith('#')):
            s.i += 1

    def ind(s):
        return len(s.l[s.i]) - len(s.l[s.i].lstrip(' '))

    def mais(s, ind):
        s.pular()
        return s.i < len(s.l) and s.ind() > ind

    def item(s, ind):
        return s.i < len(s.l) and s.ind() == ind and re.match(r'-( |$)', s.l[s.i][ind:])

    def no(s, ind):
        return s.lista(ind) if s.item(ind) else s.mapa(ind)

    def mapa(s, ind):
        out = {}
        while s.i < len(s.l) and s.ind() == ind:
            n, m = s.i + 1, re.match(r'([A-Za-z0-9_-]+):(?: +(.*))?$', s.l[s.i][ind:])
            if not m:
                raise ValueError(f'linha {n}: esperava "chave: valor"')
            k, v = m.group(1), (m.group(2) or '').strip()
            if k in out:
                raise ValueError(f'linha {n}: chave repetida ({k})')
            s.i += 1
            if not v or v.startswith('#'):
                out[k] = s.no(s.ind()) if s.mais(ind) else s.lista(ind) if s.item(ind) else None
            elif v[0] == '|':
                out[k] = s.bloco(v, ind, n)
            else:
                out[k] = s.valor(v, n)
                if s.mais(ind):
                    raise ValueError(f'linha {s.i + 1}: valor em várias linhas')
            s.pular()
        if s.i < len(s.l) and s.ind() > ind:
            raise ValueError(f'linha {s.i + 1}: indentação inconsistente')
        return out

    def lista(s, ind):
        out = []
        while s.item(ind):
            n, resto = s.i + 1, s.l[s.i][ind + 1:]
            v = resto.strip()
            if not v or v.startswith('#'):
                s.i += 1
                out.append(s.no(s.ind()) if s.mais(ind) else None)
            elif re.match(r'[A-Za-z0-9_-]+:( |$)', v):
                col = ind + 1 + len(resto) - len(resto.lstrip(' '))
                s.l[s.i] = ' ' * col + v       # o mapa começa na mesma linha do "-"
                out.append(s.mapa(col))
            elif v[0] == '|' or re.match(r'-( |$)', v):
                raise ValueError(f'linha {n}: construção de YAML não aceita')
            else:
                s.i += 1
                out.append(s.valor(v, n))
                if s.mais(ind):
                    raise ValueError(f'linha {s.i + 1}: valor em várias linhas')
            s.pular()
        if s.i < len(s.l) and s.ind() > ind:
            raise ValueError(f'linha {s.i + 1}: indentação inconsistente')
        return out

    def valor(s, v, n, lista=False):
        if v[0] == "'":
            m = re.fullmatch(r"'((?:[^']|'')*)'(?: +#.*)?", v)
            if not m:
                raise ValueError(f'linha {n}: aspas simples sem fechar')
            return m.group(1).replace("''", "'")
        if v[0] == '"':
            m = re.fullmatch(r'"([^"\\]*)"(?: +#.*)?', v)
            if not m:
                raise ValueError(f'linha {n}: aspas duplas com escape ou sem fechar')
            return m.group(1)
        if v[0] == '[' and not lista:
            m = re.fullmatch(r'\[([^\[\]{}]*)\](?: +#.*)?', v)
            if not m or not all(x.strip() for x in m.group(1).split(',')):
                raise ValueError(f'linha {n}: lista [..] não aceita')
            return [s.valor(x.strip(), n, True) for x in m.group(1).split(',')]
        if v[0] in '&*!%@`{[]}|>?:,#' or v.startswith('- ') or (lista and re.search(r'[\[\]{}#]', v)):
            raise ValueError(f'linha {n}: construção de YAML não aceita')
        v = v.split(' #', 1)[0].rstrip()
        if ': ' in v or v.endswith(':'):
            raise ValueError(f'linha {n}: ": " dentro de um valor sem aspas')
        return v

    def bloco(s, v, ind, n):
        if not re.fullmatch(r'\|-?(?: +#.*)?', v):
            raise ValueError(f'linha {n}: bloco de texto não aceito')
        inicio = s.i
        while s.i < len(s.l) and (not s.l[s.i].strip() or s.ind() > ind):
            s.i += 1
        fim = s.i
        while fim > inicio and not s.l[fim - 1].strip():
            fim -= 1
        linhas = s.l[inicio:fim]
        if not linhas:
            return ''
        c = next(len(x) - len(x.lstrip(' ')) for x in linhas if x.strip())
        if any(x.strip() and len(x) - len(x.lstrip(' ')) < c for x in linhas):
            raise ValueError(f'linha {n}: indentação inconsistente num bloco de texto')
        return '\n'.join(x[c:] for x in linhas) + ('' if fim == len(s.l) or v[1:2] == '-' else '\n')   # |- tira o último \n


# ações conhecidas e o que cada uma faz; outra ação só entra aqui depois de alguém revisar o que ela publica
ACOES = {'actions/checkout': 'código', 'actions/setup-node': 'ferramenta', 'actions/setup-java': 'ferramenta',
         'actions/download-artifact': 'baixar', 'actions/upload-artifact': 'enviar',
         'actions/upload-pages-artifact': 'enviar', 'actions/deploy-pages': 'publicar'}
VERIFICACAO = re.compile(r'python3 -I web/verificar_publicacao\.py (?:autoteste|validar|conferir-workflows|'
                         r'verificar ([A-Za-z0-9_][A-Za-z0-9_./-]*) --(site|app|apk))')
STATUS = re.compile(r'\b(?:always|failure|cancelled|success)\s*\(')


def textos(x):
    if isinstance(x, dict):
        for k, v in x.items():
            yield k
            yield from textos(v)
    elif isinstance(x, list):
        for v in x:
            yield from textos(v)
    elif isinstance(x, str):
        yield x


def verificados(passo):
    """Os (caminho, modo) que um passo verifica, se ele só rodar a verificação: nada de if, env, shell, outra pasta,
    continue-on-error, nem outro comando que possa desligá-la."""
    if not isinstance(passo, dict) or set(passo) - {'name', 'run'} or not isinstance(passo.get('run'), str):
        return set()
    feitos = set()
    for linha in filter(None, (x.strip() for x in passo['run'].split('\n'))):
        m = VERIFICACAO.fullmatch(linha)
        if not m:
            return set()
        if m.group(1):
            feitos.add((m.group(1).rstrip('/'), m.group(2)))
    return feitos


def regras(wf):
    """Problemas de um workflow já lido. Veja as camadas no começo do arquivo."""
    if not isinstance(wf, dict) or not isinstance(wf.get('jobs'), dict) or not wf['jobs']:
        return ['sem jobs']
    p, on = [], wf.get('on')
    if {'pull_request_target', 'workflow_run'} & (set(on) if isinstance(on, (dict, list)) else {on}):
        p.append('gatilho pull_request_target ou workflow_run (roda com permissões de escrita sobre código de fora)')
    if wf.get('permissions') != {'contents': 'read'}:
        p.append('as permissões do workflow têm de ser só "contents: read" (escrita, só no job que publica)')
    if 'defaults' in wf or any(re.search(r'\$\{\{[^}]*\bsecrets\b', t) for t in textos(wf)):
        p.append('"defaults" ou segredos não são aceitos (um token guardado publicaria por fora destas regras)')
    enviados, escrita = {}, {}
    for nome, job in wf['jobs'].items():
        if not isinstance(job, dict) or not isinstance(job.get('steps'), list) or not job['steps']:
            p.append(f'job {nome}: sem passos (workflow reutilizável ou formato não reconhecido)')
            continue
        perm = job.get('permissions')
        if perm is not None and not (isinstance(perm, dict) and set(perm.values()) <= {'read', 'write', 'none'}):
            p.append(f'job {nome}: permissões em formato não reconhecido')
        escrita[nome] = isinstance(perm, dict) and 'write' in perm.values()
        if {'defaults', 'continue-on-error'} & set(job) or STATUS.search(str(job.get('if', ''))):
            p.append(f'job {nome}: defaults, continue-on-error ou if com always()/failure() não são aceitos')
        enviados[nome], passos = set(), job['steps']
        for i, st in enumerate(passos):
            if not isinstance(st, dict) or ('uses' in st) == ('run' in st):
                p.append(f'job {nome}, passo {i + 1}: formato não reconhecido')
                continue
            if 'continue-on-error' in st or STATUS.search(str(st.get('if', ''))):
                p.append(f'job {nome}, passo {i + 1}: continue-on-error ou if com always()/failure() não são aceitos')
            if 'run' in st:
                continue
            acao, _, versao = str(st['uses']).partition('@')
            papel, com = ACOES.get(acao), st.get('with') or {}
            if not papel or not re.fullmatch(r'v\d+|[0-9a-f]{40}', versao) or not isinstance(com, dict):
                p.append(f'job {nome}: ação {acao} fora da lista conhecida (acrescente à lista só depois de revisar o que ela publica)')
                continue
            if papel == 'código' and (escrita[nome] or set(com) - {'fetch-depth', 'persist-credentials'}):
                p.append(f'job {nome}: checkout num job com permissão de escrita, ou de outra versão ou pasta')
            if papel == 'enviar':
                caminho, pages = com.get('path'), acao == 'actions/upload-pages-artifact'
                if not isinstance(caminho, str) or not re.fullmatch(r'[A-Za-z0-9_][A-Za-z0-9_./-]*', caminho) or '..' in caminho.split('/'):
                    p.append(f'job {nome}: envio sem um caminho simples em with.path')
                elif not any(c == caminho.rstrip('/') and (m == 'site' or not pages) for c, m in verificados(passos[i - 1] if i else None)):
                    p.append(f'job {nome}: envio de {caminho} sem a verificação desse caminho no passo imediatamente anterior')
                else:
                    enviados[nome].add(str(com.get('name') or ('github-pages' if pages else 'artifact')))
    for nome, job in wf['jobs'].items():
        if nome not in enviados:
            continue
        necessarios = job.get('needs') or []
        necessarios = [necessarios] if isinstance(necessarios, str) else necessarios
        verificado = set().union(*(enviados.get(x, set()) for x in necessarios if isinstance(x, str)))
        recebe = False
        for st in job['steps']:
            papel = ACOES.get(str(st.get('uses', '')).partition('@')[0]) if isinstance(st, dict) else None
            if papel in ('baixar', 'publicar'):
                recebe = True
                com = st.get('with') if isinstance(st.get('with'), dict) else {}
                art = com.get('name') if papel == 'baixar' else com.get('artifact_name') or 'github-pages'
                if not isinstance(art, str) or art not in verificado:
                    p.append(f'job {nome}: usa um artefato ({art}) que não vem verificado de um job em "needs"')
        if escrita[nome] and not recebe:
            p.append(f'job {nome}: tem permissão de escrita, mas não publica um artefato já verificado')
    return p


def nome_de(f):
    return f.id if isinstance(f, ast.Name) else f'{nome_de(f.value)}.{f.attr}' if isinstance(f, ast.Attribute) else '?'


DEPOIS_OK = {'print', 'sum', 'len', 'os.path.getsize', 'os.path.join'}


def conferir_build_py(caminho=BUILD):
    """O build.py tem de terminar conferindo a saída: no nível de cima do arquivo, um try que importa conferir_build e
    termina com r = conferir_build(OUT, ...); um except que deixa r diferente de 0; logo depois, "if r:" que apaga OUT
    e sai com r; e, depois disso, nada que escreva arquivos."""
    try:
        corpo = ast.parse(open(caminho, encoding='utf-8').read()).body
    except (OSError, SyntaxError, ValueError, UnicodeDecodeError) as e:
        return [f'não deu para ler o build.py ({type(e).__name__})']
    chamada = lambda x: (isinstance(x, ast.Assign) and len(x.targets) == 1 and isinstance(x.targets[0], ast.Name)
                         and isinstance(x.value, ast.Call) and nome_de(x.value.func) == 'conferir_build'
                         and x.value.args[:1] and nome_de(x.value.args[0]) == 'OUT')
    i = next((i for i, x in enumerate(corpo) if isinstance(x, ast.Try) and x.body and chamada(x.body[-1])), None)
    if i is None:
        return ['o build.py não termina com r = conferir_build(OUT, ...) num try no nível de cima do arquivo']
    tentativa, probs = corpo[i], []
    r = tentativa.body[-1].targets[0].id
    if not any(isinstance(x, ast.ImportFrom) and x.module == 'verificar_publicacao'
               and [(a.name, a.asname) for a in x.names] == [('conferir_build', None)] for x in tentativa.body):
        probs.append('o try do build.py não importa conferir_build de verificar_publicacao')
    zera = lambda h: not (h.type is None or nome_de(h.type) in ('Exception', 'BaseException')) or not (
        isinstance(h.body[-1], ast.Assign) and [nome_de(t) for t in h.body[-1].targets] == [r]
        and isinstance(h.body[-1].value, ast.Constant) and h.body[-1].value.value not in (0, False, None))
    if tentativa.orelse or tentativa.finalbody or not tentativa.handlers or any(map(zera, tentativa.handlers)):
        probs.append('o except do build.py tem de pegar qualquer erro e deixar o resultado diferente de 0')
    se = corpo[i + 1] if i + 1 < len(corpo) else None
    chama = lambda x, f, *args: (isinstance(x, ast.Expr) and isinstance(x.value, ast.Call) and nome_de(x.value.func) == f
                                 and [nome_de(a) for a in x.value.args] == list(args))
    if not (isinstance(se, ast.If) and nome_de(se.test) == r and not se.orelse and len(se.body) == 2
            and chama(se.body[0], 'shutil.rmtree', 'OUT') and chama(se.body[1], 'sys.exit', r)):
        probs.append('logo depois da conferência, o build.py tem de apagar OUT e sair quando o resultado não for 0')
    for x in corpo[i + 2:]:
        if any(isinstance(y, (ast.FunctionDef, ast.ClassDef, ast.Lambda, ast.Import, ast.ImportFrom, ast.With, ast.Delete))
               or isinstance(y, ast.Call) and nome_de(y.func) not in DEPOIS_OK for y in ast.walk(x)):
            probs.append(f'o build.py faz mais coisas depois da conferência (linha {x.lineno})')
            break
    for x in corpo[:i]:
        if any(isinstance(y, ast.Call) and nome_de(y.func) in ('sys.exit', 'os._exit', 'exit', 'quit') for y in ast.walk(x)):
            probs.append(f'o build.py pode sair antes da conferência (linha {x.lineno})')
            break
    for y in ast.walk(ast.Module(body=corpo, type_ignores=[])):
        if (isinstance(y, (ast.FunctionDef, ast.ClassDef)) and y.name == 'conferir_build'
                or isinstance(y, ast.Name) and y.id == 'conferir_build' and isinstance(y.ctx, ast.Store)):
            probs.append('o build.py define outra conferir_build')
            break
    return probs


def conferir_workflows(pasta=WORKFLOWS, build_py=BUILD):
    """Camadas 1 e 2: o build.py confere a saída e os workflows verificam o que enviam (veja o começo do arquivo)."""
    probs = [f'web/build.py: {x}' for x in conferir_build_py(build_py)]
    for f in sorted(os.listdir(pasta)) if os.path.isdir(pasta) else []:
        if not f.endswith(('.yml', '.yaml')):
            continue
        try:
            wf = Yaml(open(os.path.join(pasta, f), encoding='utf-8').read()).raiz
        except (OSError, ValueError, UnicodeDecodeError) as e:
            probs.append(f'{f}: não deu para ler o workflow ({e})')
            continue
        try:
            probs += [f'{f}: {x}' for x in regras(wf)]
        except Exception as e:
            probs.append(f'{f}: workflow em formato não reconhecido ({type(e).__name__})')
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
        print(buf.getvalue().splitlines()[-1])
        if validar():
            return 2
        probs = conferir_workflows()
        for p in probs:
            print(f'ERRO: {p}')
        if probs:
            print('ERRO: o build e os workflows precisam conferir o conteúdo antes de enviar; nada pode ser publicado')
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
WF_SITE = '''name: Site
on:
  push:
    branches: [main, 'claude/**']
permissions:
  contents: read
jobs:
  montar:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Montar
        run: python3 web/build.py _site
      # o passo seguinte confere o que vai ser enviado
      - name: Conferir
        run: |
          python3 -I web/verificar_publicacao.py autoteste
          python3 -I web/verificar_publicacao.py verificar _site --site
      - uses: actions/upload-pages-artifact@v3
        with:
          path: _site
  publicar:
    if: github.ref == 'refs/heads/main'
    needs: montar
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deploy.outputs.page_url }}
    steps:
      - id: deploy
        uses: actions/deploy-pages@v4  # publica o pacote já verificado
'''
WF_APK = '''name: App
on:
  workflow_dispatch:
    inputs:
      publicar:
        type: boolean
        default: false
permissions:
  contents: read
jobs:
  apk:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Separar
        run: cp app.apk missao-eear.apk
      - name: Conferir o APK
        run: python3 -I web/verificar_publicacao.py verificar missao-eear.apk --apk
      - uses: actions/upload-artifact@v4
        if: github.event_name == 'workflow_dispatch' && inputs.publicar
        with:
          name: missao-eear-apk
          path: missao-eear.apk
  publicar:
    needs: apk
    runs-on: ubuntu-latest
    permissions:
      contents: write  # só este job escreve
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: missao-eear-apk
      - name: Publicar
        env:
          GH_TOKEN: ${{ github.token }}
        run: |
          # cria a Release com o APK que o job apk verificou
          gh release create "v1" missao-eear.apk --notes "App: abra no celular."
'''
WF_LEITURA = '''on:
  push:
    paths: ['curso/dados/videoaulas.js', 'web/conferir_videos.py']
  schedule:
    - cron: '17 9 * * 1'
permissions:
  contents: read
jobs:
  conferir:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: python3 web/conferir_videos.py
'''
BUILD_OK = '''import os, shutil, sys
OUT = os.path.abspath('saida')
open(os.path.join(OUT, 'index.html'), 'w').write('x')
try:
    sys.path.insert(0, 'web')
    from verificar_publicacao import conferir_build
    r = conferir_build(OUT, 'site')
except Exception as e:
    print('erro', e)
    r = 2
if r:
    shutil.rmtree(OUT, ignore_errors=True)
    sys.exit(r)
print('pronto', len(OUT))
'''


def frases(semente, n):
    r = random.Random(semente)
    return [' '.join(r.choice(PALAVRAS) for _ in range(r.randint(10, 16))).capitalize() + '.' for _ in range(n)]


def autoteste(verboso=False):
    r, outro = random.Random(7), random.Random(3)
    sigilo, livre = frases(1, 200) + [OFICIAL], frases(2, 40)
    restrito = 'window.X = ' + json.dumps({'itens': [{'id': i, 'texto': t} for i, t in enumerate(sigilo)]}, ensure_ascii=False) + ';'
    trecho = ' '.join(sigilo[3:6])
    falhas, linhas, pulados = [], [], 0
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

        def criar(f):
            # links simbólicos e FIFOs não existem em todo sistema (no Windows, só com permissão especial)
            try:
                f()
                return True
            except (OSError, NotImplementedError, AttributeError):
                return False

        def trocar(texto, velho, novo):
            if velho not in texto:
                raise ValueError(f'caso mal montado: {velho[:30]!r}')
            return texto.replace(velho, novo, 1)

        base_apk = [('AndroidManifest.xml', b'\x03\x00\x08\x00' + bytes(range(256))),
                    ('classes.dex', b'dex\n035\x00' + bytes(r.getrandbits(8) for _ in range(2000))),
                    ('assets/public/index.html', '<p>Curso</p>')]
        apk = lambda nome, entradas, comprimir=zipfile.ZIP_DEFLATED: escrever(cam(nome), zipar(base_apk + entradas, comprimir))
        ruido = lambda n: bytes(r.getrandbits(8) for _ in range(n))
        webp = lambda: b'RIFF' + (3008).to_bytes(4, 'little') + b'WEBPVP8 ' + ruido(3000)
        png, jpg = (lambda: b'\x89PNG\r\n\x1a\n' + ruido(3000)), (lambda: b'\xff\xd8\xff\xe0' + ruido(3000))
        js = lambda x: 'window.Y = ' + json.dumps(x, ensure_ascii=False) + ';'

        # repositório de mentira: o material, uma prova oficial pública (que cita uma questão do material) e uma aula
        repo = cam('repo')
        fonte = escrever(os.path.join(repo, 'curso', 'dados', 'apostila.js'), restrito)
        prova = escrever(os.path.join(repo, 'curso', 'dados', 'prova.js'), js([OFICIAL]))
        aula = escrever(os.path.join(repo, 'curso', 'dados', 'aula.js'), js(livre))
        sem_material = [cam('repo', 'nao-existe.js')]
        imp, imp2 = cam('imp.json'), cam('imp-oficial.json')
        with contextlib.redirect_stdout(io.StringIO()):
            if gerar([fonte], [aula], imp, repo) or gerar([fonte], [prova, aula], imp2, repo):
                print('FALHOU: o autoteste não conseguiu gerar as impressões de mentira')
                return 1
            g_pasta = gerar([fonte], [os.path.join(repo, 'curso')], cam('x1.json'), repo)
            g_material = gerar([fonte], [fonte], cam('x2.json'), repo)
            g_fora = gerar([fonte], [escrever(cam('outro', 'b.js'), js([OFICIAL]))], cam('x3.json'), repo)
            g_muito = gerar([fonte], [escrever(os.path.join(repo, 'curso', 'dados', 'muito.js'), js(sigilo[:30]))], cam('x4.json'), repo)
        fix, fix2 = carregar(imp)['sha'], carregar(imp2)['sha']
        bom, bom2 = json.load(open(imp, encoding='utf-8')), json.load(open(imp2, encoding='utf-8'))
        binario = webp()

        def com_mudanca(nome, mudar, origem=bom):
            d = json.loads(json.dumps(origem))
            mudar(d)
            return escrever(cam(nome), json.dumps(d))

        def depois_de_mudar(arq, novo, f):
            # muda um arquivo do repositório de mentira só durante f()
            antigo = open(arq, 'rb').read()
            if novo is None:
                os.remove(arq)
            else:
                escrever(arq, novo)
            try:
                return f()
            finally:
                escrever(arq, antigo)

        ext = cam('fora')
        escrever(os.path.join(ext, 'dados.js'), restrito)
        link_pasta, link_arq, link_interno, fifo = site('link-pasta'), site('link-arquivo'), site('link-interno'), site('fifo')
        tem_link_pasta = criar(lambda: os.symlink(ext, os.path.join(link_pasta, 'dados', 'extra')))
        tem_link_arq = criar(lambda: os.symlink(os.path.join(ext, 'dados.js'), os.path.join(link_arq, 'dados', 'b.js')))
        tem_link_interno = criar(lambda: os.symlink('aulas.js', os.path.join(link_interno, 'dados', 'copia.js')))
        tem_fifo = criar(lambda: os.mkfifo(os.path.join(fifo, 'dados', 'c.js')))
        palavras = trecho.split()
        curta = ''
        for p in sigilo[10].split():
            if len(re.sub(r'[^a-z]', '', normalizar(curta + p))) >= K - 1:
                break
            curta += p + ' '
        letras = re.sub(r'[^a-z0-9]', '', normalizar(trecho))
        pedacos = [letras[i:i + 20] for i in range(0, len(letras), 20)]     # cada um curto demais sozinho
        com_tags = '<p>' + ' '.join(f'<b>{p}</b>' if i % 3 == 0 else (f'{p}<br>' if i % 5 == 0 else p) for i, p in enumerate(palavras)) + '</p>'
        misto = ''.join(f'\\x{ord(c):02x}' if ord(c) < 128 and i % 2 else (f'\\u{ord(c):04x}' if ord(c) > 127 else c) for i, c in enumerate(trecho))
        so_u = ''.join(f'\\u{ord(c):04x}' for c in trecho)
        so_chaves = ''.join(f'\\u{{{ord(c):x}}}' for c in trecho)
        so_x = ''.join(f'\\x{ord(c):02x}' if ord(c) < 256 else c for c in trecho)
        octal = ''.join(f'\\{ord(c):o}' if ord(c) < 128 else c for c in trecho)
        emendado = ' + '.join(json.dumps(' '.join(palavras[i:i + 4]), ensure_ascii=False) for i in range(0, len(palavras), 4))
        picado = json.dumps([trecho[i:i + 7] for i in range(0, len(trecho), 7)], ensure_ascii=False)
        sem_acento = ''.join(c for c in unicodedata.normalize('NFD', trecho) if not unicodedata.combining(c)).upper().replace(' ', '   ')
        b64 = base64.b64encode(trecho.encode()).decode()
        url = base64.urlsafe_b64encode(('~~~???' + trecho).encode()).decode()     # "~~~" vira "-" e "???" vira "_"
        mime = '\n'.join(b64[i:i + 76] for i in range(0, len(b64), 76))
        curtas = '\n'.join(b64[i:i + 36] for i in range(0, len(b64), 36))
        hexa = trecho.encode().hex()
        gz2 = gzip.compress(' '.join(livre[:3]).encode()) + gzip.compress(trecho.encode())
        gz_pedacos = b''.join(gzip.compress(p.encode()) for p in pedacos)
        zl2 = zlib.compress(' '.join(livre[:3]).encode()) + zlib.compress(trecho.encode())
        zl_resto = zlib.compress(' '.join(livre[:3]).encode()) + b'\x00\x01' + trecho.encode()
        zip_em_zip = lambda n: zipar([('a.zip', zipar([('b.txt', trecho)]))]) if n == 1 else zipar([('c.zip', zip_em_zip(n - 1))])
        bomba_gz = gzip.compress(b'\x00' * 20_000_000)
        bin_utf16 = lambda cod: ruido(500) + trecho.encode(cod) + ruido(500)
        oficial_novo = site('oficial-novo', {'dados/prova.js': js([OFICIAL])})
        oficial_outro = site('oficial-outro', {'dados/outro.js': js([OFICIAL])})
        oficial_mais = site('oficial-mais', {'dados/prova.js': js([OFICIAL, ' '.join(sigilo[20:23])])})
        forjado = lambda d: d.update(impressoes=sorted({'%016x' % outro.getrandbits(64) for _ in d['impressoes']}))
        menos_um = com_mudanca('menos-um.json', lambda d: d['impressoes'].pop())
        cortado = json.load(open(menos_um, encoding='utf-8'))

        def limite_total():
            try:
                contar({'bytes': MAX_BYTES}, 1, 1)
            except NaoVerificavel:
                return 2
            return 0

        def wf(nome, arqs, build=BUILD_OK):
            # 2 se a conferência dos workflows e do build.py acusar algum problema, 0 se não
            d = cam(nome, 'wf')
            for f, c in arqs.items():
                escrever(os.path.join(d, f), c)
            return 2 if conferir_workflows(d, escrever(cam(nome, 'build.py'), build)) else 0
        ok = {'site.yml': WF_SITE, 'android.yml': WF_APK, 'videos.yml': WF_LEITURA}
        site_com = lambda velho, novo: dict(ok, **{'site.yml': trocar(WF_SITE, velho, novo)})
        apk_com = lambda velho, novo: dict(ok, **{'android.yml': trocar(WF_APK, velho, novo)})
        conferir = '      - name: Conferir\n        run: |\n          python3 -I web/verificar_publicacao.py autoteste\n          python3 -I web/verificar_publicacao.py verificar _site --site\n'
        enviar = '      - uses: actions/upload-pages-artifact@v3\n'
        so_verificar = 'run: python3 -I web/verificar_publicacao.py verificar missao-eear.apk --apk\n'
        nuvem = '  publicar:\n    if: github'
        cabeca, jobs = WF_SITE.split('jobs:\n')
        jobs_invertidos = cabeca + 'jobs:\n  publicar:\n' + jobs.split('  publicar:\n')[1] + jobs.split('  publicar:\n')[0]
        bp = lambda velho, novo: trocar(BUILD_OK, velho, novo)
        casos = [
            # (grupo, nome, função que devolve o resultado (None: não dá para testar neste sistema), esperado)
            ('legítimo', 'site limpo, sem correspondência', lambda: verificar(site('limpo'), 'site', imp), 0),
            ('legítimo', 'UTF-8 válido com acentos', lambda: verificar(site('utf8', {'dados/b.js': 'x="ação, função, área"'}), 'site', imp), 0),
            ('legítimo', 'UTF-8 com BOM', lambda: verificar(site('bom-ok', {'dados/b.js': '\ufeffx="ação"'}), 'site', imp), 0),
            ('legítimo', 'imagens novas (webp, png, jpg) em provas/ e imagens/', lambda: verificar(site('imagens', {
                'provas/p1/q01.webp': webp(), 'provas/p1/q02.png': png(), 'imagens/aula1/fig.jpg': jpg()}), 'site', imp), 0),
            ('legítimo', 'frase curta coincidente (menos de 30 letras do material)', lambda: verificar(site('curta', {
                'dados/b.js': json.dumps(curta, ensure_ascii=False)}), 'site', imp), 0),
            ('legítimo', 'base64 legítimo (imagem em data URI)', lambda: verificar(site('b64-ok', {
                'fontes/x.css': 'a{background:url(data:image/png;base64,' + base64.b64encode(png()).decode() + ')}'}), 'site', imp), 0),
            ('legítimo', 'gzip legítimo dentro do APK', lambda: verificar(apk('gz-ok.apk', [('res/raw/a.gz', gzip.compress(' '.join(livre).encode()))]), 'apk', imp), 0),
            ('legítimo', 'ZIP interno legítimo no APK (fora de assets/public)', lambda: verificar(apk('zip-ok.apk', [
                ('res/raw/dados.zip', zipar([('a.txt', ' '.join(livre[:5]))]))]), 'apk', imp), 0),
            ('legítimo', 'APK limpo com XML binário do Android', lambda: verificar(apk('limpo.apk', []), 'apk', imp), 0),
            ('legítimo', 'APK limpo, entradas sem compressão', lambda: verificar(apk('limpo-st.apk', [], zipfile.ZIP_STORED), 'apk', imp), 0),
            ('aprovação', 'questão oficial também presente no material, sem aprovação', lambda: verificar(oficial_novo, 'site', imp), 1),
            ('aprovação', 'a mesma questão, aprovada a partir de curso/dados/prova.js, em dados/prova.js', lambda: verificar(oficial_novo, 'site', imp2), 0),
            ('aprovação', 'a questão aprovada, mas em outro arquivo publicado', lambda: verificar(oficial_outro, 'site', imp2), 1),
            ('aprovação', 'a aprovação não libera o resto do material, nem no mesmo arquivo', lambda: verificar(oficial_mais, 'site', imp2), 1),
            ('aprovação', 'APK com a questão aprovada no arquivo dela, sem compressão', lambda: verificar(apk('ap-st.apk', [
                ('assets/public/dados/prova.js', js([OFICIAL]))], zipfile.ZIP_STORED), 'apk', imp2), 0),
            ('aprovação', 'APK com a questão aprovada fora do arquivo dela', lambda: verificar(apk('ap-fora.apk', [
                ('assets/public/dados/outro.js', js([OFICIAL]))]), 'apk', imp2), 1),
            ('aprovação', 'gerar recusa uma pasta como origem', lambda: g_pasta, 2),
            ('aprovação', 'gerar recusa o próprio material como origem', lambda: g_material, 2),
            ('aprovação', 'gerar recusa origem fora do curso', lambda: g_fora, 2),
            ('aprovação', 'gerar recusa aprovar mais de 1% do material', lambda: g_muito, 2),
            ('aprovação', 'origem conferida e correta (validar)', lambda: validar(imp2, [fonte], fix2, repo), 0),
            ('aprovação', 'validar recusa aprovação cujo texto saiu do arquivo de origem', lambda: depois_de_mudar(
                prova, js(['outra questão']), lambda: validar(imp2, [fonte], fix2, repo)), 2),
            ('aprovação', 'validar recusa aprovação de arquivo que não existe mais', lambda: depois_de_mudar(
                prova, None, lambda: validar(imp2, [fonte], fix2, repo)), 2),
            ('aprovação', 'aprovação com origem de pasta ou de fora do curso', lambda: verificar(site('ap-pasta'), 'site', com_mudanca(
                'ap-pasta.json', lambda d: d.update(aprovadas={'curso/dados': d['aprovadas']['curso/dados/prova.js']}), bom2)), 2),
            ('aprovação', 'aprovação vinda do próprio material', lambda: verificar(site('ap-mat'), 'site', com_mudanca(
                'ap-mat.json', lambda d: d.update(aprovadas={'curso/dados/apostila.js': d['aprovadas']['curso/dados/prova.js']}), bom2)), 2),
            ('aprovação', 'impressão aprovada que também está na lista de impressões', lambda: verificar(site('ap-sobre'), 'site', com_mudanca(
                'ap-sobre.json', lambda d: d['impressoes'].__setitem__(slice(None), sorted(set(d['impressoes']) | set(d['aprovadas']['curso/dados/prova.js']))), bom2)), 2),
            ('aprovação', 'aprovação acima do limite no arquivo', lambda: verificar(site('f7'), 'site', com_mudanca('a.json', lambda d: d.update(
                aprovadas={'curso/dados/prova.js': d['impressoes'][:100]}, impressoes=d['impressoes'][100:]))), 2),
            ('hash fixado', 'arquivo de impressões diferente do fixado, com forma válida', lambda: validar(
                com_mudanca('t.json', forjado), [fonte], fix, repo), 2),
            ('hash fixado', 'o mesmo arquivo só com espaços e quebras de linha diferentes (Windows)', lambda: validar(
                escrever(cam('crlf.json'), json.dumps(bom, indent=2).replace('\n', '\r\n')), [fonte], fix, repo), 0),
            ('material ausente', 'sem o material, impressões forjadas com forma válida são recusadas', lambda: validar(
                com_mudanca('t2.json', forjado), sem_material, fix, repo), 2),
            ('material ausente', 'sem o material, impressões cortadas são recusadas', lambda: validar(menos_um, sem_material, fix, repo), 2),
            ('material ausente', 'sem o material, as impressões fixadas passam', lambda: validar(imp2, sem_material, fix2, repo), 0),
            ('material ausente', 'só parte do material presente', lambda: validar(imp, [fonte] + sem_material, fix, repo), 2),
            ('material presente', 'impressões que não correspondem ao material, mesmo com o hash fixado delas', lambda: validar(
                menos_um, [fonte], canonico(cortado), repo), 2),
            ('material presente', 'impressões corretas', lambda: validar(imp, [fonte], fix, repo), 0),
            ('caminhos', 'link simbólico para pasta externa', (lambda: verificar(link_pasta, 'site', imp)) if tem_link_pasta else None, 1),
            ('caminhos', 'link simbólico para arquivo externo', (lambda: verificar(link_arq, 'site', imp)) if tem_link_arq else None, 1),
            ('caminhos', 'link simbólico para arquivo de dentro do build', (lambda: verificar(link_interno, 'site', imp)) if tem_link_interno else None, 1),
            ('caminhos', 'arquivo especial (FIFO)', (lambda: verificar(fifo, 'site', imp)) if tem_fifo else None, 1),
            ('caminhos', 'pasta que não dá para ler (o alvo não é uma pasta)', lambda: verificar(escrever(cam('nao-e-pasta'), 'x'), 'site', imp), 2),
            ('caminhos', 'APK: caminho com ../ em assets/public', lambda: verificar(apk('fora.apk', [('assets/public/../../x.js', 'x=1')]), 'apk', imp), 1),
            ('caminhos', 'APK: caminho com ../ fora de assets/public, conteúdo legítimo', lambda: verificar(apk('fora-ok.apk', [('res/../../x.txt', 'x=1')]), 'apk', imp), 1),
            ('caminhos', 'APK: caminho absoluto', lambda: verificar(apk('abs.apk', [('/etc/x.txt', 'x=1')]), 'apk', imp), 1),
            ('caminhos', 'APK: caminho com barra invertida', lambda: verificar(apk('barra.apk', [('res\\..\\x.txt', 'x=1')]), 'apk', imp), 1),
            ('caminhos', 'APK: caminho com letra de unidade', lambda: verificar(apk('unidade.apk', [('C:/x.txt', 'x=1')]), 'apk', imp), 1),
            ('zip', 'entradas repetidas no APK', lambda: verificar(apk('dup.apk', [('assets/public/dados/d.js', restrito), ('assets/public/dados/d.js', 'x=1')]), 'apk', imp), 1),
            ('zip', 'entradas repetidas no APK, mesmo com conteúdo legítimo', lambda: verificar(apk('dup-ok.apk', [('res/raw/a.txt', 'x=1'), ('res/raw/a.txt', 'x=2')]), 'apk', imp), 1),
            ('zip', 'entradas repetidas num zip dentro do APK', lambda: verificar(apk('dup-int.apk', [('res/raw/z.zip', zipar([('a.txt', 'x=1'), ('a.txt', 'x=2')]))]), 'apk', imp), 1),
            ('zip', 'entrada criptografada', lambda: verificar(escrever(cam('cripto.apk'), cifrar(zipar(base_apk + [('res/raw/a.bin', b'x')]), 'res/raw/a.bin')), 'apk', imp), 2),
            ('zip', 'texto escondido no comentário de um zip dentro do APK', lambda: verificar(apk('coment-int.apk', [('res/raw/a.zip', zipar([('a.txt', 'x')])[:-2] + len(trecho.encode()).to_bytes(2, 'little') + trecho.encode())]), 'apk', imp), 1),
            ('zip', 'texto escondido no comentário do APK, fora das entradas', lambda: verificar(escrever(cam('coment.apk'), zipar(base_apk)[:-2] + len(trecho.encode()).to_bytes(2, 'little') + trecho.encode()), 'apk', imp), 1),
            ('aninhado', 'zip dentro de zip dentro do APK', lambda: verificar(apk('zz.apk', [('res/raw/a.zip', zipar([('b.zip', zipar([('c.txt', trecho)]))]))]), 'apk', imp), 1),
            ('aninhado', 'gzip dentro de zip dentro do APK', lambda: verificar(apk('gzz.apk', [('res/raw/a.zip', zipar([('b.gz', gzip.compress(trecho.encode()))]))]), 'apk', imp), 1),
            ('aninhado', 'zip em base64 num arquivo publicado', lambda: verificar(site('b64zip', {'dados/b.js': js(base64.b64encode(zipar([('a.txt', trecho)])).decode())}), 'site', imp), 1),
            ('aninhado', 'aninhamento além do limite', lambda: verificar(apk('fundo.apk', [('res/raw/a.zip', zip_em_zip(5))]), 'apk', imp), 2),
            ('bomba', 'bomba de zip no APK', lambda: verificar(apk('bomba.apk', [('res/raw/z.bin', b'\x00' * 10_000_000)]), 'apk', imp), 2),
            ('bomba', 'bomba de gzip em base64 num arquivo publicado', lambda: verificar(site('bomba-gz', {'dados/b.js': js(base64.b64encode(bomba_gz).decode())}), 'site', imp), 2),
            ('bomba', 'bomba de zlib numa entrada sem compressão do APK', lambda: verificar(apk('bomba-zl.apk', [('res/raw/z.bin', zlib.compress(b'\x00' * 20_000_000))], zipfile.ZIP_STORED), 'apk', imp), 2),
            ('bomba', 'limite do total descompactado', lambda: limite_total(), 2),
            ('gzip', 'gzip com dois membros, o material no segundo', lambda: verificar(apk('gz2.apk', [('res/raw/a.gz', gz2)]), 'apk', imp), 1),
            ('gzip', 'gzip com vários membros, cada pedaço curto demais sozinho', lambda: verificar(apk('gzp.apk', [('res/raw/a.gz', gz_pedacos)]), 'apk', imp), 1),
            ('gzip', 'base64 de gzip do material', lambda: verificar(site('b64gz', {'dados/b.js': js(base64.b64encode(gzip.compress(trecho.encode())).decode())}), 'site', imp), 1),
            ('zlib', 'zlib sozinho', lambda: verificar(apk('zl.apk', [('res/raw/a.bin', zlib.compress(trecho.encode()))]), 'apk', imp), 1),
            ('zlib', 'zlib seguido de outro zlib com o material', lambda: verificar(apk('zl2.apk', [('res/raw/a.bin', zl2)]), 'apk', imp), 1),
            ('zlib', 'zlib seguido do material sem compressão', lambda: verificar(apk('zlr.apk', [('res/raw/a.bin', zl_resto)]), 'apk', imp), 1),
            ('base64', 'base64 padrão', lambda: verificar(site('b64', {'dados/b.js': js(b64)}), 'site', imp), 1),
            ('base64', 'base64 url-safe (com - e _)', lambda: verificar(site('b64url', {'dados/b.js': js(url)}), 'site', imp), 1 if re.search('[-_]', url) else 'caso mal montado'),
            ('base64', 'base64 com letras coladas antes (fora de alinhamento)', lambda: verificar(site('b64al', {'dados/b.js': js('Ab' + b64)}), 'site', imp), 1),
            ('base64', 'base64 quebrado em linhas de 76', lambda: verificar(site('b64mime', {'fontes/x.txt': mime}), 'site', imp), 1),
            ('base64', 'base64 quebrado em linhas curtas (nenhuma basta sozinha)', lambda: verificar(site('b64curto', {'fontes/x.txt': curtas}), 'site', imp), 1),
            ('base64', 'base64 quebrado em linhas com \\n dentro de uma string', lambda: verificar(site('b64n', {'dados/b.js': 'x="' + curtas.replace('\n', '\\n') + '"'}), 'site', imp), 1),
            ('hexadecimal', 'hexadecimal', lambda: verificar(site('hex', {'dados/b.js': js(hexa)}), 'site', imp), 1),
            ('hexadecimal', 'hexadecimal fora de alinhamento', lambda: verificar(site('hexal', {'dados/b.js': js('f' + hexa)}), 'site', imp), 1),
            ('hexadecimal', 'hexadecimal separado por espaços', lambda: verificar(site('hexesp', {'dados/b.js': js(' '.join(hexa[i:i + 2] for i in range(0, len(hexa), 2)))}), 'site', imp), 1),
            ('escapes', 'só \\uXXXX', lambda: verificar(site('esc-u', {'dados/b.js': 'x="' + so_u + '"'}), 'site', imp), 1),
            ('escapes', 'só \\u{...}', lambda: verificar(site('esc-chaves', {'dados/b.js': 'x="' + so_chaves + '"'}), 'site', imp), 1),
            ('escapes', 'só \\xNN', lambda: verificar(site('esc-x', {'dados/b.js': 'x="' + so_x + '"'}), 'site', imp), 1),
            ('escapes', 'octal', lambda: verificar(site('esc-oct', {'dados/b.js': 'x="' + octal + '"'}), 'site', imp), 1),
            ('escapes', 'misturados (\\x e \\u)', lambda: verificar(site('escape', {'dados/b.js': 'x="' + misto + '"'}), 'site', imp), 1),
            ('escapes', '%XX (URL)', lambda: verificar(site('url', {'dados/b.js': js(urllib.parse.quote(trecho))}), 'site', imp), 1),
            ('codificação', 'UTF-16 LE sem marca', lambda: verificar(site('utf16le', {'dados/b.js': ('x="' + trecho + '"').encode('utf-16-le')}), 'site', imp), 1),
            ('codificação', 'UTF-16 BE sem marca', lambda: verificar(site('utf16be', {'dados/b.js': ('x="' + trecho + '"').encode('utf-16-be')}), 'site', imp), 1),
            ('codificação', 'UTF-16 com BOM', lambda: verificar(site('utf16', {'dados/b.js': ('x="' + trecho + '"').encode('utf-16')}), 'site', imp), 1),
            ('codificação', 'UTF-32 com BOM', lambda: verificar(site('utf32', {'dados/b.js': ('x="' + trecho + '"').encode('utf-32')}), 'site', imp), 1),
            ('codificação', 'UTF-8 com BOM e o material', lambda: verificar(site('bom', {'dados/b.js': '\ufeffx="' + trecho + '"'}), 'site', imp), 1),
            ('codificação', 'UTF-16 sem marca, mesmo com conteúdo legítimo', lambda: verificar(site('utf16-ok', {'dados/b.js': 'x="aula de hoje"'.encode('utf-16-le')}), 'site', imp), 1),
            ('codificação', 'Windows-1252, mesmo com conteúdo legítimo', lambda: verificar(site('cp-ok', {'dados/b.js': 'x="ação"'.encode('cp1252')}), 'site', imp), 1),
            ('codificação', 'Windows-1252', lambda: verificar(site('cp1252', {'dados/b.js': ('x="' + trecho + '"').encode('cp1252')}), 'site', imp), 1),
            ('codificação', 'UTF-8 inválido', lambda: verificar(site('utf8-ruim', {'dados/b.js': b'x="\xff\xfe\xc3("'}), 'site', imp), 1),
            ('binário', 'texto UTF-8 nos bytes de uma imagem', lambda: verificar(site('img-texto', {'provas/p1/q01.webp': webp() + trecho.encode()}), 'site', imp), 1),
            ('binário', 'texto UTF-16 LE num binário do APK', lambda: verificar(apk('b16le.apk', [('res/raw/a.bin', bin_utf16('utf-16-le'))]), 'apk', imp), 1),
            ('binário', 'texto UTF-16 BE num binário do APK', lambda: verificar(apk('b16be.apk', [('res/raw/a.bin', bin_utf16('utf-16-be'))]), 'apk', imp), 1),
            ('binário', 'ZIP escondido dentro de uma imagem', lambda: verificar(site('img-zip', {'provas/p1/q01.webp': webp() + zipar([('a.txt', 'x')])}), 'site', imp), 1),
            ('binário', 'texto legítimo com extensão de imagem', lambda: verificar(site('img-falsa-ok', {'provas/p1/q01.webp': 'texto qualquer'}), 'site', imp), 1),
            ('binário', 'cópia exata de um arquivo restrito binário (só o hash a reconhece)', lambda: verificar(site('binario', {
                'provas/p1/q09.webp': binario}), 'site', com_mudanca('bin.json', lambda d: d.update(inteiros=sorted(d['inteiros'] + [sha256(binario)])))), 1),
            ('texto', 'trechos separados e emendados com +', lambda: verificar(site('emendado', {'dados/b.js': 'x = ' + emendado + ';'}), 'site', imp), 1),
            ('texto', 'template literal (crase) numa linha com código', lambda: verificar(site('crase', {'dados/b.js': 'const x = `' + trecho + '`, y = 1;'}), 'site', imp), 1),
            ('texto', 'HTML com formatação no meio do texto', lambda: verificar(site('html', {'termos.html': com_tags}), 'site', imp), 1),
            ('texto', 'comentário HTML', lambda: verificar(site('coment', {'termos.html': '<!-- ' + trecho + ' --><p>ok</p>'}), 'site', imp), 1),
            ('texto', 'entidades HTML (&#227; e &#xe3; em todas as letras)', lambda: verificar(site('ent', {'termos.html': '<p>' + ''.join(f'&#{ord(c)};' if k % 2 else f'&#x{ord(c):x};' for k, c in enumerate(trecho)) + '</p>'}), 'site', imp), 1),
            ('texto', 'atributo HTML', lambda: verificar(site('atrib', {'termos.html': '<span title="' + html.escape(trecho) + '">x</span>'}), 'site', imp), 1),
            ('texto', 'texto picado em pedaços de 7 caracteres', lambda: verificar(site('picado', {'dados/b.js': 'x=' + picado}), 'site', imp), 1),
            ('texto', 'acentos e cedilha viram a letra simples (Ação Aérea = acao aerea)', lambda: 0 if fluxos('Ação Aérea, ÇÃO; ü') == fluxos('acao aerea cao u') else 1, 0),
            ('texto', 'sem acentos, em maiúsculas, espaços trocados', lambda: verificar(site('acento', {'dados/b.js': js(sem_acento)}), 'site', imp), 1),
            ('texto', 'caracteres invisíveis entre as letras', lambda: verificar(site('invis', {'dados/b.js': js('\u200b'.join(trecho))}), 'site', imp), 1),
            ('outros', 'cópia exata com outro nome', lambda: verificar(site('copia', {'dados/material.js': restrito}), 'site', imp), 1),
            ('outros', 'marca do código das apostilas', lambda: verificar(site('marca', {'dados/b.js': 'EEAR.apostila = {}'}), 'site', imp), 1),
            ('outros', 'arquivo fora da lista (material.pdf)', lambda: verificar(site('pdf', {'material.pdf': 'x'}), 'site', imp), 1),
            ('outros', 'saída vazia (sem index.html)', lambda: verificar(os.makedirs(cam('vazio')) or cam('vazio'), 'site', imp), 1),
            ('outros', 'nome com "apostila", mesmo com conteúdo legítimo', lambda: verificar(site('nome', {'dados/apostila-propria.js': 'x=1'}), 'site', imp), 1),
            ('falha segura', 'impressões ausentes', lambda: verificar(site('f1'), 'site', cam('nao-existe.json')), 2),
            ('falha segura', 'impressões que não são JSON', lambda: verificar(site('f2'), 'site', escrever(cam('ruim.json'), '{"versao": 3,')), 2),
            ('falha segura', 'impressões de outra versão', lambda: verificar(site('f3'), 'site', com_mudanca('v.json', lambda d: d.update(versao=2))), 2),
            ('falha segura', 'impressões com valor que não é hash', lambda: verificar(site('f4'), 'site', com_mudanca('h.json', lambda d: d['impressoes'].__setitem__(0, d['impressoes'][0][:15]))), 2),
            ('falha segura', 'impressões fora de ordem', lambda: verificar(site('f5'), 'site', com_mudanca('o.json', lambda d: d['impressoes'].reverse())), 2),
            ('falha segura', 'impressões cortadas (poucas)', lambda: verificar(site('f6'), 'site', com_mudanca('p.json', lambda d: d.update(impressoes=d['impressoes'][:10]))), 2),
            ('falha segura', 'aprovações sem origem (lista solta, como na versão 2)', lambda: verificar(site('f8'), 'site', com_mudanca('l.json', lambda d: d.update(aprovadas=[]))), 2),
            ('falha segura', 'alvo inexistente', lambda: verificar(cam('nada'), 'site', imp), 2),
            ('workflows', 'workflows e build.py corretos', lambda: wf('w-ok', ok), 0),
            ('workflows', 'jobs em outra ordem', lambda: wf('w-ordem', dict(ok, **{'site.yml': jobs_invertidos})), 0),
            ('workflows', 'arquivos com quebra de linha do Windows', lambda: wf('w-crlf', {f: t.replace('\n', '\r\n') for f, t in ok.items()}), 0),
            ('workflows', 'verificação só num comentário', lambda: wf('w1', site_com(conferir, '      # - name: Conferir\n      #   run: python3 -I web/verificar_publicacao.py verificar _site --site\n')), 2),
            ('workflows', 'ação de publicação fora da lista (peaceiris/actions-gh-pages)', lambda: wf('w2', site_com(enviar, '      - uses: peaceiris/actions-gh-pages@v4\n        with:\n          publish_dir: _site\n' + enviar)), 2),
            ('workflows', 'git push num job com permissão de escrita', lambda: wf('w3', site_com(nuvem, '  gh-pages:\n    runs-on: ubuntu-latest\n    permissions:\n      contents: write\n    steps:\n      - uses: actions/checkout@v4\n      - run: git push origin HEAD:gh-pages\n' + nuvem)), 2),
            ('workflows', 'envio de um arquivo sem ".apk" no nome e sem verificação', lambda: wf('w4', apk_com('path: missao-eear.apk', 'path: saida/app.zip')), 2),
            ('workflows', 'ação de Release fora da lista (ncipollo/release-action)', lambda: wf('w5', apk_com('      - name: Publicar\n', '      - uses: ncipollo/release-action@v1\n      - name: Publicar\n')), 2),
            ('workflows', 'verificação de outra pasta', lambda: wf('w6', site_com('verificar _site --site', 'verificar app/www --app')), 2),
            ('workflows', 'build.py com conferir_build( só num comentário', lambda: wf('w7', ok, bp("    r = conferir_build(OUT, 'site')", "    # r = conferir_build(OUT, 'site')\n    r = 0")), 2),
            ('workflows', 'passo de verificação com if: false', lambda: wf('w8', site_com('      - name: Conferir\n', '      - name: Conferir\n        if: false\n')), 2),
            ('workflows', 'verificação com "|| true"', lambda: wf('w9', site_com('verificar _site --site\n', 'verificar _site --site || true\n')), 2),
            ('workflows', 'verificação seguida de outro comando', lambda: wf('w10', apk_com(so_verificar, 'run: |\n          python3 -I web/verificar_publicacao.py verificar missao-eear.apk --apk\n          echo pronto\n')), 2),
            ('workflows', 'outro passo entre a verificação e o envio', lambda: wf('w11', site_com(enviar, '      - run: cp -r curso _site/\n' + enviar)), 2),
            ('workflows', 'envio com if: always()', lambda: wf('w12', site_com(enviar, enviar + '        if: always()\n')), 2),
            ('workflows', 'envio com always() escrito com escape entre aspas', lambda: wf('w12b', site_com(enviar, enviar + '        if: "always\\x28)"\n')), 2),
            ('workflows', 'continue-on-error na verificação', lambda: wf('w13', site_com('      - name: Conferir\n', '      - name: Conferir\n        continue-on-error: true\n')), 2),
            ('workflows', 'shell próprio na verificação (sem parar no erro)', lambda: wf('w14', site_com('      - name: Conferir\n', '      - name: Conferir\n        shell: bash {0}\n')), 2),
            ('workflows', 'variáveis de ambiente na verificação', lambda: wf('w15', apk_com('      - name: Conferir o APK\n', '      - name: Conferir o APK\n        env:\n          PYTHONPATH: falso\n')), 2),
            ('workflows', 'python3 sem -I', lambda: wf('w16', site_com('python3 -I web/verificar_publicacao.py verificar _site', 'python3 web/verificar_publicacao.py verificar _site')), 2),
            ('workflows', 'escrita no workflow inteiro', lambda: wf('w17', site_com('permissions:\n  contents: read\n', 'permissions:\n  contents: write\n')), 2),
            ('workflows', 'segredo usado num passo', lambda: wf('w18', apk_com('${{ github.token }}', '${{ secrets.TOKEN }}')), 2),
            ('workflows', 'gatilho pull_request_target', lambda: wf('w19', site_com('on:\n  push:\n', 'on:\n  pull_request_target:\n  push:\n')), 2),
            ('workflows', 'deploy sem needs', lambda: wf('w20', site_com('    needs: montar\n', '')), 2),
            ('workflows', 'Release de um artefato que não vem de um job verificado', lambda: wf('w21', apk_com('        with:\n          name: missao-eear-apk\n      - name: Publicar', '        with:\n          name: outro\n      - name: Publicar')), 2),
            ('workflows', 'checkout de outra versão', lambda: wf('w22', site_com('      - uses: actions/checkout@v4\n', '      - uses: actions/checkout@v4\n        with:\n          ref: v1\n')), 2),
            ('workflows', 'job com escrita que não publica artefato verificado', lambda: wf('w23', apk_com('      - uses: actions/download-artifact@v4\n        with:\n          name: missao-eear-apk\n', '')), 2),
            ('workflows', 'workflow reutilizável', lambda: wf('w24', site_com(nuvem, '  outro:\n    uses: org/repo/.github/workflows/x.yml@v1\n' + nuvem)), 2),
            ('workflows', 'job com if: always()', lambda: wf('w25', site_com("    if: github.ref == 'refs/heads/main'\n", "    if: always()\n")), 2),
            ('workflows', 'ação sem versão fixa (@main)', lambda: wf('w26', site_com('actions/upload-pages-artifact@v3', 'actions/upload-pages-artifact@main')), 2),
            ('workflows', 'envio com curinga no caminho', lambda: wf('w27', apk_com('path: missao-eear.apk', 'path: "*.apk"')), 2),
            ('workflows', 'pacote do Pages verificado como app, não como site', lambda: wf('w28', site_com('verificar _site --site', 'verificar _site --app')), 2),
            ('workflows', 'defaults no workflow', lambda: wf('w29', site_com('jobs:\n', 'defaults:\n  run:\n    shell: bash\njobs:\n')), 2),
            ('workflows', 'permissões write-all num job', lambda: wf('w30', site_com('    permissions:\n      pages: write\n      id-token: write\n', '    permissions: write-all\n')), 2),
            ('YAML', 'âncora e alias', lambda: wf('y1', site_com('      - name: Conferir\n', '      - name: &a Conferir\n')), 2),
            ('YAML', 'chave repetida', lambda: wf('y2', site_com('        run: python3 web/build.py _site\n', '        run: python3 web/build.py _site\n        run: echo\n')), 2),
            ('YAML', 'chave entre aspas com escape', lambda: wf('y3', site_com('        run: python3 web/build.py _site\n', '        "r\\u0075n": python3 web/build.py _site\n')), 2),
            ('YAML', 'mapa {..}', lambda: wf('y4', site_com('        with:\n          path: _site\n', '        with: {path: _site}\n')), 2),
            ('YAML', 'tabulação', lambda: wf('y5', site_com('      - name: Montar\n', '      - name: Montar\t\n')), 2),
            ('YAML', 'valor em várias linhas', lambda: wf('y6', site_com('        run: python3 web/build.py _site\n', '        run: python3 web/build.py\n          _site\n')), 2),
            ('YAML', 'indentação inconsistente', lambda: wf('y7', site_com('        with:\n          path: _site\n', '        with:\n          path: _site\n         name: x\n')), 2),
            ('build.py', 'build.py sem a conferência', lambda: wf('b1', ok, 'print("sem conferência")'), 2),
            ('build.py', 'except que zera o resultado', lambda: wf('b2', ok, bp('    r = 2\n', '    r = 0\n')), 2),
            ('build.py', 'except só de um tipo de erro', lambda: wf('b3', ok, bp('except Exception as e:', 'except ImportError as e:')), 2),
            ('build.py', 'escreve na saída depois da conferência', lambda: wf('b4', ok, BUILD_OK + "open(os.path.join(OUT, 'x.js'), 'w').write('x')\n"), 2),
            ('build.py', 'conferência dentro de if False', lambda: wf('b5', ok, bp("    r = conferir_build(OUT, 'site')", "    if False:\n        r = conferir_build(OUT, 'site')")), 2),
            ('build.py', 'sai antes da conferência', lambda: wf('b6', ok, bp("try:\n", "sys.exit(0)\ntry:\n")), 2),
            ('build.py', 'conferir_build falsa definida no build.py', lambda: wf('b7', ok, bp("try:\n", "def conferir_build(*a):\n    return 0\ntry:\n")), 2),
            ('build.py', 'conferir_build importada de outro módulo', lambda: wf('b9', ok, bp('    from verificar_publicacao import conferir_build\n', '    from verificar_falso import conferir_build\n')), 2),
            ('build.py', 'conferir_build trocada por uma função que não confere', lambda: wf('b9b', ok, bp('    from verificar_publicacao import conferir_build\n', '    conferir_build = lambda *a: 0\n')), 2),
            ('build.py', 'finally que zera o resultado', lambda: wf('b10', ok, bp('if r:\n', 'finally:\n    r = 0\nif r:\n')), 2),
            ('build.py', 'não apaga a saída quando falha', lambda: wf('b8', ok, bp('    shutil.rmtree(OUT, ignore_errors=True)\n', '    pass\n')), 2),
            ('limite conhecido', 'palavras em outra ordem (não detecta)', lambda: verificar(site('ordem', {'dados/b.js': js(' '.join(reversed(palavras)))}), 'site', imp), 0),
            ('limite conhecido', 'letras intercaladas com números (não detecta)', lambda: verificar(site('interc', {'dados/b.js': js(''.join(c + str(i % 10) for i, c in enumerate(letras)))}), 'site', imp), 0),
        ]
        for grupo, nome, f, esperado in casos:
            if f is None:
                pulados += 1
                linhas.append(f'[pulado] [{grupo}] {nome}: não testado neste sistema (sem permissão para criar links ou FIFOs)')
                continue
            with contextlib.redirect_stdout(io.StringIO()):
                try:
                    obtido = f()
                except Exception as e:
                    obtido = f'exceção {type(e).__name__}: {e}'
            certo = obtido == esperado
            linhas.append(f"{'[ok]' if certo else '[FALHA]'} [{grupo}] {nome}: esperado {esperado}, obtido {obtido}")
            if not certo:
                falhas.append(linhas[-1])
    if pulados and (os.environ.get('CI') or os.environ.get('GITHUB_ACTIONS')):
        falhas.append(f'{pulados} caso(s) não rodaram, e no CI todos têm de rodar')
    if verboso:
        print('\n'.join(linhas))
    for f in falhas:
        print('AUTOTESTE FALHOU:', f)
    aviso = f'; {pulados} não testado(s) neste sistema (links simbólicos ou FIFO)' if pulados else ''
    print(f'OK: autoteste da verificação ({len(linhas) - pulados} casos{aviso})' if not falhas else f'FALHOU: {len(falhas)} de {len(linhas)} casos do autoteste')
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
    if a == ['cobertura']:
        sys.exit(cobertura())
    if a[:1] == ['gerar'] and '--aprovado' in a:
        i = a.index('--aprovado')
        sys.exit(gerar(a[1:i], a[i + 1:]))
    print(__doc__)
    sys.exit(2)
