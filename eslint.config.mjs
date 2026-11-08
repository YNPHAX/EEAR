/* ESLint do projeto (sem dependência no repositório). Uso, na raiz:
     npx --yes eslint@9.17.0 curso/app.js curso/dados web/sw.js testes
   max-lines (350) aponta arquivos grandes demais; no-unused-vars não cobra a variável de catch porque o app evita
   "catch {}" (ES2019) para continuar abrindo em WebViews antigas do Android. */
const navegador = Object.fromEntries(['window', 'document', 'localStorage', 'sessionStorage', 'navigator', 'location', 'history',
  'console', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'requestAnimationFrame', 'fetch', 'caches', 'self',
  'URL', 'Blob', 'FileReader', 'Image', 'alert', 'confirm', 'print', 'open', 'addEventListener', 'matchMedia',
  'getComputedStyle', 'innerWidth', 'innerHeight', 'scrollTo', 'screen', 'Intl', 'crypto', 'TextEncoder', 'atob', 'btoa',
  'performance', 'IntersectionObserver', 'Request', 'Response', 'HTMLElement', 'Event', 'CustomEvent'].map(n => [n, 'readonly']));
const node = { require: 'readonly', module: 'writable', process: 'readonly', __dirname: 'readonly', console: 'readonly' };
const regras = {
  'no-undef': 'warn', 'no-unused-vars': ['warn', { caughtErrors: 'none' }], 'no-redeclare': 'warn', 'no-dupe-keys': 'error',
  'no-unreachable': 'warn', eqeqeq: ['warn', 'smart'], 'max-lines': ['warn', { max: 350 }]
};
export default [
  { files: ['curso/**/*.js', 'web/sw.js'], languageOptions: { ecmaVersion: 2022, sourceType: 'script', globals: { ...navegador, EEAR: 'writable' } }, rules: regras },
  { files: ['testes/**/*.js'], languageOptions: { ecmaVersion: 2022, sourceType: 'script', globals: { ...node, ...navegador } }, rules: regras }
];
