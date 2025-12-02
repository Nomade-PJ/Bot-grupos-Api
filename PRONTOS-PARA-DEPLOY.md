# ✅ PRONTO PARA DEPLOY NA VERCEL!

## 🎉 Repositório Criado e Enviado!

**Repositório:** https://github.com/Nomade-PJ/Bot-grupos-Api

---

## 📊 O QUE FOI ENVIADO

### ✅ Arquivos Principais
- ✅ `api/telegram-webhook.js` - Webhook handler para Vercel
- ✅ `src/bot.js` - Lógica principal do bot
- ✅ `src/plans.js` - Sistema de planos
- ✅ `src/subscriptions.js` - Lógica de assinaturas
- ✅ `src/database.js` - Conexão com Supabase
- ✅ `src/pix/manual.js` - Geração de PIX
- ✅ `vercel.json` - Configuração Vercel

### ✅ Documentação
- ✅ `README.md` - Documentação completa
- ✅ `DEPLOY-VERCEL.md` - Guia de deploy
- ✅ `COMO-USAR.md` - Guia de uso
- ✅ `STATUS.md` - Status do projeto

### ✅ Utilitários
- ✅ `package.json` - Dependências
- ✅ `.gitignore` - Arquivos ignorados
- ✅ `instalar.bat` - Script de instalação
- ✅ `iniciar.bat` - Script de inicialização

---

## 🚀 PRÓXIMOS PASSOS PARA DEPLOY

### 1️⃣ Conectar na Vercel

1. Acesse: https://vercel.com/dashboard
2. Clique em **"Add New Project"**
3. Importe: `Nomade-PJ/Bot-grupos-Api`
4. Clique em **"Import"**

---

### 2️⃣ Configurar Variáveis de Ambiente

Na Vercel, adicione estas variáveis:

```
BOT_TOKEN=7745607430:AAG50YYIMbZ8FPzkQDGO8CBSIDK1-CcnFT0

SUPABASE_URL=https://quiguiyvbtgyqurocawk.supabase.co

SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1aWd1aXl2YnRneXF1cm9jYXdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI0NzEwMzgsImV4cCI6MjA0ODA0NzAzOH0.GqDSsyRrj_Sc-EGbjJAFST-sXrZhkusPM5Kt4L9hOvE

ADMIN_IDS=7147424680,6668959779

NODE_ENV=production
```

**Como adicionar:**
- Settings → Environment Variables → Add New
- Adicione cada uma das variáveis acima
- Clique em "Save"

---

### 3️⃣ Configurar Build

**Framework Preset:** Other
**Build Command:** (deixe vazio)
**Output Directory:** (deixe vazio)
**Install Command:** `npm install`
**Root Directory:** (raiz)

---

### 4️⃣ Deploy

1. Clique em **"Deploy"**
2. Aguarde o build (1-2 minutos)
3. Copie a **URL gerada** (ex: `bot-grupos-api-xxxxx.vercel.app`)

---

### 5️⃣ Configurar Webhook

Após o deploy, configure o webhook do Telegram:

**URL do Webhook:**
```
https://SUA-URL-VERCEL.vercel.app/webhook-telegram
```

**Configurar via Browser:**
Cole no navegador:
```
https://api.telegram.org/bot7745607430:AAG50YYIMbZ8FPzkQDGO8CBSIDK1-CcnFT0/setWebhook?url=https://SUA-URL-VERCEL.vercel.app/webhook-telegram
```

**Substitua:** `SUA-URL-VERCEL` pela URL que a Vercel gerou!

---

### 6️⃣ Verificar Webhook

Verifique se foi configurado:

```
https://api.telegram.org/bot7745607430:AAG50YYIMbZ8FPzkQDGO8CBSIDK1-CcnFT0/getWebhookInfo
```

Deve retornar:
```json
{
  "ok": true,
  "result": {
    "url": "https://sua-url.vercel.app/webhook-telegram",
    "has_custom_certificate": false,
    "pending_update_count": 0
  }
}
```

---

### 7️⃣ Testar o Bot

1. Abra o Telegram
2. Procure: **@Valzinhavip_bot**
3. Envie: `/start`
4. Deve aparecer o menu! 🎉

---

## ✅ CHECKLIST FINAL

- [x] ✅ Repositório criado no GitHub
- [x] ✅ Código enviado para o GitHub
- [x] ✅ Arquivos de deploy configurados
- [ ] ⏳ Conectar repositório na Vercel
- [ ] ⏳ Adicionar variáveis de ambiente
- [ ] ⏳ Fazer deploy
- [ ] ⏳ Configurar webhook
- [ ] ⏳ Testar bot

---

## 📝 ESTRUTURA DO PROJETO

```
Bot-grupos-Api/
├── api/
│   └── telegram-webhook.js  ← Webhook endpoint
├── src/
│   ├── bot.js               ← Lógica principal
│   ├── plans.js             ← Planos flexíveis
│   ├── subscriptions.js     ← Assinaturas
│   ├── database.js          ← Supabase
│   ├── pix/
│   │   └── manual.js        ← Geração PIX
│   └── jobs/
│       └── groupControl.js  ← Expirações
├── vercel.json              ← Config Vercel
├── package.json
└── README.md
```

---

## 🆘 PROBLEMAS?

### Build falha?
- Verifique se todas as variáveis foram adicionadas
- Veja os logs na Vercel (Deployments → Logs)

### Webhook não funciona?
- Verifique se a URL está correta
- Veja logs em: Vercel → Functions → telegram-webhook → Logs

### Bot não responde?
- Verifique getWebhookInfo
- Veja logs da Vercel em tempo real

---

## 🔄 ATUALIZAÇÕES FUTURAS

Sempre que fizer mudanças:

```bash
cd bot-grupos
git add .
git commit -m "Descrição da mudança"
git push origin main
```

A Vercel **fará deploy automático**! 🚀

---

## 📚 DOCUMENTAÇÃO COMPLETA

Veja o arquivo `DEPLOY-VERCEL.md` para instruções detalhadas!

---

**🎉 TUDO PRONTO! SÓ FALTA O DEPLOY NA VERCEL! 🚀**

**Repositório:** https://github.com/Nomade-PJ/Bot-grupos-Api

