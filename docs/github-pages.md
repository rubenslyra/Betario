# GitHub Pages

Este projeto pode ser publicado no GitHub Pages desde que o build use um `base` compatível com o caminho do repositório.

## Como compilar

Para este repositório, rode:

```bash
npm run build:pages
```

O script já define `VITE_BASE_PATH=/bet-ray-lab-cognitive-sandbox/`, compila o app e sincroniza `dist/client` para `docs/`. Ele também recria `index.html` e `404.html`, ambos apontando para os assets atuais.

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

Depois publica o diretório `docs/` usando `actions/upload-pages-artifact` e `actions/deploy-pages`.

Para esse workflow funcionar, configure **Settings → Pages → Build and deployment → Source** como **GitHub Actions**.

Se a URL pública responder `404`, a Action pode ter passado sem ser a origem ativa do Pages. Confira se o Pages está configurado como **GitHub Actions**; se estiver em “Deploy from a branch”, ele pode ignorar o artefato enviado pelo workflow.

## Observação

Se você usar ações de CI, o valor de `VITE_BASE_PATH` precisa ser o mesmo do caminho público final do site, normalmente `/<nome-do-repositorio>/`.
