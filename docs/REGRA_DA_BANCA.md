# 🏦 Regra da Banca — Mecânica Real do Sistema

```ascii
  ╔══════════════════════════════════════════════════════╗
  ║   DOCUMENTO INTERNO · ACESSO RESTRITO · ADMIN-SUPER  ║
  ╚══════════════════════════════════════════════════════╝
```

> **Propósito:** Este documento descreve o funcionamento real dos
> mecanismos de aposta por trás da interface educacional do Betario.
> O apostador comum NÃO tem acesso a estas informações.
>
> O sistema foi projetado para demonstrar, na prática, como a assimetria
> de informação entre operador e apostador cria uma vantagem estrutural
> insuperável para a banca.

---

## 1. Perfis de Usuário

| Papel | Acesso | Mecânica de resultado | Quem |
|---|---|---|---|
| `admin-super` | Painel administrativo completo | Probabilidade real configurável — seção 5 | `ti.rubens.lyra` |
| `admin` | Painel administrativo parcial | Probabilidade real configurável — seção 5 | Contratados com privilégios |
| `mediator` | Suporte e resposta a dúvidas | Sistema de lote (rigged) — seção 3 (igual user) | Contratados de suporte |
| `user` | Interface padrão | Sistema de lote (rigged) — seção 3 | Usuários comuns |

Além do papel, qualquer usuário pode ter a flag **`promoter`** ativada por um
`admin` ou `admin-super`, que concede vitória garantida a cada 4 apostas — seção 4.

### 1.1 Hierarquia

```
                  ┌──────────────┐
                  │ admin-super  │  ← ti.rubens.lyra (acesso total)
                  └──────┬───────┘
                         │
                  ┌──────▼───────┐
                  │    admin     │  ← Contratados (privilégios parciais)
                  └──────┬───────┘
                         │
                  ┌──────▼───────┐
                  │  mediator    │  ← Suporte (vê a verdade, sem poder)
                  └──────┬───────┘
                         │
                  ┌──────▼───────┐
                  │ user/promoter│  ← Apostadores
                  └──────────────┘
                         │
                    ┌────┴────┐
                    │         │
              promoter=true  promoter=false
              (vitória certa) (lote)
```

### 1.2 Seeders

O banco SQLite é semeado automaticamente na primeira inicialização com:

| ID | Username | Email | Papel | Promoter | Senha |
|---|---|---|---|---|---|
| `user_adm_001` | `ti.rubens.lyra` | `ti@betraylab.io` | `admin-super` | ❌ | `boss2024` |
| `user_adm_002` | `admin.alice` | `alice@betraylab.io` | `admin` | ❌ | `admin123` |
| `user_adm_003` | `admin.bob` | `bob@betraylab.io` | `admin` | ❌ | `admin123` |
| `user_med_001` | `mediator.carla` | `carla@betraylab.io` | `mediator` | ❌ | `suporte` |
| `user_med_002` | `mediator.david` | `david@betraylab.io` | `mediator` | ❌ | `suporte` |
| `user_001` | `joao.silva` | `joao@email.com` | `user` | ❌ | `123456` |
| `user_002` | `maria.santos` | `maria@email.com` | `user` | ❌ | `123456` |
| `user_003` | `pedro.oliveira` | `pedro@email.com` | `user` | ❌ | `123456` |
| `user_004` | `ana.lima` | `ana@email.com` | `user` | ❌ | `123456` |
| `user_005` | `lucas.fernandes` | `lucas@email.com` | `user` | ✅ | `123456` |

---

## 2. Fluxo da Aposta

```
Aposta (R$1)
    │
    ├──► registerBet()
    │       ├── Deduz R$1 do saldo do usuário
    │       ├── Adiciona R$1 ao fundo da banca (houseFunds)
    │       └── [user] Incrementa contadores de lote
    │
    ├──► Animação / Áudio (simulação de aleatoriedade)
    │
    ├──► rollOutcome()  ← decisão real, não aleatória
    │       ├── [user]      → lote (seção 3)
    │       ├── [promoter]  → vitória garantida (seção 4)
    │       └── [admin]     → parâmetro configurado (seção 5)
    │
    └──► registerResult()
            ├── Pagamento ao usuário (se houver)
            └── Deduz pagamento do fundo da banca
```

**Importante:** O resultado é determinado ANTES de qualquer animação.
As animações são meramente ilustrativas e não influenciam o resultado.

---

## 3. Sistema de Lote — Usuário Comum (`user`)

### 3.1 Gatilhos

O lote é liberado quando **qualquer** condição abaixo for atingida:

| Gatilho | Valor | Descrição |
|---|---|---|
| 🔢 Contagem de apostas | **10.001** | Número total de apostas desde o último lote |
| 💰 Receita acumulada | **R$ 1.999.999,00** | Valor total apostado desde o último lote |

Com apostas de R$ 1,00, o gatilho de **contagem** (10.001 apostas)
é sempre atingido primeiro.

