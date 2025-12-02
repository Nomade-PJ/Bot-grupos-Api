# 📊 ANÁLISE COMPLETA: Sistema de Grupos e Novo Bot

## 🎯 1. COMO FUNCIONA O "PRIVADINHO DA VAL" ATUALMENTE

### 📋 Dados do Grupo no Banco
```
Nome: Privadinho da Val 🛐🔞
ID: -1003479868247
Link: https://t.me/+S3ZTnJaQ4Ho3ZTdh
Preço: R$ 59,90/mês
Dias: 30 dias
Status: Ativo ✅
```

### 🔄 FLUXO COMPLETO DE FUNCIONAMENTO

#### 1️⃣ **CADASTRO DO GRUPO (Painel Admin)**
```
/admin → 👥 Grupos → ➕ Novo Grupo

Passo a passo:
1. Admin informa o ID do grupo (-1003479868247)
2. Define o nome ("Privadinho da Val 🛐🔞")
3. Cola o link de convite (https://t.me/+S3ZTnJaQ4Ho3ZTdh)
4. Define o preço (R$ 59,90)
5. Define a duração (30 dias)
6. Grupo é salvo na tabela `groups`
```

**Código responsável:** `src/admin.js` (linhas 1020-1140)

---

#### 2️⃣ **COMPRA DA ASSINATURA (Usuário Final)**

**Passo 1: Cliente clica no botão no /start**
```javascript
// O bot mostra automaticamente todos os grupos ativos:
buttons.push([Markup.button.callback("Privadinho da Val 🛐🔞", "subscribe:-1003479868247")]);
```

**Passo 2: Geração do QR Code PIX**
```javascript
// Código em: src/bot.js (linhas 1167-1297)

1. Sistema busca dados do grupo no banco
2. Gera QR Code PIX com o valor (R$ 59,90)
3. Cria TXID único (ex: M12345678ABCD)
4. Salva transação no banco com:
   - status: 'pending'
   - group_id: [ID do grupo]
   - amount: 59.90
   - telegram_id: [ID do usuário]
```

**Passo 3: Envio do Comprovante**
```
Cliente envia foto/documento do comprovante
↓
Sistema analisa automaticamente com OCR (IA)
↓
Se aprovação automática: adiciona ao grupo
Se manual: admin aprova em /admin → ⏳ Pendentes
```

---

#### 3️⃣ **ADIÇÃO AO GRUPO (Automática ou Manual)**

**Aprovação Automática (OCR IA)**
```javascript
// Código em: src/bot.js (linhas 910-943)

1. IA analisa comprovante (confiança > 70%)
2. Valida valor (R$ 59,90)
3. Adiciona usuário ao grupo via Telegram API:
   bot.telegram.unbanChatMember(group.group_id, userId)
4. Salva na tabela `group_members`:
   - telegram_id
   - group_id
   - expires_at: hoje + 30 dias
   - status: 'active'
5. Envia mensagem:
   "✅ PAGAMENTO APROVADO AUTOMATICAMENTE!
   👥 Grupo: Privadinho da Val
   📅 Acesso válido por: 30 dias
   🔗 Link: https://t.me/+..."
```

**Aprovação Manual (Admin)**
```javascript
// Código em: src/admin.js (linhas 2495-2675)

Admin em /admin → ⏳ Pendentes
↓
Clica em "✅ Aprovar"
↓
Sistema faz o mesmo processo acima
```

---

#### 4️⃣ **GERENCIAMENTO AUTOMÁTICO DE MEMBROS**

**Sistema de Avisos e Remoções**
```javascript
// Código em: src/groupControl.js (linhas 6-345)
// Job executado AUTOMATICAMENTE a cada 1 hora

📅 3 DIAS ANTES DO VENCIMENTO:
- Sistema envia mensagem:
  "⏰ ASSINATURA EXPIRANDO EM 3 DIAS!
   Renove agora para não perder acesso!"
- Gera QR Code automático de renovação

⏰ NO DIA DO VENCIMENTO:
- Verifica se tem pagamento pendente
- SE TEM: aguarda aprovação
- SE NÃO TEM: REMOVE DO GRUPO
  → bot.telegram.banChatMember()
  → bot.telegram.unbanChatMember()
- Atualiza status na tabela: 'expired'
```

**Renovação**
```
Cliente paga novamente
↓
Sistema detecta renovação via group_id
↓
Adiciona mais 30 dias no expires_at
↓
Adiciona novamente ao grupo
```

---

## 💾 2. ESTRUTURA DO BANCO DE DADOS

