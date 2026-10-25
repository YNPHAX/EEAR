"""Monta o site do curso (app instalável, funciona offline) a partir de curso/.
Uso: python3 web/build.py [pasta_de_saida] [--app]
  sem --app: site para o GitHub Pages (padrão: _site/)
  com --app: a mesma coisa para o app de Android (Capacitor), sem o service worker

A versão pública não leva as páginas das apostilas (material com direitos autorais do curso):
a folha de respostas de cada conjunto indica a página do PDF da apostila."""
import hashlib, json, os, re, shutil, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CURSO, WEB = os.path.join(RAIZ, 'curso'), os.path.join(RAIZ, 'web')
args = [a for a in sys.argv[1:] if not a.startswith('--')]
APP = '--app' in sys.argv
OUT = os.path.abspath(args[0] if args else os.path.join(RAIZ, '_site'))
REPO = os.environ.get('GITHUB_REPOSITORY', 'YNPHAX/EEAR')
APK = f'https://github.com/{REPO}/releases/latest/download/missao-eear.apk'

NOME, CURTO = 'Missão EEAR · curso CFS', 'Missão EEAR'
DESC = 'Curso preparatório para o CFS da EEAR: plano de estudos até a prova, teoria, quizzes, flashcards, simulados e provas oficiais com gabarito.'
TEMA_CLARO, TEMA_ESCURO, FUNDO = '#FFFFFF', '#111D31', '#EDF1F6'

if os.path.exists(OUT):
    shutil.rmtree(OUT)
os.makedirs(OUT)

def copiar(src, dst):
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    shutil.copy2(src, dst)

# página: o index.html do curso é um fragmento (cabeçalho + corpo); aqui vira um documento completo
frag = open(os.path.join(CURSO, 'index.html'), encoding='utf-8').read()
corte = frag.index('</style>') + len('</style>')
cab, corpo = frag[:corte], frag[corte:]
cab = re.sub(r'<meta name="claude:[^>]*>\n?', '', cab)
cab = re.sub(r'<link rel="preconnect"[^>]*>\n?', '', cab)
cab = re.sub(r'<link rel="stylesheet" href="https://fonts\.googleapis\.com[^>]*>', '<link rel="stylesheet" href="fontes/fontes.css">', cab)
assert 'fonts.googleapis' not in cab
meta = f'''<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="{DESC}">
<meta name="theme-color" content="{TEMA_CLARO}" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="{TEMA_ESCURO}" media="(prefers-color-scheme: dark)">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="{CURTO}">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icones/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="icones/apple-touch-icon.png">
'''
modo = 'app' if APP else 'site'
antes = f'<script>window.EEAR_SITE = {json.dumps(modo)}; window.EEAR_APK = {json.dumps(APK)};</script>\n'
registro = '' if APP else '''
<script>
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
</script>
'''
pos = corpo.index('<script src=')
corpo = corpo[:pos] + antes + corpo[pos:]
html = f'<!doctype html>\n<html lang="pt-BR">\n<head>\n{meta}{cab}\n</head>\n<body>\n{corpo.strip()}\n{registro}</body>\n</html>\n'
open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8').write(html)

# scripts e dados
copiar(os.path.join(CURSO, 'app.js'), os.path.join(OUT, 'app.js'))
for f in sorted(os.listdir(os.path.join(CURSO, 'dados'))):
    if f.endswith('.js'):
        copiar(os.path.join(CURSO, 'dados', f), os.path.join(OUT, 'dados', f))
with open(os.path.join(OUT, 'dados', 'apostila.js'), 'a', encoding='utf-8') as fh:
    fh.write('\n/* Versão pública: sem as imagens das páginas das apostilas. */\nEEAR.apostila.paginas = false;\n')

# provas oficiais (públicas), fontes e ícones
imgs = []
for raiz, _, fs in os.walk(os.path.join(CURSO, 'provas')):
    for f in sorted(fs):
        if f.endswith('.webp'):
            rel = os.path.relpath(os.path.join(raiz, f), CURSO)
            copiar(os.path.join(raiz, f), os.path.join(OUT, rel))
            imgs.append(rel)
for pasta, ext in (('fontes', ('.woff2', '.css', '.txt')), ('icones', ('.png',))):
    for f in sorted(os.listdir(os.path.join(WEB, pasta))):
        if f.endswith(ext):
            copiar(os.path.join(WEB, pasta, f), os.path.join(OUT, pasta, f))

# manifesto do app instalável
manifesto = {
    'name': NOME, 'short_name': CURTO, 'description': DESC, 'lang': 'pt-BR',
    'start_url': './', 'scope': './', 'display': 'standalone', 'orientation': 'any',
    'background_color': FUNDO, 'theme_color': TEMA_ESCURO, 'categories': ['education'],
    'icons': [
        {'src': 'icones/icone-192.png', 'sizes': '192x192', 'type': 'image/png', 'purpose': 'any'},
        {'src': 'icones/icone-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'any'},
        {'src': 'icones/icone-maskable-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'maskable'},
    ],
}
open(os.path.join(OUT, 'manifest.webmanifest'), 'w', encoding='utf-8').write(json.dumps(manifesto, ensure_ascii=False, indent=1))

def hash_de(arqs):
    h = hashlib.sha256()
    for a in arqs:
        h.update(a.encode()); h.update(open(os.path.join(OUT, a), 'rb').read())
    return h.hexdigest()[:12]

todos = sorted(os.path.relpath(os.path.join(r, f), OUT).replace(os.sep, '/') for r, _, fs in os.walk(OUT) for f in fs)
nucleo = [a for a in todos if not a.startswith('provas/') and not a.endswith('.txt')]
if not APP:
    # service worker: guarda o app inteiro (menos as imagens das provas, que entram no cache quando abertas)
    sw = open(os.path.join(WEB, 'sw.js'), encoding='utf-8').read()
    sw = sw.replace("'__VERSAO__'", json.dumps(hash_de(nucleo))).replace("'__VERSAO_IMG__'", json.dumps(hash_de(sorted(imgs))))
    sw = sw.replace('[/*__ARQUIVOS__*/]', json.dumps(['./'] + [a for a in nucleo if a != 'index.html']))
    open(os.path.join(OUT, 'sw.js'), 'w', encoding='utf-8').write(sw)
    open(os.path.join(OUT, '.nojekyll'), 'w').close()
tam = sum(os.path.getsize(os.path.join(OUT, a)) for a in todos)
print(f'{"app" if APP else "site"} em {OUT}: {len(todos)} arquivos, {tam / 1e6:.1f} MB ({len(imgs)} imagens de provas)')
