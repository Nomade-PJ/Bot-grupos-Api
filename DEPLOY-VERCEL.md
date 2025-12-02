# 🚀 DEPLOY NA VERCEL - Bot de Grupos

## 📋 Passos para Deploy

### 1️⃣ Conectar Repositório na Vercel

1. Acesse: https://vercel.com/dashboard
2. Clique em "Add New Project"
3. Importe o repositório: `Nomade-PJ/Bot-grupos-Api`
4. Clique em "Import"

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
1. No projeto na Vercel, vá em "Settings"
2. Clique em "Environment Variables"
3. Adicione cada variável acima
4. Clique em "Save"

---

### 3️⃣ Configurar Build Settings

**Framework Preset:** Other
**Build Command:** (deixe vazio)
**Output Directory:** (deixe vazio)
**Install Command:** `npm install`

**Root Directory:** (deixe como está, raiz do projeto)

---

### 4️⃣ Deploy

1. Clique em "Deploy"
2. Aguarde o build completar
3. Copie a URL gerada (ex: `bot-grupos-api.vercel.app`)

---

### 5️⃣ Configurar Webhook no Telegram

Após o deploy, configure o webhook:

**URL do Webhook:**
```
https://seu-projeto.vercel.app/webhook-telegram
```

**Configurar via Browser:**
```
https://api.telegram.org/bot7745607430:AAG50YYIMbZ8FPzkQDGO8CBSIDK1-CcnFT0/setWebhook?url=https://seu-projeto.vercel.app/webhook-telegram
```

**Ou via PowerShell:**
```powershell
$token = "7745607430:AAG50YYIMbZ8FPzkQDGO8CBSIDK1-CcnFT0"
$url = "https://seu-projeto.vercel.app/webhook-telegram"
Invoke-WebRequest -Uri "https://api.telegram.org/bot$token/setWebhook?url=$url"
```

**Ou via CMD:**
```cmd
curl "https://api.telegram.org/bot7745607430:AAG50YYIMbZ8FPzkQDGO8CBSIDK1-CcnFT0/setWebhook?url=https://seu-projeto.vercel.app/webhook-telegram"
```

---

### 6️⃣ Verificar Webhook

Verifique se o webhook foi configurado:

```
https://api.telegram.org/bot7745607430:AAG50YYIMbZ8FPzkQDGO8CBSIDK1-CcnFT0/getWebhookInfo
```

Deve retornar:
```json
{
  "ok": true,
  "result": {
    "url": "https://seu-projeto.vercel.app/webhook-telegram",
    "has_custom_certificate": false,
    "pending_update_count": 0
  }
}
```

---

### 7️⃣ Testar o Bot

1. Abra o Telegram
2. Procure: `@Valzinhavip_bot`
3. Envie: `/start`
4. Deve funcionar! 🎉

---

## 📊 Estrutura do Deploy

```
bot-grupos/
├── api/
│   └── telegram-webhook.js  ← Endpoint do webhook
├── src/
│   ├── bot.js
│   ├── database.js
│   └── ...
├── vercel.json              ← Configuração Vercel
└── package.json
```

**Rota configurada:**
- `/webhook-telegram` → `api/telegram-webhook.js`

---

## ✅ Checklist de Deploy

- [ ] Repositório conectado na Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] Build completado com sucesso
- [ ] URL do projeto copiada
- [ ] Webhook configurado no Telegram
- [ ] Webhook verificado (getWebhookInfo)
- [ ] Bot testado no Telegram

---

## 🆘 Problemas Comuns

### ❌ Build falha
**Solução:** Verifique se todas as dependências estão no `package.json`

### ❌ Webhook não recebe mensagens
**Solução:** 
1. Verifique se a URL está correta
2. Verifique os logs da Vercel
3. Teste a URL manualmente no browser

### ❌ Erro "BOT_TOKEN não configurado"
**Solução:** Verifique se adicionou todas as variáveis de ambiente na Vercel

### ❌ Erro ao conectar no Supabase
**Solução:** Verifique `SUPABASE_URL` e `SUPABASE_ANON_KEY`

---

## 📝 Logs da Vercel

Para ver logs em tempo real:

1. Acesse o projeto na Vercel
2. Clique em "Deployments"
3. Clique no último deployment
4. Clique em "Functions"
5. Clique em "telegram-webhook"
6. Veja os logs em tempo real

---

## 🔄 Atualizações Futuras

Sempre que fizer push para o GitHub:

```bash
git add .
git commit -m "Atualização"
git push origin main
```

A Vercel **automaticamente** fará um novo deploy!

---

**🚀 Deploy concluído! Bot funcionando na Vercel!**

