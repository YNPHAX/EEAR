"""Gera curso/dados/provas.js a partir de ferramentas/provas/provas.json (gabarito oficial, módulo de cada questão
e textos-base de cada prova) e dos recortes em curso/provas/<pasta>/ (imagens e itens.json, saídos do recortar.py).
Uso: python3 ferramentas/provas/gerar_provas.py"""
import json, os, re

AQUI = os.path.dirname(os.path.abspath(__file__))
CURSO = os.path.join(os.path.dirname(os.path.dirname(AQUI)), 'curso')
# Ordem das matérias, 24 questões cada. Nas provas de Controle de Tráfego Aéreo (BCT) é "por ing mat fis".
ORDEM = 'por mat fis ing'

def faixas(d):
    """{'POR01': '1-4 24'} -> {1: 'POR01', ...}"""
    out = {}
    for mod, s in d.items():
        for parte in s.split():
            a, _, b = parte.partition('-')
            for n in range(int(a), int(b or a) + 1):
                assert n not in out, n
                out[n] = mod
    return out

def alt(texto):
    return re.sub(r'\s+', ' ', texto).strip()

saida = ['/* Provas anteriores oficiais da EEAR: questões recortadas da prova original e gabarito oficial. */']
for P in json.load(open(os.path.join(AQUI, 'provas.json'), encoding='utf-8')):
    gab, ordem = P['gab'], P.get('ordem', ORDEM).split()
    materia = lambda n: ordem[(n - 1) // 24]
    assert len(gab) == 96 and set(gab) <= set('ABCDX'), P['id']
    mods, usa = faixas(P['mods']), faixas(P['usa'])
    assert sorted(mods) == list(range(1, 97)), (P['id'], sorted(set(range(1, 97)) - set(mods)))
    for n, m in mods.items():
        assert m[:3].lower() == materia(n), (P['id'], n, m)
    itens = json.load(open(os.path.join(CURSO, 'provas', P['pasta'], 'itens.json'), encoding='utf-8'))
    for i in itens:
        assert os.path.exists(os.path.join(CURSO, 'provas', P['pasta'], i['img'])), (P['id'], i['img'])
    ts = [i for i in itens if i['tipo'] == 't']
    qs = {i['n']: i for i in itens if i['tipo'] == 'q'}
    assert sorted(qs) == list(range(1, 97)), P['id']
    textos = {k: [{'img': ts[j - 1]['img'], 'w': ts[j - 1]['w'], 'h': ts[j - 1]['h'], 'alt': alt(ts[j - 1]['texto'])} for j in v]
              for k, v in P['textos'].items()}
    q = []
    for n in range(1, 97):
        i = qs[n]
        x = {'n': n, 'm': materia(n), 'mod': mods[n], 'img': i['img'], 'w': i['w'], 'h': i['h'], 'alt': alt(i['texto'])}
        if n in usa:
            x['t'] = usa[n]
        r = gab[n - 1]
        x['c'] = 0 if r == 'X' else 'ABCD'.index(r)
        if r == 'X':
            x['anulada'] = 1
        q.append(x)
    prova = {k: P[k] for k in ('id', 'nome', 'data', 'min')}
    prova.update({'dir': 'provas/' + P['pasta'] + '/', 'fonte': P['fonte'], 'textos': textos, 'q': q})
    saida.append('EEAR.addProva(' + json.dumps(prova, ensure_ascii=False, separators=(',', ':')) + ');')
    print(P['nome'], 'gabarito', gab, 'anuladas', [n for n in range(1, 97) if gab[n - 1] == 'X'], 'imagens', len(itens))
open(os.path.join(CURSO, 'dados', 'provas.js'), 'w', encoding='utf-8').write('\n'.join(saida) + '\n')
print('ok')
