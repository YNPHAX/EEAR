"""Confere as videoaulas do curso no YouTube: se o vídeo existe e se pode tocar dentro do site.
Uso: python3 web/conferir_videos.py [arquivo]
  sem arquivo: confere os vídeos de curso/dados/videoaulas.js e falha se algum saiu do ar
  com arquivo: linhas "MÓDULO id id ..." (candidatos); imprime título e canal de cada um
Cada vídeo sai numa linha "VIDEO {json}" com id, módulo, situação, título e canal."""
import json, os, re, sys, time, urllib.error, urllib.parse, urllib.request

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def oembed(vid):
    url = 'https://www.youtube.com/oembed?format=json&url=' + urllib.parse.quote(f'https://www.youtube.com/watch?v={vid}')
    for tentativa in range(3):
        try:
            with urllib.request.urlopen(url, timeout=20) as r:
                d = json.load(r)
                return 'ok', d.get('title', ''), d.get('author_name', '')
        except urllib.error.HTTPError as e:
            # 401: o dono não permite tocar fora do YouTube; 400/404: removido ou privado
            if e.code in (400, 401, 403, 404):
                return {401: 'sem_incorporar', 403: 'sem_incorporar'}.get(e.code, 'fora_do_ar'), '', ''
        except Exception:
            pass
        time.sleep(2 * (tentativa + 1))
    return 'erro', '', ''

if len(sys.argv) > 1:
    pares = []
    for linha in open(sys.argv[1], encoding='utf-8'):
        p = linha.split()
        pares += [(p[0], v, None) for v in p[1:]]
else:
    js = open(os.path.join(RAIZ, 'curso', 'dados', 'videoaulas.js'), encoding='utf-8').read()
    dados = json.loads(js[js.index('{'):js.rindex('}') + 1])
    pares = [(m, v['id'], v.get('k')) for m, vs in dados.items() for v in vs]

ruins = 0
for mod, vid, tipo in pares:
    sit, titulo, canal = oembed(vid)
    # os de tipo "y" só abrem no YouTube: basta estarem no ar
    ruins += not (sit == 'ok' or (tipo == 'y' and sit == 'sem_incorporar'))
    print('VIDEO ' + json.dumps({'mod': mod, 'id': vid, 'sit': sit, 'titulo': titulo, 'canal': canal}, ensure_ascii=False), flush=True)
    time.sleep(0.3)
print(f'{len(pares)} vídeos conferidos, {ruins} com problema')
if len(sys.argv) == 1 and ruins:
    sys.exit(1)
