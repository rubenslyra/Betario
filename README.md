<div align="center">

# ☕ BET-RAY Lab

**Laboratório Educacional de Probabilidade e Vieses Cognitivos**

[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge&labelColor=1a1a2e)](LICENSE)
[![Stack](https://img.shields.io/badge/Stack-TanStack_Start-ff6b6b?style=for-the-badge&logo=react&logoColor=white&labelColor=1a1a2e)](https://tanstack.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=for-the-badge&logo=typescript&logoColor=white&labelColor=1a1a2e)](https://www.typescriptlang.org/)
[![SQLite](https://img.shields.io/badge/SQLite-WASM-003b57?style=for-the-badge&logo=sqlite&logoColor=white&labelColor=1a1a2e)](https://sql.js.org/)
[![Status](https://img.shields.io/badge/Status-Em_Desenvolvimento-ffd700?style=for-the-badge&labelColor=1a1a2e)]()

---

**Versão pública para testes:**  
https://rubenslyra.github.io/bet-ray-lab-cognitive-sandbox/

> **Simulação fictícia de apostas com viés educacional.**  
> Nenhum dinheiro real é envolvido. O objetivo é demonstrar, na prática,
> como probabilidade, perto-ganhos e fricções de saque afetam a tomada de decisão.

---

</div>

## 📋 Sobre

BET-RAY Lab é uma plataforma educativa que expõe o usuário a três experimentos
interativos de probabilidade. Cada experimento simula apostas fictícias com
parâmetros configuráveis, permitindo observar na prática conceitos como
**expectativa matemática**, **viés de quase-acerto** e **fricção de saque**.

### Experimentos

| Experimento              | Descrição                                      | Mecânica                               |
| ------------------------ | ---------------------------------------------- | -------------------------------------- |
| 🎰 **Giro dos símbolos** | Role 3 símbolos e tente acertar os três iguais | Sorteio com 3 rolos embaralhados       |
| ☕ **Medida do café**    | Preveja o nível que a jarra vai encher         | `rollOutcome` define acerto/quase/erro |
| 📊 **Quantos cabem?**    | Estime a capacidade de um pote                 | Análogo ao café com objetos visuais    |

---

## 🎲 Probabilidades e Auditoria

### Parâmetros padrão

Cada experimento possui três parâmetros ajustáveis em tempo real via interface:

| Parâmetro        | Padrão (symbols) | Padrão (coffee / capacity) | Descrição                        |
| ---------------- | ---------------- | -------------------------- | -------------------------------- |
| `winChance`      | **4%**           | **10%**                    | Probabilidade de acerto          |
| `nearMissChance` | **28%**          | **25%**                    | Probabilidade de quase-acerto    |
| `roundLimit`     | 20               | 15                         | Rodadas antes da pausa reflexiva |

A probabilidade de **perda** é calculada como:

```
P(loss) = 1 - winChance - nearMissChance
```

#### Tabela resumo (padrão)

<div align="center">

| Experimento  | 🟢 Vitória | 🟡 Quase | 🔴 Perda |
| ------------ | ---------- | -------- | -------- |
| **symbols**  | 4%         | 28%      | 68%      |
| **coffee**   | 10%        | 25%      | 65%      |
| **capacity** | 10%        | 25%      | 65%      |

</div>

### Código-fonte do sorteio e perfis

A lógica de decisão foi isolada em [`src/lib/lab-rules.ts`](src/lib/lab-rules.ts) para ser testável sem React, Zustand ou SQLite.

```typescript
decideRollOutcome({
  params,
  role,
  isPromoter,
  consecutiveLosses,
  pendingBatchWins,
  random,
});
```

O store em [`src/lib/lab-store.ts`](src/lib/lab-store.ts) coleta o estado atual, chama essa função e persiste os efeitos.

| Perfil efetivo                  | Regra aplicada                                   |
| ------------------------------- | ------------------------------------------------ |
| `admin-super` / `admin`         | Usa `winChance` e `nearMissChance` configuráveis |
| `promoter`                      | Perde até 3 rodadas consecutivas e ganha na 4ª   |
| Usuário comum com lote pendente | Consome vitórias pendentes do lote               |
| Usuário comum sem lote          | Perde por padrão, com `0,5%` de quase-acerto     |

Essa diferença é intencional no sandbox, mas precisa permanecer explícita para auditoria. O README antigo descrevia apenas o caminho probabilístico simples; a regra real atual é a matriz acima.

### Como auditar

| Método                              | Onde encontrar                                                                                                                               |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 🎛️ **Sliders de parâmetros**        | Painel "Parâmetros" abaixo de cada experimento — altera `winChance` e `nearMissChance` em tempo real                                         |
| 💾 **Presets**                      | Painel "Presets" — salva/carrega combinações de parâmetros com exibição de `P(win) / P(quase)`                                               |
| 📈 **Estatísticas por experimento** | Gráficos e contadores de `wins`, `nearMisses`, `losses`, `totalBet`, `totalPayout`                                                           |
| 📜 **Event ledger**                 | Toda aposta e resultado gera um evento (`APOSTA_FICTICIA`, `RESULTADO_SIMULADO`) com timestamp, experimento e valores — persistido em SQLite |
| 🗄️ **SQLite (WASM)**                | Todos os dados persistem no navegador via `sql.js`. Snapshots de parâmetros, estatísticas, eventos e fricções são armazenados e recuperáveis |
| 🔍 **Código aberto**                | Repositório completo disponível — qualquer auditor pode inspecionar `rollOutcome`, `registerResult` e a persistência                         |

### 🐛 Modo de depuração (symbols)

No experimento **Giro dos símbolos**, o atalho `Ctrl + Shift + G` ativa
um modo de garantia que substitui o sorteio probabilístico por um ciclo
fixo de **3 perdas seguidas + 1 vitória garantida**.

> ⚠️ **Aviso:** Este modo NÃO é transparente para o apostador e existe
> exclusivamente para testes. Quando desativado, o comportamento retorna
> ao `rollOutcome` padrão.

Ativação via console do navegador:

```js
window.__guaranteedWin(true); // ativa
window.__guaranteedWin(false); // desativa
window.__guaranteedWin(); // consulta estado
```

---

## 🧱 Stack

| Camada           | Tecnologia                                              |
| ---------------- | ------------------------------------------------------- |
| **Framework**    | [TanStack Start](https://tanstack.com/start) (React 19) |
| **Linguagem**    | TypeScript 5.8                                          |
| **Roteamento**   | TanStack Router (file-based)                            |
| **Estado**       | Zustand 5                                               |
| **Animação**     | Framer Motion 12                                        |
| **Gráficos**     | Recharts                                                |
| **Estilo**       | Tailwind CSS 4 + class-variance-authority               |
| **Persistência** | SQLite (sql.js via WASM)                                |
| **Áudio**        | HTMLAudio API                                           |
| **Build**        | Vite 7                                                  |

---

## 🚀 Começando

```bash
# Instalar dependências
bun install

# Servidor de desenvolvimento
bun run dev

# Build de produção comum
npm run build

# Build estático para GitHub Pages em docs/
npm run build:pages

# Preview do build
npm run preview

# Checks locais
npm run lint
npm run test
```

---

## 📁 Estrutura

```
src/
├── components/
│   ├── experiments/       # CoffeeExperiment, SymbolsExperiment, CapacityExperiment
│   ├── illustrations/     # Scene.svg components (GlassMug, CoffeePot, GlassJar)
│   ├── ExperimentControls.tsx  # Sliders de parâmetros
│   ├── ExperimentCharts.tsx    # Gráficos de resultado
│   ├── PresetManager.tsx       # Gerenciamento de presets
│   ├── CharacterReaction.tsx   # Personagem reativo
│   └── ...
├── lib/
│   ├── lab-rules.ts       # Regras puras testáveis (bônus e decisão de resultado)
│   ├── lab-store.ts       # Zustand store (estado, rollOutcome, registerResult, etc.)
│   ├── sqlite.ts          # Persistência SQLite (WASM)
│   └── audio-tracks.ts    # Roteamento de áudio
├── routes/                # Rotas TanStack
│   ├── index.tsx
│   ├── experiments/
│   │   ├── index.tsx
│   │   ├── coffee.tsx
│   │   ├── symbols.tsx
│   │   └── capacity.tsx
│   └── ...
└── ...
```

## 🌐 GitHub Pages

A pasta [`docs/`](docs/) é o artefato estático que o GitHub Pages deve servir. Para este repositório, o caminho público é:

```text
/bet-ray-lab-cognitive-sandbox/
```

Use sempre:

```bash
npm run build:pages
```

Esse comando:

1. compila o app com `VITE_BASE_PATH=/bet-ray-lab-cognitive-sandbox/`;
2. copia `dist/client` para `docs/`;
3. renderiza HTML SSR estático a partir de `dist/server/server.js`;
4. recria `docs/index.html` e `docs/404.html` com o estado de hidratação do TanStack Router;
5. mantém `docs/.nojekyll` para o GitHub Pages servir os arquivos estáticos sem processamento Jekyll.

Depois do build, os arquivos modificados em `docs/` precisam ser commitados e enviados para a branch configurada no Pages. Se a Action passar mas `docs/` não for atualizado na branch servida, a URL pública continuará exibindo o conteúdo antigo.

O repositório também inclui o workflow [pages.yml](.github/workflows/pages.yml), que roda testes, lint, `build:pages` e publica `docs/` com `actions/deploy-pages`.

Para usar esse fluxo:

1. vá em **Settings → Pages**;
2. em **Build and deployment**, selecione **Source: GitHub Actions**;
3. faça push para `main` ou rode **Deploy GitHub Pages** manualmente em **Actions**.

Se `https://rubenslyra.github.io/bet-ray-lab-cognitive-sandbox/` responder `404`, confira primeiro se o workflow `Deploy GitHub Pages` executou e se a configuração do Pages está em **GitHub Actions**. Se a origem estiver em “Deploy from a branch”, o GitHub pode ignorar o artefato enviado pelo workflow.

Para domínio próprio na raiz, use `VITE_BASE_PATH=/ npm run build && npm run pages:sync`.

## ✅ Testes e validação

Há uma suíte mínima com `node:test` em [`tests/`](tests/). Ela cobre:

- cálculo do bônus educacional;
- decisão probabilística para admin/admin-super;
- vitória garantida de promoter após três perdas;
- vitórias pendentes de lote;
- comportamento de usuário comum sem lote.

Comandos recomendados antes de publicar:

```bash
npm run lint
npm run test
npm run build:pages
```

---

## 🔒 Mecânica Interna da Banca

> ⚠️ **Documento restrito:** [`docs/REGRA_DA_BANCA.md`](docs/REGRA_DA_BANCA.md) descreve o
> funcionamento real do sistema de aposta, incluindo o sistema de lote para
> usuários comuns, a flag `promoter` com vitórias garantidas e o painel
> administrativo.

| Papel                  | Atalho / Acesso                          | Descrição                                    |
| ---------------------- | ---------------------------------------- | -------------------------------------------- |
| 🔐 **Admin-super**     | `Ctrl + Shift + A` + senha `admin-super` | Acesso total (`ti.rubens.lyra`)              |
| ⚙️ **Admin**           | Painel admin → Aba Usuários              | Privilégios administrativos                  |
| 💬 **Mediator**        | Painel admin → Aba Usuários              | Suporte e resposta a dúvidas                 |
| 👤 **Usuário**         | Padrão                                   | Sistema de lote: ~99,5% de perda entre lotes |
| ⭐ **Promoter** (flag) | Painel admin → Alternar estrela          | Vitória garantida a cada 4 apostas           |

---

## ⚖️ Aviso Legal

Este projeto é **estritamente educacional**. Nenhuma aposta envolve dinheiro real,
não há casa de apostas, e nenhum lucro ou prejuízo financeiro ocorre.
Todo saldo exibido é fictício e serve unicamente para fins pedagógicos.

---

<div align="center">

---

**BET-RAY Lab** — _Probabilidade não é sorte. Entenda os números._

</div>
