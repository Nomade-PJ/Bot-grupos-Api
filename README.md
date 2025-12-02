# 🤖 Valzinha VIP Bot - Gerenciamento de Grupos

Bot Telegram para gerenciamento de grupos VIP com sistema de assinaturas flexíveis (Semanal, Mensal, Trimestral) e pagamento via PIX.

[![Telegram](https://img.shields.io/badge/Bot-@Valzinhavip__bot-blue?logo=telegram)](https://t.me/Valzinhavip_bot)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)](https://nodejs.org/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?logo=supabase)](https://supabase.com/)

---

## 🎯 Funcionalidades

### 👥 Gerenciamento de Grupos
- ✅ Múltiplos grupos VIP
- ✅ Adição automática de membros
- ✅ Remoção automática ao vencer
- ✅ Avisos 3 dias antes do vencimento

### 💳 Sistema de Planos
- 📅 **Plano Semanal** - Teste por 7 dias
- 📆 **Plano Mensal** - Mais escolhido (30 dias)
- 🗓️ **Plano Trimestral** - Economize mais! (90 dias com desconto)

### 💰 Pagamento PIX
- 🔐 Geração automática de QR Code
- 📱 Copia e Cola
- 🤖 Análise automática de comprovante (OCR + IA)
- ⚡ Aprovação instantânea

### 🔄 Renovação Automática
- 🔔 Avisos de vencimento
- 💳 QR Code automático de renovação
- 📊 Histórico de assinaturas

---

## 📦 Instalação

### 1️⃣ Pré-requisitos
```bash
- Node.js 18+
- Conta no Supabase
- Bot criado no @BotFather
```

### 2️⃣ Clonar e Configurar
```bash
cd bot-grupos
npm install
```

### 3️⃣ Configurar Variáveis de Ambiente
Edite o arquivo `.env`:

```env
# Token do bot (obtido no @BotFather)
BOT_TOKEN=seu_token_aqui

# Supabase (mesmo projeto do bot principal)
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua_chave_anon_aqui

# IDs dos administradores
ADMIN_IDS=123456789,987654321

# Ambiente
NODE_ENV=development
```

### 4️⃣ Iniciar Bot
```bash
npm start
```

---

## 🗄️ Estrutura do Banco de Dados

O bot usa o **mesmo banco Supabase** do bot principal, com as seguintes tabelas:

### Tabela: `groups`
```sql
- id (UUID)
- group_id (BIGINT) -- ID do Telegram
- group_name (TEXT)
- group_link (TEXT)
- plans (JSONB) -- ⭐ NOVO: Array de planos
- is_active (BOOLEAN)
```

#### Exemplo de `plans`:
```json
[
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
```

### Tabela: `group_members`
```sql
- id (UUID)
- user_id (UUID FK)
- telegram_id (BIGINT)
- group_id (UUID FK)
- expires_at (TIMESTAMPTZ)
- status (TEXT) -- 'active', 'expired'
- transaction_id (UUID FK)
```

### Tabela: `transactions`
```sql
- id (UUID)
- txid (TEXT)
- user_id (UUID FK)
- telegram_id (BIGINT)
- group_id (UUID FK)
- amount (NUMERIC)
- pix_key (TEXT)
- pix_payload (TEXT)
- status (TEXT) -- 'pending', 'proof_sent', 'approved', 'rejected'
- proof_file_id (TEXT)
- ocr_result (JSONB)
- ocr_confidence (NUMERIC)
```

---

## 🔧 Estrutura de Arquivos

```
bot-grupos/
├── src/
│   ├── bot.js              # Bot principal
│   ├── database.js         # Funções do Supabase (reutilizado)
│   ├── plans.js            # ⭐ NOVO: Gerenciamento de planos
│   ├── subscriptions.js    # ⭐ NOVO: Lógica de assinaturas
│   ├── proofAnalyzer.js    # OCR + IA (reutilizado)
│   ├── pix/
│   │   └── manual.js       # Geração de PIX (reutilizado)
│   └── jobs/
│       └── groupControl.js # Verificação de expirações (reutilizado)
├── .env                    # Variáveis de ambiente
├── .gitignore
├── package.json
└── README.md
```

---

## 📱 Comandos do Bot

### Usuários
- `/start` - Iniciar bot e ver grupos
- `/grupos` - Ver grupos disponíveis
- `/assinaturas` - Ver suas assinaturas ativas
- `/suporte` - Contato com suporte

### Fluxo de Compra
```
1. /start
2. 👥 Ver Grupos Disponíveis
3. Escolher grupo
4. Escolher plano (Semanal/Mensal/Trimestral)
5. Pagar PIX
6. Enviar comprovante
7. ✅ Aprovação automática
8. Adicionado ao grupo!
```

---

## 🤖 Sistema de Aprovação Automática

O bot usa **OCR + IA** para analisar comprovantes automaticamente:

1. **Extração de dados** (OCR):
   - Valor pago
   - Chave PIX
   - Data/hora
   - Nome do pagador

2. **Validação** (IA):
   - Comparar valor esperado
   - Verificar chave PIX
   - Calcular confiança (%)

3. **Decisão**:
   - ✅ Confiança ≥ 70% → Aprovação automática
   - ⏳ Confiança < 70% → Revisão manual

---

## 🔄 Sistema de Renovação

### Avisos Automáticos
- **3 dias antes**: Aviso de vencimento com QR Code de renovação
- **No dia**: Se não pagou, remove do grupo
- **Após pagamento**: Adiciona novamente ao grupo

### Lógica
```javascript
// Verificação a cada 1 hora
setInterval(() => {
  checkExpirations(bot); // Verifica vencimentos
}, 60 * 60 * 1000);
```

---

## 🚀 Deploy

### Desenvolvimento (Local)
```bash
npm run dev
```

### Produção (Vercel/Railway/etc)
1. Configurar `WEBHOOK_DOMAIN` no `.env`
2. Fazer deploy
3. Bot usará webhook automaticamente

---

## 📊 Estatísticas

- ⚡ Aprovação automática: **70-90% dos pagamentos**
- 🕐 Tempo médio de aprovação: **< 10 segundos**
- 🔄 Taxa de renovação: **Alta (avisos automáticos)**

---

## 🆘 Suporte

- 💬 Telegram: [@suporte_valzinha](https://t.me/suporte_valzinha)
- 📱 WhatsApp: [(98) 98540-0784](https://wa.me/5598985400784)
- ⏰ Horário: 9h às 22h

---

## 📝 Licença

MIT License - Livre para uso e modificação

---

## 🔗 Links

- 🤖 Bot: [@Valzinhavip_bot](https://t.me/Valzinhavip_bot)
- 📱 Grupo Principal: [Privadinho da Val](https://t.me/+S3ZTnJaQ4Ho3ZTdh)
- 💾 Banco de Dados: [Supabase](https://supabase.com/)

---

**Desenvolvido com ❤️ por Carlos**