### 3.2 Liberação do Lote

Quando um gatilho é atingido, a banca **pode** liberar um lote de vitórias.
A decisão considera:

- **Probabilidade base de liberação**: 60% (aumenta conforme o excesso
  sobre o limiar)
- **Margem de segurança**: a banca nunca libera mais que 0,7% da receita
  total acumulada

### 3.3 Distribuição

```
Receita total no momento do gatilho: R$ X
  ├── Pool de prêmios: 0,7% × X = R$ P
  └── Número de vencedores: N = aleatório(1, 3)
        └── Prêmio por vencedor: R$ P / N
```

| Variável | Regra |
|---|---|
| `X` | Receita total da banca no instante do gatilho |
| `P` | `0,007 × X` (nunca excede 0,7% da arrecadação) |
| `N` | `Math.floor(Math.random() × 3) + 1` (1 a 3 vencedores) |
| Prêmio por vencedor | `Math.floor(P / N)` (arredondado para baixo) |

### 3.4 Algoritmo de Sorteio (para um único usuário local)

Como o ambiente é single‑user, o sistema simula múltiplos apostadores
para decidir se o usuário real está entre os sorteados:

1. Gera `N` identidades virtuais de apostadores
2. Sorteia aleatoriamente quais posições serão vencedoras
3. Se o usuário real for sorteado → `rollOutcome` retorna `"win"`
4. Caso contrário → `rollOutcome` retorna `"loss"`

Em uma implementação multiusuário, os `N` vencedores seriam selecionados
diretamente da base de usuários ativos.

### 3.5 Comportamento Padrão (entre lotes)

Entre os lotes, a experiência do usuário comum é:

| Resultado | Probabilidade real | Efeito no usuário |
|---|---|---|
| `loss` | ~99,5% | Perde a aposta |
| `near-miss` | ~0,5% | Quase acerto — estimula a continuar |
| `win` | 0% (exceto lotes) | Não ocorre fora dos lotes |

O `near-miss` (quase acerto) é propositalmente calibrado para ser raro
o suficiente para não gerar payout, mas frequente o bastante para manter
o engajamento emocional.

---

## 4. Flag Promoter

### 4.1 Concessão

Apenas `admin-super` ou `admin` podem conceder ou revogar a flag `promoter`
a qualquer usuário, independentemente do papel.

### 4.2 Mecânica

```
A cada 4 apostas:
  ┌── 1ª: loss
  ├── 2ª: loss
  ├── 3ª: loss
  └── 4ª: WIN (garantido)
```

O ciclo recomeça imediatamente após a 4ª aposta.

### 4.3 Finalidade

O perfil `promoter` simula o comportamento de influenciadores ou
apostadores "sorteudos" que a banca utiliza para:

- Criar a percepção de que é possível ganhar
- Servir de exemplo social para outros usuários
- Aumentar a credibilidade do sistema

**O promoter nunca perde por mais de 3 rodadas seguidas.**

---

## 5. Perfis Admin‑Super e Admin

### 5.1 Ativação

Acesso exclusivo via atalho de teclado, protegido por confirmação:

```
Ctrl + Shift + A  →  toca o modo admin-super
```

A confirmação exige que o operador digite a senha `admin-super`.

### 5.2 Comportamento

Quando `admin-super` ou `admin` está ativo como perfil de sessão,
`rollOutcome` respeita fielmente os parâmetros configurados (`winChance`
e `nearMissChance`) sem qualquer interferência do sistema de lote ou
garantia.

O administrador vê a **probabilidade real e bruta** da configuração atual.

### 5.3 Painel Administrativo

O painel fornece três abas:

**Visão geral:**
- **Fundo da banca** (`houseFunds`) — saldo real acumulado
- **Receita total** — soma de todas as apostas
- **Total de apostas** — contagem geral
- **Progresso do lote** — barras de contagem × receita
- **Próximo lote** — quantas apostas / receita até o próximo gatilho
- **Vencedores pendentes** — quantos `win` ainda serão liberados no lote atual
- **Gatilho manual de lote** — libera um lote imediatamente (para demonstração)
- **Estatísticas brutas** — winChance real `vs` winChance percebida
- **Consecutive losses** — contador de derrotas seguidas (para promoter)

**Usuários:**
- Lista completa de todos os usuários do banco SQLite
- Alternância de usuário ativo (botão "Usar este perfil")
- Alteração de papel (`admin-super`, `admin`, `mediator`, `user`) via dropdown
- Ativação/desativação da flag `promoter` (estrela)

**Sessão:**
- Override temporário de perfil (não persiste no banco)
- Alternância entre `user`, `promoter` e `admin-super` para teste rápido
- Descrição da mecânica atual

---

## 6. Fundo da Banca (`houseFunds`)

### 6.1 Contabilidade

```
houseFunds = Σ(apostas) - Σ(pagamentos)
```

