"""Lê o gabarito oficial impresso no PDF da prova (pares "NN  X" ou "NN  ANULADA") e imprime as 96 respostas,
com X nas anuladas, no formato do campo "gab" de provas.json.
Uso: python3 ferramentas/provas/gabarito.py prova.pdf pagina_do_gabarito"""
import re, subprocess, sys

pdf, pag = sys.argv[1], sys.argv[2]
t = subprocess.run(['pdftotext', '-f', pag, '-l', pag, '-layout', pdf, '-'], capture_output=True, text=True).stdout
g = {int(n): r.upper() for n, r in re.findall(r'\b(\d{2})\s+(A|B|C|D|ANULADA|Anulada)\b', t)}
falta = sorted(set(range(1, 97)) - set(g))
assert not falta, 'não achei as questões ' + str(falta)
print(''.join('X' if g[n] == 'ANULADA' else g[n] for n in range(1, 97)))
