"""Monta o site do curso (app instalável, funciona offline) a partir de curso/.
Uso: python3 web/build.py [pasta_de_saida] [--app]
  sem --app: site para o GitHub Pages (padrão: _site/)
  com --app: a mesma coisa para o app de Android (Capacitor), sem o service worker

A versão pública não leva nada das apostilas (material com direitos autorais de outro curso):
nem as páginas, nem os gabaritos, nem o índice. Elas ficam só na versão pessoal (artifact)."""
import hashlib, json, os, re, shutil, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CURSO, WEB = os.path.join(RAIZ, 'curso'), os.path.join(RAIZ, 'web')
args = [a for a in sys.argv[1:] if not a.startswith('--')]
APP = '--app' in sys.argv
OUT = os.path.abspath(args[0] if args else os.path.join(RAIZ, '_site'))
# link do botão "Baixar o APK": vazio esconde o botão. Fica vazio até existir um APK limpo, assinado com a chave definitiva.
APK = os.environ.get('EEAR_APK_URL', '')

NOME, CURTO = 'Missão EEAR · INPHAX', 'Missão EEAR'
DESC = 'Curso preparatório da INPHAX para o CFS da EEAR: aulas com vídeo, plano de estudos até a prova, quizzes, flashcards, simulados e provas oficiais com gabarito.'
TEMA_CLARO, TEMA_ESCURO, FUNDO = '#0C0C0C', '#0C0C0C', '#0C0C0C'

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
# login dos alunos (Firebase): web/firebase.json com a configuração do app da web do projeto
fb_cfg = os.path.join(WEB, 'firebase.json')
fb = json.load(open(fb_cfg, encoding='utf-8')) if os.path.exists(fb_cfg) else None
antes = f'<script>window.EEAR_SITE = {json.dumps(modo)}; window.EEAR_APK = {json.dumps(APK)};' + (f' window.EEAR_FIREBASE = {json.dumps(fb)};' if fb else '') + '</script>\n'
registro = '' if APP else '''
<script>
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
</script>
'''
corpo = corpo.replace('<script src="dados/apostila.js"></script>\n', '')
assert 'apostila.js' not in corpo
pos = corpo.index('<script src=')
corpo = corpo[:pos] + antes + corpo[pos:]
html = f'<!doctype html>\n<html lang="pt-BR">\n<head>\n{meta}{cab}\n</head>\n<body>\n{corpo.strip()}\n{registro}</body>\n</html>\n'
open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8').write(html)

# scripts e dados
copiar(os.path.join(CURSO, 'app.js'), os.path.join(OUT, 'app.js'))
for f in sorted(os.listdir(os.path.join(CURSO, 'dados'))):
    if f.endswith('.js') and f != 'apostila.js':
        copiar(os.path.join(CURSO, 'dados', f), os.path.join(OUT, 'dados', f))

# provas oficiais (públicas), fontes e ícones
imgs = []
for raiz, _, fs in os.walk(os.path.join(CURSO, 'provas')):
    for f in sorted(fs):
        if f.endswith('.webp'):
            rel = os.path.relpath(os.path.join(raiz, f), CURSO)
            copiar(os.path.join(raiz, f), os.path.join(OUT, rel))
            imgs.append(rel)
for f in sorted(os.listdir(os.path.join(CURSO, 'marca'))):
    copiar(os.path.join(CURSO, 'marca', f), os.path.join(OUT, 'marca', f))
for pasta, ext in (('fontes', ('.woff2', '.css', '.txt')), ('icones', ('.png',))):
    for f in sorted(os.listdir(os.path.join(WEB, pasta))):
        if f.endswith(ext):
            copiar(os.path.join(WEB, pasta, f), os.path.join(OUT, pasta, f))

