"""Folhas de contato dos recortes: python3 folhas.py pasta_dos_recortes pasta_saida"""
import json, os, sys
from PIL import Image, ImageDraw
D, OUT = sys.argv[1], sys.argv[2]
it = json.load(open(D + '/itens.json'))
os.makedirs(OUT, exist_ok=True)
S, COLW, MAXH = 0.5, 380, 1900
sheets, cols, colh = [], [[]], [0]
def flush():
    global cols, colh
    if any(cols):
        im = Image.new('RGB', (COLW * len(cols), max(colh)), (200, 200, 200))
        for ci, c in enumerate(cols):
            y = 0
            for nome, p in c:
                im.paste(p, (ci * COLW, y)); ImageDraw.Draw(im).text((ci * COLW + 330, y + 2), nome, fill=(255, 0, 0)); y += p.height + 6
        sheets.append(im)
    cols, colh = [[]], [0]
for i in it:
    p = Image.open(D + '/' + i['img']).convert('RGB'); p = p.resize((int(p.width * S), int(p.height * S)))
    if colh[-1] + p.height > MAXH and cols[-1]:
        if len(cols) == 4: flush()
        else: cols.append([]); colh.append(0)
    cols[-1].append((i['img'][:3], p)); colh[-1] += p.height + 6
flush()
for k, s in enumerate(sheets): s.save(OUT + '/f%02d.png' % k)
print(len(sheets))