### Tabela: `groups`
```sql
CREATE TABLE groups (
  id UUID PRIMARY KEY,
  group_id BIGINT UNIQUE,           -- ID do Telegram (-1003479868247)
  group_name TEXT,                   -- "Privadinho da Val 🛐🔞"
  group_link TEXT,                   -- Link de convite
  subscription_price NUMERIC,        -- 59.90
  subscription_days INTEGER,         -- 30
  is_active BOOLEAN,                 -- true/false
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### Tabela: `group_members`
```sql
CREATE TABLE group_members (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  telegram_id BIGINT,                -- ID Telegram do usuário
  group_id UUID REFERENCES groups(id), -- FK para groups
  joined_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,            -- Data de expiração
  status TEXT,                        -- 'active', 'expired'
  reminded_at TIMESTAMPTZ,           -- Quando foi enviado aviso
  transaction_id UUID,               -- FK para transactions
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### Tabela: `transactions`
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  txid TEXT UNIQUE,
  user_id UUID REFERENCES users(id),
  telegram_id BIGINT,
  product_id TEXT,                   -- Para produtos normais
  group_id UUID REFERENCES groups(id), -- Para assinaturas de grupo
  amount NUMERIC,
  pix_key TEXT,
  pix_payload TEXT,
  status TEXT,                        -- 'pending', 'approved', 'rejected'
  proof_file_id TEXT,
  proof_received_at TIMESTAMPTZ,
  validated_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  ocr_result JSONB,
  ocr_confidence NUMERIC,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

---

## 🚀 3. PROPOSTA: NOVO BOT PARA GRUPOS (Planos Flexíveis)

### 🎯 OBJETIVO
Criar um **bot separado** focado EXCLUSIVAMENTE em gerenciamento de grupos com:
- ✅ Planos: Semanal, Mensal, Trimestral
- ✅ Múltiplos grupos
- ✅ Sistema de pagamento PIX (reutilizado)
- ✅ Mesmo banco de dados Supabase
- ✅ Gerenciamento automático de membros

---

## 📁 4. ARQUITETURA DO NOVO BOT

### 🗂️ Estrutura de Diretórios
```
bot-grupos/
├── src/
│   ├── bot.js              # Bot principal
│   ├── database.js         # Funções do Supabase (REUTILIZADO)
│   ├── pix/
│   │   └── manual.js       # Geração PIX (REUTILIZADO)
│   ├── plans.js            # Novo: Gerenciamento de planos
│   ├── groups.js           # Novo: CRUD de grupos
│   ├── subscriptions.js    # Novo: Lógica de assinaturas
│   └── jobs/
│       └── checkExpiration.js # Monitoramento (REUTILIZADO)
├── .env
├── package.json
└── README.md
```

---

## 🆕 5. NOVAS FUNCIONALIDADES

### 📊 Sistema de Planos

#### Modificar Tabela `groups`
```sql
-- Adicionar campos para planos múltiplos
ALTER TABLE groups ADD COLUMN plans JSONB DEFAULT '[
  {
    "type": "weekly",
    "name": "Semanal",
    "days": 7,
    "price": 19.90
  },
  {
    "type": "monthly",
    "name": "Mensal",
    "days": 30,
    "price": 59.90
  },
  {
    "type": "quarterly",
    "name": "Trimestral",
    "days": 90,
    "price": 149.90,
    "discount_percentage": 15
  }
]'::jsonb;
```

#### Exemplo de Grupo com Múltiplos Planos
```json
{
  "id": "uuid...",
  "group_id": -1003479868247,
  "group_name": "Privadinho da Val 🛐🔞",
  "group_link": "https://t.me/+S3ZTnJaQ4Ho3ZTdh",
  "is_active": true,
  "plans": [
    {
      "type": "weekly",
      "name": "📅 Semanal",
      "days": 7,
      "price": 19.90
    },
    {
      "type": "monthly",
      "name": "📆 Mensal",
      "days": 30,
      "price": 59.90
    },
    {
      "type": "quarterly",
      "name": "🗓️ Trimestral",
      "days": 90,
      "price": 149.90,
      "discount_percentage": 15,
      "badge": "🔥 MAIS POPULAR"
    }
  ]
}
```

---

### 🎨 Fluxo do Usuário no Novo Bot

```
/start
↓
👥 Grupos Disponíveis:

┌─────────────────────────────┐
│ 🔥 Privadinho da Val 🛐🔞  │
│ Conteúdo exclusivo +18      │
│                             │
│ 📅 Semanal: R$ 19,90       │
│ 📆 Mensal: R$ 59,90        │
│ 🗓️ Trimestral: R$ 149,90  │
│    (Economize 15%!)         │
│                             │
│ [🎯 Assinar Agora]         │
└─────────────────────────────┘

┌─────────────────────────────┐
│ 💎 VIP Premium              │
│ Conteúdo premium exclusivo  │
│                             │
│ 📅 Semanal: R$ 29,90       │
│ 📆 Mensal: R$ 89,90        │
│ 🗓️ Trimestral: R$ 229,90  │
│                             │
│ [🎯 Assinar Agora]         │
└─────────────────────────────┘
```

**Cliente clica em "Assinar Agora":**
```
Escolha seu plano:

[📅 Semanal - R$ 19,90]
7 dias de acesso

[📆 Mensal - R$ 59,90]
30 dias de acesso

[🗓️ Trimestral - R$ 149,90] 🔥
90 dias de acesso
💰 Economize R$ 30 (15% OFF)
```

**Cliente escolhe plano:**
```
✅ Plano selecionado: Mensal

💰 Valor: R$ 59,90
📅 Duração: 30 dias

🔐 Gerando QR Code PIX...

[QR CODE APARECE]

📋 Copia e Cola:
00020126580014br.gov.bcb.pix...

💳 Após pagar, envie o comprovante aqui!
```

---

## 🔧 6. CÓDIGO DO NOVO BOT (Principais Trechos)

### `src/plans.js` (NOVO)
```javascript
const db = require('./database');

/**
 * Busca todos os planos de um grupo
 */
async function getGroupPlans(groupId) {
  const { data, error } = await db.supabase
    .from('groups')
    .select('plans')
    .eq('group_id', groupId)
    .single();
  
  if (error) throw error;
  return data.plans || [];
}

/**
 * Calcula preço com base no plano
 */
function calculatePrice(plans, planType) {
  const plan = plans.find(p => p.type === planType);
  if (!plan) throw new Error('Plano não encontrado');
  
  return {
    price: plan.price,
    days: plan.days,
    name: plan.name,
    discount: plan.discount_percentage || 0
  };
}

module.exports = {
  getGroupPlans,
  calculatePrice
};
```

### `src/subscriptions.js` (NOVO)
```javascript
const { Markup } = require('telegraf');
const db = require('./database');
const manualPix = require('./pix/manual');
const plans = require('./plans');

/**
 * Mostra opções de planos para um grupo
 */
async function showGroupPlans(ctx, groupId) {
  // Buscar grupo
  const group = await db.getGroupByTelegramId(groupId);
  if (!group) {
    return ctx.reply('❌ Grupo não encontrado.');
  }
  
  // Buscar planos
  const groupPlans = await plans.getGroupPlans(groupId);
  
  // Montar mensagem
  let message = `👥 *${group.group_name}*\n\n`;
  message += `📝 ${group.description || 'Acesso exclusivo ao grupo'}\n\n`;
  message += `🎯 *Escolha seu plano:*\n\n`;
  
  const buttons = [];
  
  for (const plan of groupPlans) {
    const emoji = plan.type === 'weekly' ? '📅' : plan.type === 'monthly' ? '📆' : '🗓️';
    const badge = plan.badge ? ` ${plan.badge}` : '';
    const discount = plan.discount_percentage 
      ? ` (💰 ${plan.discount_percentage}% OFF)` 
      : '';
    
    message += `${emoji} *${plan.name}*${badge}\n`;
    message += `💰 R$ ${plan.price.toFixed(2)}${discount}\n`;
    message += `📅 ${plan.days} dias de acesso\n\n`;
    
    buttons.push([
      Markup.button.callback(
        `${emoji} ${plan.name} - R$ ${plan.price.toFixed(2)}`,
        `subscribe_plan:${groupId}:${plan.type}`
      )
    ]);
  }
  
  buttons.push([Markup.button.callback('⬅️ Voltar', 'back_to_groups')]);
  
  return ctx.reply(message, {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard(buttons)
  });
}

/**
 * Processa assinatura de um plano
 */
async function subscribeToPlan(ctx, groupId, planType) {
  const userId = ctx.from.id;
  
  // Buscar grupo e plano
  const group = await db.getGroupByTelegramId(groupId);
  const groupPlans = await plans.getGroupPlans(groupId);
  const selectedPlan = groupPlans.find(p => p.type === planType);
  
  if (!selectedPlan) {
    return ctx.reply('❌ Plano não encontrado.');
  }
  
  // Gerar PIX
  const { charge } = await manualPix.createManualCharge({
    amount: selectedPlan.price.toFixed(2)
  });
  
  // Salvar transação
  const user = await db.getOrCreateUser(ctx.from);
  await db.createTransaction({
    telegramId: userId,
    userId: user.id,
    groupId: group.id,
    amount: selectedPlan.price,
    pixKey: charge.key,
    pixPayload: charge.copiaCola,
    planType: selectedPlan.type,  // NOVO: salvar tipo de plano
    planDays: selectedPlan.days   // NOVO: salvar duração
  });
  
  // Enviar QR Code
  const message = `✅ *Plano selecionado: ${selectedPlan.name}*\n\n` +
    `👥 *Grupo:* ${group.group_name}\n` +
    `💰 *Valor:* R$ ${selectedPlan.price.toFixed(2)}\n` +
    `📅 *Duração:* ${selectedPlan.days} dias\n\n` +
    `🔐 *Escaneie o QR Code:*`;
  
  await ctx.replyWithPhoto(
    { source: charge.qrcodeBuffer },
    { caption: message, parse_mode: 'Markdown' }
  );
  
  await ctx.reply(
    `📋 *Ou use o Copia e Cola:*\n\n` +
    `\`${charge.copiaCola}\`\n\n` +
    `💳 *Após pagar, envie o comprovante aqui!*\n` +
    `🆔 TXID: ${charge.txid}`,
    { parse_mode: 'Markdown' }
  );
}

