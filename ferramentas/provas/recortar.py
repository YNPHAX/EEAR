"""Recorta cada questão (e cada texto-base) de uma prova da EEAR em PDF com texto.
Uso: python3 recortar.py prova.pdf saida/ primeira_pagina_de_questoes
Gera saida/qNN.webp, saida/tXX.webp e saida/itens.json (texto extraído de cada recorte e o gabarito)."""
import json, os, re, subprocess, sys, html
from xml.etree import ElementTree as ET
from PIL import Image, ImageFilter
import numpy as np

PDF, OUT, P0 = sys.argv[1], sys.argv[2], int(sys.argv[3])
DPI = 200
K = DPI / 72.0
os.makedirs(OUT, exist_ok=True)
npag = int(subprocess.run(['pdfinfo', PDF], capture_output=True, text=True).stdout.split('Pages:')[1].split()[0])

xml = subprocess.run(['pdftotext', '-bbox-layout', '-f', str(P0), '-l', str(npag), PDF, '-'], capture_output=True, text=True).stdout
xml = re.sub(r'<!DOCTYPE[^>]*>', '', xml)
root = ET.fromstring(xml)
ns = {'x': 'http://www.w3.org/1999/xhtml'}
paginas = root.findall('.//x:page', ns)

QRX = re.compile(r'^(\d{2})\s*[–‐-]\s')
TRX = re.compile(r'^(TEXTO\s+[IVX]+|Read the (text|texts|paragraph|cartoon|comic|comic strip|excerpt|passage|dialog|dialogue|poem|article)\b)', re.I)
SKIP = re.compile(r'^(AS QUESTÕES DE|As questões de|À LÍNGUA|À MATEMÁTICA|À FÍSICA|Rascunho\s*$)', re.I)
CAB = re.compile(r'^AS QUESTÕES DE \d+ A \d+ REFEREM', re.I)  # cabeçalho da matéria
MATERIA = re.compile(r'^(LÍNGUA PORTUGUESA|LÍNGUA INGLESA|MATEMÁTICA|FÍSICA)\s*$', re.I)

linhas = []  # (pag, col, y0, y1, x0, x1, texto)
cols = {}
for i, pg in enumerate(paginas):
    pno = P0 + i
    W, H = float(pg.get('width')), float(pg.get('height'))
    meio = W / 2
    ws = []
    for w in pg.findall('.//x:word', ns):
        t = (w.text or '').strip()
        if t:
            ws.append((float(w.get('xMin')), float(w.get('xMax')), float(w.get('yMin')), float(w.get('yMax')), t))
    # linhas montadas por coluna: palavras com o mesmo yMin (tolerância de 2 pt)
    pls = []
    for col in (0, 1):
        cw = sorted([w for w in ws if (w[0] < meio - 4) == (col == 0)], key=lambda w: (w[3], w[0]))
        atual = []
        for w in cw:
            # mesma linha: base (yMax) próxima; o número da questão em negrito começa mais alto
            if atual and abs(w[3] - atual[-1][3]) > 2.5:
                pls.append((col, atual)); atual = []
            atual.append(w)
        if atual:
            pls.append((col, atual))
    pe = [ws_ for c, ws_ in pls if re.match(r'^(Página|Inscrição)', ' '.join(x[4] for x in sorted(ws_)))]
    bottom = min(min(x[2] for x in ws_) for ws_ in pe) - 2 if pe else H - 25
    cols[pno] = {'W': W, 'H': H, 'bottom': bottom, 'meio': meio}
    for col, lw in pls:
        lw = sorted(lw)
        y0 = min(x[2] for x in lw)
        if y0 >= bottom:
            continue
        linhas.append((pno, col, y0, max(x[3] for x in lw), min(x[0] for x in lw), max(x[1] for x in lw), ' '.join(x[4] for x in lw)))
linhas.sort(key=lambda l: (l[0], l[1], l[2], l[4]))

