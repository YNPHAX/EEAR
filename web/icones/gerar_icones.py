"""Gera os ícones do site e do app a partir do X da INPHAX (em vetor).
Uso: python3 web/icones/gerar_icones.py"""
import os
from PIL import Image, ImageDraw

AQUI = os.path.dirname(os.path.abspath(__file__))
APP = os.path.join(AQUI, '..', '..', 'app', 'assets')
FUNDO, TRACO = (12, 12, 12), (239, 234, 224)
SS = 4  # supersampling para bordas suaves
# os três traços do X, no quadro de 512 x 512 do ícone original
X = [[(88, 82), (168, 82), (424, 430), (344, 430)],
     [(344, 82), (424, 82), (338, 200), (258, 200)],
     [(190, 291), (270, 291), (168, 430), (88, 430)]]


def icone(lado, escala=1.0, raio=0.0, fundo=True):
    """escala 1 = mesmo tamanho do X no ícone original; raio em fração do lado."""
    L = lado * SS
    im = Image.new('RGBA', (L, L), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    if fundo:
        if raio:
            d.rounded_rectangle([0, 0, L - 1, L - 1], radius=int(L * raio), fill=FUNDO)
        else:
            d.rectangle([0, 0, L, L], fill=FUNDO)
    k = escala * L / 512
    for poli in X:
        d.polygon([((x - 256) * k + L / 2, (y - 256) * k + L / 2) for x, y in poli], fill=TRACO)
    return im.resize((lado, lado), Image.LANCZOS)


icone(192, raio=0.2).save(os.path.join(AQUI, 'icone-192.png'))
icone(512, raio=0.2).save(os.path.join(AQUI, 'icone-512.png'))
icone(512, escala=0.78).save(os.path.join(AQUI, 'icone-maskable-512.png'))  # área segura do Android
icone(180, escala=0.9).convert('RGB').save(os.path.join(AQUI, 'apple-touch-icon.png'))
icone(64, escala=1.08, raio=0.2).save(os.path.join(AQUI, 'favicon.png'))
# fontes para o @capacitor/assets (ícones e telas de abertura do app)
os.makedirs(APP, exist_ok=True)
icone(1024).convert('RGB').save(os.path.join(APP, 'icon-only.png'))
icone(1024, escala=0.62, fundo=False).save(os.path.join(APP, 'icon-foreground.png'))
Image.new('RGB', (1024, 1024), FUNDO).save(os.path.join(APP, 'icon-background.png'))
marca = icone(600, fundo=False)
for nome in ('splash.png', 'splash-dark.png'):
    s = Image.new('RGB', (2732, 2732), FUNDO)
    s.paste(marca, (1066, 1066), marca)
    s.save(os.path.join(APP, nome))
print('ok')
