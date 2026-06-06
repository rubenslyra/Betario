# GitHub Pages

Este projeto pode ser publicado no GitHub Pages desde que o build use um `base` compatível com o caminho do repositório.

## Como compilar

Defina `VITE_BASE_PATH` com o caminho público do site e rode o build normal:

```bash
VITE_BASE_PATH=/nome-do-repositorio/ npm run build
```

Se o repositório estiver na raiz de um domínio próprio, use `/`.

O comando `npm run build` gera o bundle em `dist/client` e copia o resultado para a raiz de `docs/`, deixando o `index.html` pronto para o GitHub Pages.

## O que esse ajuste cobre

- Corrige os caminhos dos assets gerados pelo Vite.
- Ajusta o roteamento do TanStack Router para funcionar no subpath do GitHub Pages.
- Mantém o mesmo build local quando `VITE_BASE_PATH` não está definido.
- Entrega o conteúdo final diretamente na raiz de `docs/`.

## Publicação

O GitHub Pages só serve arquivos estáticos. Publique o conteúdo compilado diretamente do diretório `docs/`, onde o `index.html` fica na raiz.

## Observação

Se você usar ações de CI, o valor de `VITE_BASE_PATH` precisa ser o mesmo do caminho público final do site, normalmente `/<nome-do-repositorio>/`.