# GitHub Pages

Este projeto pode ser publicado no GitHub Pages desde que o build use um `base` compatível com o caminho do repositório.

## Como compilar

Para este repositório, rode:

```bash
npm run build:pages
```

O script já define `VITE_BASE_PATH=/Betario/`, compila o app e sincroniza `dist/client` para `docs/`. Ele também renderiza HTML SSR estático por `dist/server/server.js` e recria `index.html` e `404.html` com o estado de hidratação exigido pelo TanStack Router.

Se o repositório estiver na raiz de um domínio próprio, use:

```bash
VITE_BASE_PATH=/ npm run build && npm run pages:sync
```

## O que esse ajuste cobre

- Corrige os caminhos dos assets gerados pelo Vite.
- Ajusta o roteamento do TanStack Router para funcionar no subpath do GitHub Pages.
- Mantém o build local separado em `npm run build`.
- Entrega o conteúdo final diretamente na raiz de `docs/`.

## Publicação

O GitHub Pages só serve arquivos estáticos. Publique o conteúdo compilado diretamente do diretório `docs/`, onde o `index.html` fica na raiz. Depois de rodar `npm run build:pages`, os arquivos alterados em `docs/` precisam ser commitados na branch configurada no Pages.

## Workflow recomendado

O fluxo recomendado agora é o workflow `.github/workflows/pages.yml`.

Ele executa:

```bash
npm ci
npm run test
npm run lint
npm run build:pages
```

Depois publica o diretório `docs/` de duas formas:

- `actions/upload-pages-artifact` + `actions/deploy-pages`;
- branch `gh-pages`, forçada com o mesmo conteúdo de `docs/`.

Para esse workflow funcionar, configure **Settings → Pages → Build and deployment → Source** como **GitHub Actions** ou como **Deploy from a branch → gh-pages / root**.

Se a URL pública continuar servindo HTML antigo, confira se o workflow rodou após o último commit. O HTML correto contém `$_TSR.router`; o HTML antigo contém apenas `<div id="root"></div>`.

## Observação

Se você usar ações de CI, o valor de `VITE_BASE_PATH` precisa ser o mesmo do caminho público final do site, normalmente `/<nome-do-repositorio>/`.