Onde:

- `Σ(apostas)` = total de R$ 1,00 por aposta, acumulado em `registerBet`
- `Σ(pagamentos)` = total pago em vitórias, desacumulado em `registerResult`

### 6.2 Crescimento Esperado

Para cada R$ 1,00 apostado:

| Perfil | Retorno médio ao usuário | Lucro da banca |
|---|---|---|
| `user` | ~R$ 0,007 por lote (0,7% da receita) | ~R$ 0,993 por aposta |
| `promoter` | R$ 5,00 a cada 4 apostas (R$ 1,25/aposta) | Prejuízo (perde R$ 0,25/aposta) |
| `admin-super` | Depende dos parâmetros configurados | Variável |

**A banca nunca perde dinheiro no perfil `user`.**

---

## 7. Controles de Engajamento

Além da mecânica de resultados, o sistema emprega:

| Tática | Implementação | Efeito |
|---|---|---|
| **Quase-acerto** | `near-miss` calibrado em ~0,5% entre lotes | Sensação de "quase ganhou" |
| **Pausa reflexiva** | Modal a cada 10 rodadas | Falsa sensação de controle |
| **Bônus fracionado** | Bônus não-sacável em depósitos < R$ 50 | Infla saldo visual sem valor real |
| **Fricção de saque** | Bloqueios e alertas ao tentar sacar | Dificulta a retirada de fundos |
| **Gráficos de resultado** | Recharts com histórico | Viés de confirmação visual |

---

## 8. Regras de Acesso por Papel

Cada papel tem um perímetro de acesso diferente dentro do sistema.
A porta de entrada é sempre o atalho `Ctrl + Shift + A` com a senha
`admin-super`, mas o que cada um vê dentro depende do `currentUser.role`.

| Papel | Painel admin | Visão geral | Aba Usuários | Aba Sessão | `rollOutcome` |
|---|---|---|---|---|---|
| `admin-super` | ✅ Completo | ✅ Fundo + lotes + parâmetros + stats | ✅ Total (altera qualquer papel, toggle promoter) | ✅ Override de perfil | Probabilidade real |
| `admin` | ✅ Limitado | ✅ Vê tudo, **não pode** gatilho manual de lote | ✅ Gerencia usuários, **não pode** alterar `admin-super` | ✅ Override de perfil | Probabilidade real |
| `mediator` | 🟡 Suporte | ✅ Vê saldo da banca e lista de usuários | ✅ Visualiza, **não pode** alterar papéis nem promoter | ❌ Bloqueado | Sistema de lote |
| `user` | ❌ Bloqueado | — | — | — | Sistema de lote |

### 8.1 Admin‑super (`ti.rubens.lyra`)

Acesso irrestrito. Pode:
- Ver o fundo da banca, receita total, progresso do lote
- Gatilho manual de lote
- Alterar papel de qualquer usuário
- Ativar/desativar promoter em qualquer usuário
- Fazer override de sessão para testar outros perfis
- Ver a probabilidade real nos experimentos

### 8.2 Admin

Acesso administrativo com restrições:
- Vê todas as métricas da banca
- **Não pode** acionar o gatilho manual de lote
- Gerencia usuários, **não pode** alterar o papel de `admin-super`
- Pode fazer override de sessão
- Vê a probabilidade real nos experimentos

### 8.3 Mediator

Acesso de suporte:
- Vê o saldo da banca e lista de usuários (para identificar e ajudar)
- **Não pode** alterar papéis nem toggle promoter
- **Não pode** fazer override de sessão
- Experimentos funcionam como `user` (sistema de lote)

### 8.4 User

Sem acesso administrativo:
- Interface padrão de apostas
- Sistema de lote (~99,5% de perda entre lotes)
- `Ctrl + Shift + A` exibe "Acesso negado"

---

## 9. Evidências no Código

| Mecanismo | Arquivo | Linhas |
|---|---|---|
| `rollOutcome` com discriminação de perfil | `src/lib/lab-store.ts` | ~296–340 |
| `registerBet` — incremento de `houseFunds` e contadores de lote | `src/lib/lab-store.ts` | ~271–294 |
| `registerResult` — dedução do fundo da banca | `src/lib/lab-store.ts` | ~304–354 |
| Painel administrativo | `src/components/AdminPanel.tsx` | — |
| Atalho de ativação `Ctrl+Shift+A` | `src/components/AppShell.tsx` | — |
| `window.__guaranteedWin` — compatibilidade | `src/lib/lab-store.ts` | — |

---

> ⚠️ **Nota final:** Este documento descreve o comportamento real do sistema.
> Nenhuma aposta envolve dinheiro real. O Betario é uma ferramenta
> educacional para demonstrar os mecanismos de probabilidade e viés cognitivo
> presentes em sistemas de aposta. Todo saldo exibido é fictício.
>
> *"O jogo mais justo é aquele que você não joga."*
