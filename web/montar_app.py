"""Monta curso/app.js a partir dos arquivos de curso/app/, em ordem: o app continua publicado num único arquivo.
Cada arquivo de curso/app/ tem só declarações e comandos; a abertura e o fechamento da função vêm daqui.
Uso: python3 web/montar_app.py            regrava curso/app.js
     python3 web/montar_app.py --conferir confere, sem gravar, que curso/app.js está igual à montagem"""
import os, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PASTA, SAIDA = os.path.join(RAIZ, 'curso', 'app'), os.path.join(RAIZ, 'curso', 'app.js')
CABECALHO = '/* Missão EEAR — app do curso (sem dependências). */\n(function () {\n'
RODAPE = '})();\n'


def montar():
    partes = sorted(f for f in os.listdir(PASTA) if f.endswith('.js'))
    return CABECALHO + ''.join(open(os.path.join(PASTA, f), encoding='utf-8').read() for f in partes) + RODAPE


def confere():
    return os.path.exists(SAIDA) and open(SAIDA, encoding='utf-8').read() == montar()


if __name__ == '__main__':
    if '--conferir' in sys.argv:
        if not confere():
            sys.exit('curso/app.js difere da montagem de curso/app/: rode python3 web/montar_app.py')
        print('OK: curso/app.js igual à montagem de curso/app/')
    else:
        open(SAIDA, 'w', encoding='utf-8', newline='\n').write(montar())
        print('curso/app.js montado a partir de curso/app/')
