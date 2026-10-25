"""Gera os ícones do site e do app (três divisas de sargento sobre azul-marinho).
Uso: python3 web/icones/gerar_icones.py"""
import os
from PIL import Image, ImageDraw

AQUI = os.path.dirname(os.path.abspath(__file__))
APP = os.path.join(AQUI, '..', '..', 'app', 'assets')
FUNDO, DIVISA = (14, 31, 54), (255, 128, 72)
SS = 4  # supersampling para bordas suaves


def divisas(d, cx, cy, escala):
    """Três divisas (^) empilhadas, centradas em (cx, cy); escala = largura total."""
    w, h, t, gap = escala / 2, escala * 0.34, escala * 0.13, escala * 0.21
    topo = cy - (h + 2 * gap + t) / 2
    for k in range(3):
        y = topo + k * gap
        d.polygon([(cx - w, y + h), (cx, y), (cx + w, y + h), (cx + w, y + h + t), (cx, y + t), (cx - w, y + h + t)], fill=DIVISA)


def icone(lado, conteudo=0.62, raio=0.0, fundo=True):
    L = lado * SS
    im = Image.new('RGBA', (L, L), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    if fundo:
        if raio:
            d.rounded_rectangle([0, 0, L - 1, L - 1], radius=int(L * raio), fill=FUNDO)
        else:
            d.rectangle([0, 0, L, L], fill=FUNDO)
    divisas(d, L / 2, L / 2, L * conteudo)
    return im.resize((lado, lado), Image.LANCZOS)


icone(192, raio=0.22).save(os.path.join(AQUI, 'icone-192.png'))
icone(512, raio=0.22).save(os.path.join(AQUI, 'icone-512.png'))
icone(512, conteudo=0.48).save(os.path.join(AQUI, 'icone-maskable-512.png'))  # área segura do Android
icone(180).convert('RGB').save(os.path.join(AQUI, 'apple-touch-icon.png'))
icone(64, raio=0.22).save(os.path.join(AQUI, 'favicon.png'))
# fontes para o @capacitor/assets (ícones e telas de abertura do app)
os.makedirs(APP, exist_ok=True)
icone(1024).convert('RGB').save(os.path.join(APP, 'icon-only.png'))
icone(1024, conteudo=0.40, fundo=False).save(os.path.join(APP, 'icon-foreground.png'))
Image.new('RGB', (1024, 1024), FUNDO).save(os.path.join(APP, 'icon-background.png'))
for nome in ('splash.png', 'splash-dark.png'):
    s = Image.new('RGB', (2732, 2732), FUNDO)
    s.paste(icone(600, conteudo=0.62, fundo=False), (1066, 1066), icone(600, conteudo=0.62, fundo=False))
    s.save(os.path.join(APP, nome))
print('ok')