module.exports = {
  showGroupPlans,
  subscribeToPlan
};
```

---

## 🔄 7. MODIFICAÇÕES NO BANCO DE DADOS

### 1️⃣ Adicionar campo `plans` na tabela `groups`
```sql
ALTER TABLE groups ADD COLUMN IF NOT EXISTS plans JSONB DEFAULT '[]'::jsonb;
```

### 2️⃣ Adicionar campos na tabela `transactions`
```sql
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS plan_type TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS plan_days INTEGER;
```

### 3️⃣ Atualizar grupo existente com planos
```sql
UPDATE groups 
SET plans = '[
  {
    "type": "weekly",
    "name": "📅 Semanal",
    "days": 7,
    "price": 19.90
  },
  {
    "type": "monthly",
    "name": "📆 Mensal",
    "days": 30,
    "price": 59.90
  },
  {
    "type": "quarterly",
    "name": "🗓️ Trimestral",
    "days": 90,
    "price": 149.90,
    "discount_percentage": 15,
    "badge": "🔥 MAIS POPULAR"
  }
]'::jsonb
WHERE group_id = -1003479868247;
```

---

## ✅ 8. RESUMO: O QUE PODE SER REUTILIZADO

### ✅ PODE REUTILIZAR 100%
```
✅ src/pix/manual.js         - Geração de QR Code PIX
✅ src/database.js            - Todas as funções do banco
✅ src/proofAnalyzer.js       - OCR automático
✅ src/jobs/expireTransactions.js - Limpeza de pendentes
✅ src/groupControl.js        - Gerenciamento de expiração (adaptar)
✅ Banco de dados Supabase    - Mesmo projeto
```

### 🆕 PRECISA CRIAR
```
🆕 bot-grupos/src/bot.js      - Bot principal (novo)
🆕 bot-grupos/src/plans.js    - Gerenciamento de planos
🆕 bot-grupos/src/subscriptions.js - Lógica de assinaturas
🆕 bot-grupos/src/groups.js   - CRUD simplificado de grupos
🆕 bot-grupos/.env            - Token do novo bot
```

---

## 🚀 9. VANTAGENS DESSA ABORDAGEM

✅ **Mesmo banco de dados**: Não duplica informações
✅ **Código reutilizado**: Economiza tempo
✅ **PIX funcional**: Já testado e aprovado
✅ **OCR mantido**: Aprovação automática
✅ **Fácil manutenção**: Estrutura separada
✅ **Escalável**: Adicionar novos grupos é simples

---

## 📋 10. PRÓXIMOS PASSOS

### Opção A: Adicionar Planos ao Bot Atual
```
✅ Rápido de implementar
✅ Tudo em um lugar
⚠️ Bot fica mais complexo
```

### Opção B: Criar Novo Bot Separado (RECOMENDADO)
```
✅ Código organizado
✅ Manutenção fácil
✅ Escalável
⚠️ Precisa criar novo bot no @BotFather
⚠️ Precisa configurar novo token
```

---

## 🤔 QUAL OPÇÃO VOCÊ PREFERE?

**1️⃣ Adicionar planos ao bot atual**
- Mais rápido
- Tudo integrado

**2️⃣ Criar novo bot separado**
- Mais organizado
- Melhor para crescimento

**Me diga sua escolha e eu começo a implementar agora!** 🚀