# marcos na ordem de leitura
marcos, esperado, apos_cab = [], 1, False
for l in linhas:
    t = l[6]
    m = QRX.match(t)
    if m and int(m.group(1)) == esperado:
        marcos.append(('q', esperado, l)); esperado += 1
    elif TRX.match(t):
        marcos.append(('t', None, l))
    elif SKIP.match(t):
        marcos.append(('s', None, l))
        # o cabeçalho pode vir em duas linhas ("... REFEREM-SE" / "À LÍNGUA PORTUGUESA")
        apos_cab = bool(CAB.match(t)) or (apos_cab and t.startswith('À '))
        continue
    elif apos_cab and not MATERIA.match(t):
        # texto sem título "TEXTO I" logo abaixo do cabeçalho da matéria (ex.: "Furto de flor")
        marcos.append(('t', None, l))
    elif apos_cab:
        continue
    apos_cab = False
print('questões encontradas:', esperado - 1)

def pos(l):
    return (l[0], l[1], l[2])

render = {}
def pagina(pno):
    if pno not in render:
        pre = os.path.join(OUT, '_p%02d' % pno)
        subprocess.run(['pdftoppm', '-f', str(pno), '-l', str(pno), '-r', str(DPI), '-gray', '-png', PDF, pre], check=True)
        f = sorted(x for x in os.listdir(OUT) if x.startswith('_p%02d' % pno))[-1]
        render[pno] = Image.open(os.path.join(OUT, f)).convert('L')
        os.remove(os.path.join(OUT, f))
    return render[pno]

def topo_col(pno, col):
    ys = [l[2] for l in linhas if l[0] == pno and l[1] == col]
    return min(ys) if ys else 30

def corte(l):
    """Topo do bloco que começa na linha l: meio da maior faixa branca entre a linha anterior da coluna e l
    (pega fórmulas e figuras que sobem acima da linha do número da questão)."""
    pno, col, y0 = l[0], l[1], l[2]
    ant = [x for x in linhas if x[0] == pno and x[1] == col and x[3] < y0 - 0.5]
    ya = max(x[3] for x in ant) if ant else 18
    if y0 - ya < 4:
        return y0 - 2
    im = pagina(pno); c = cols[pno]
    xa = 18 if col == 0 else c['meio'] + 6
    xb = c['meio'] - 6 if col == 0 else c['W'] - 26
    faixa = np.asarray(im.crop((int(xa * K), int(ya * K), int(xb * K), int(y0 * K)))) < 170
    faixa[:, faixa.mean(axis=0) > 0.6] = False  # ignora os fios verticais da página
    branca = faixa.sum(axis=1) == 0
    melhor, ini, run = (0, 0), None, 0
    for i, w in enumerate(list(branca) + [False]):
        if w:
            ini = i if ini is None else ini
        elif ini is not None:
            if i - ini > melhor[1] - melhor[0]:
                melhor = (ini, i)
            ini = None
    if melhor[1] - melhor[0] < 2:
        return y0 - 2
    return ya + (melhor[0] + melhor[1]) / 2 / K


def segmentos(a, b):
    """Faixas (pag, col, ytop, ybot) entre o início do marco a e o início do marco b."""
    segs = []
    pno, col, y = a[0], a[1], corte(a)
    # o último marco vai só até a última linha de texto da prova (as páginas finais podem estar em branco)
    ult = linhas[-1]
    fim = (b[0], b[1], corte(b)) if b else (ult[0], ult[1], ult[3] + 6)
    while True:
        bot = cols[pno]['bottom']
        if (pno, col) == fim[:2]:
            segs.append((pno, col, y, min(fim[2], bot))); break
        segs.append((pno, col, y, bot))
        if col == 0:
            col = 1
        else:
            pno, col = pno + 1, 0
            if pno not in cols:
                break
        y = topo_col(pno, col) - 3
    return [s for s in segs if s[3] - s[2] > 4]

def texto_de(segs):
    out = []
    for pno, col, y0, y1 in segs:
        for l in linhas:
            if l[0] == pno and l[1] == col and y0 <= l[2] < y1:
                out.append(l[6])
    return '\n'.join(out)

def faixa_util(tinta):
    """Início e fim do conteúdo numa projeção, ignorando manchinhas isoladas nas pontas."""
    runs, ini = [], None
    for i, v in enumerate(list(tinta) + [0]):
        if v and ini is None:
            ini = i
        elif not v and ini is not None:
            runs.append([ini, i, int(tinta[ini:i].sum())]); ini = None
    if not runs:
        return None
    while len(runs) > 1 and runs[0][2] <= 15 and runs[1][0] - runs[0][1] >= 12:
        runs.pop(0)
    while len(runs) > 1 and runs[-1][2] <= 15 and runs[-1][0] - runs[-2][1] >= 12:
        runs.pop()
    return runs[0][0], runs[-1][1]