# páginas da política de privacidade e dos termos de uso (web/legal/), com a marca
PAGINA = """<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{titulo} · Missão EEAR · INPHAX</title>
<meta name="theme-color" content="#0C0C0C">
<link rel="icon" href="icones/favicon.png" type="image/png">
<link rel="stylesheet" href="fontes/fontes.css">
<style>
:root {{ --bg: #F3F1EC; --ink: #0C0C0C; --muted: #5F5B54; --line: #DEDAD1; --accent: #C8102E; color-scheme: light; }}
@media (prefers-color-scheme: dark) {{ :root {{ --bg: #0C0C0C; --ink: #EFEAE0; --muted: #A39E94; --line: #2B2926; --accent: #FF4D5A; color-scheme: dark; }} }}
* {{ box-sizing: border-box; }}
body {{ margin: 0; background: var(--bg); color: var(--ink); font-family: "Barlow", "Segoe UI", system-ui, sans-serif; font-size: 16px; line-height: 1.6; }}
header {{ background: #0C0C0C; color: #EFEAE0; border-bottom: 1px solid #262421; }}
.topo {{ max-width: 760px; margin: 0 auto; padding: 10px 16px; display: flex; gap: 12px; align-items: center; color: inherit; text-decoration: none; }}
.topo svg {{ width: 30px; height: 30px; border-radius: 6px; flex: none; }}
.topo span {{ display: flex; flex-direction: column; gap: 6px; line-height: 1; }}
.marca {{ display: inline-block; height: 17px; aspect-ratio: 440 / 65; background: currentColor; -webkit-mask: url(marca/inphax.png) center / contain no-repeat; mask: url(marca/inphax.png) center / contain no-repeat; }}
.topo small {{ font-family: "Saira Condensed", "Arial Narrow", sans-serif; font-weight: 700; font-size: .95rem; letter-spacing: .08em; text-transform: uppercase; color: #A39E94; }}
main {{ max-width: 760px; margin: 0 auto; padding: 24px 16px 48px; }}
h1 {{ font-family: "Saira Condensed", "Arial Narrow", sans-serif; font-weight: 700; font-size: 2.2rem; line-height: 1.05; margin: 0 0 4px; }}
h2 {{ font-family: "Saira Condensed", "Arial Narrow", sans-serif; font-weight: 700; font-size: 1.35rem; margin: 28px 0 6px; }}
.atual {{ color: var(--muted); font-size: .9rem; margin: 0 0 18px; }}
ul {{ padding-left: 1.2em; }} li {{ margin: 6px 0; }}
a {{ color: var(--accent); }}
.voltar {{ margin-top: 36px; padding-top: 16px; border-top: 1px solid var(--line); }}
</style>
</head>
<body>
<header><a class="topo" href="./"><svg viewBox="0 0 512 512" aria-hidden="true"><rect width="512" height="512" rx="56" fill="#1A1918"/><g fill="#EFEAE0"><path d="M88 82H168L424 430H344Z"/><path d="M344 82H424L338 200H258Z"/><path d="M190 291H270L168 430H88Z"/></g></svg><span><span class="marca" role="img" aria-label="INPHAX"></span><small>Missão EEAR</small></span></a></header>
<main>
{conteudo}
<p class="voltar"><a href="./">← Voltar ao curso</a></p>
</main>
</body>
</html>
"""
for nome, titulo in (('privacidade', 'Política de Privacidade'), ('termos', 'Termos de Uso')):
    conteudo = open(os.path.join(WEB, 'legal', nome + '.html'), encoding='utf-8').read().strip()
    open(os.path.join(OUT, nome + '.html'), 'w', encoding='utf-8').write(PAGINA.format(titulo=titulo, conteudo=conteudo))

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

# o build só termina depois de conferir que nada do material restrito foi para a saída (web/verificar_publicacao.py):
# se a conferência falhar ou não puder rodar, a saída é apagada, para que nada seja enviado nem por engano.
# Depois deste ponto, nada pode escrever em OUT (a conferência dos workflows confere isso).
try:
    sys.path.insert(0, WEB)
    sys.dont_write_bytecode = True  # não deixar web/__pycache__ para trás
    from verificar_publicacao import conferir_build
    r = conferir_build(OUT, 'app' if APP else 'site')
except Exception as e:
    print(f'ERRO: a conferência do conteúdo não pôde rodar ({type(e).__name__}); nada pode ser publicado')
    r = 2
if r:
    shutil.rmtree(OUT, ignore_errors=True)
    sys.exit(r)
tam = sum(os.path.getsize(os.path.join(OUT, a)) for a in todos)
print(f'{"app" if APP else "site"} em {OUT}: {len(todos)} arquivos, {tam / 1e6:.1f} MB ({len(imgs)} imagens de provas)')