def caixa(p):
    m = np.asarray(p) < 200
    ys = faixa_util(m.sum(axis=1))
    if not ys:
        return None
    xs = faixa_util(m[ys[0]:ys[1]].sum(axis=0))
    return xs[0], ys[0], xs[1], ys[1]

def aparar(p):
    """Corta o branco em volta, apagando antes os fios horizontais que ficam na borda (separadores
    entre questões)."""
    for _ in range(3):
        bb = caixa(p)
        if not bb:
            return p
        p = p.crop((max(0, bb[0] - 8), max(0, bb[1] - 8), min(p.width, bb[2] + 8), min(p.height, bb[3] + 8)))
        a_ = np.asarray(p).copy()
        lin = (a_ < 160).mean(axis=1)
        bl = np.zeros_like(lin, dtype=bool); bl[:30] = True; bl[-30:] = True
        ys = np.nonzero((lin > 0.6) & bl)[0]
        if not len(ys):
            return p
        for y in ys:
            a_[max(0, y - 1):y + 2, :] = 255
        p = Image.fromarray(a_)
    return p

def recorte(segs, nome):
    partes = []
    for pno, col, y0, y1 in segs:
        im = pagina(pno)
        c = cols[pno]
        xa = 18 if col == 0 else c['meio'] - 4
        xb = c['meio'] + 4 if col == 0 else c['W'] - 18
        # aperta a margem lateral ao conteúdo da faixa
        ls = [l for l in linhas if l[0] == pno and l[1] == col and y0 <= l[2] < y1]
        if ls:
            xa = max(xa, min(l[4] for l in ls) - 6)
            xb = min(xb, max(l[5] for l in ls) + 6) if col == 0 else xb
        box = tuple(int(v * K) for v in (xa, y0, xb, y1))
        p = im.crop(box)
        # apaga os fios verticais que separam as colunas (colunas de pixels quase todas escuras)
        a_ = np.asarray(p).copy()
        if a_.shape[0] > 40:
            esc = a_ < 160
            escuro = esc.mean(axis=0)
            borda = np.zeros_like(escuro, dtype=bool); borda[:90] = True; borda[-90:] = True
            for x in np.nonzero((escuro > 0.45) & borda)[0]:
                # só o fio que atravessa a faixa inteira (a borda de uma tirinha ou figura fica)
                col = np.concatenate([[False], esc[:, x], [False]]).astype(np.int8)
                d = np.diff(col); ini_, fim_ = np.nonzero(d == 1)[0], np.nonzero(d == -1)[0]
                k = np.argmax(fim_ - ini_)
                if fim_[k] - ini_[k] >= 0.8 * a_.shape[0]:
                    a_[ini_[k]:fim_[k], max(0, x - 1):x + 2] = 255
            p = Image.fromarray(a_)
        if not ls and (np.asarray(p) < 160).mean() < 0.002:
            continue  # faixa sem texto e quase sem tinta (resto de página em branco)
        p = aparar(p)
        partes.append(p)
    w = max(p.width for p in partes)
    h = sum(p.height for p in partes) + 12 * (len(partes) - 1)
    out = Image.new('L', (w, h), 255)
    y = 0
    for p in partes:
        out.paste(p, (0, y)); y += p.height + 12
    out.save(os.path.join(OUT, nome + '.webp'), 'WEBP', quality=88)
    return out.size

itens, tid = [], 0
for i, (tipo, n, l) in enumerate(marcos):
    nx = marcos[i + 1][2] if i + 1 < len(marcos) else None
    if tipo == 's':
        continue
    segs = segmentos(l, nx)
    if not segs:
        continue
    if tipo == 'q':
        nome = 'q%02d' % n
    else:
        tid += 1; nome = 't%02d' % tid
    size = recorte(segs, nome)
    itens.append({'tipo': tipo, 'n': n, 'img': nome + '.webp', 'w': size[0], 'h': size[1], 'texto': texto_de(segs), 'segs': segs})
json.dump(itens, open(os.path.join(OUT, 'itens.json'), 'w'), ensure_ascii=False, indent=1)
print(len(itens), 'recortes')
