# 🚨 DIAGNÓSTICO URGENTE - BOT NÃO RESPONDE

## ❌ PROBLEMA
- Bot não responde ao `/start`
- Não aparecem logs na Vercel
- Webhook não está sendo chamado

---

## ✅ VERIFICAÇÕES IMEDIATAS

### 1️⃣ VERIFICAR SE WEBHOOK ESTÁ CONFIGURADO

Cole no navegador:
```
https://api.telegram.org/bot7745607430:AAG50YYIMbZ8FPzkQDGO8CBSIDK1-CcnFT0/getWebhookInfo
```

**O que deve aparecer:**
```json
{
  "ok": true,
  "result": {
    "url": "https://bot-grupos-api.vercel.app/webhook-telegram",
    "pending_update_count": 0
  }
}
```

**Se aparecer `"url": ""`:**
- Webhook NÃO está configurado
- Vá para o passo 2

---

### 2️⃣ CONFIGURAR WEBHOOK

**SUA URL DA VERCEL É:**
```
bot-grupos-api.vercel.app
```

**Cole no navegador (COMPLETO):**
```
https://api.telegram.org/bot7745607430:AAG50YYIMbZ8FPzkQDGO8CBSIDK1-CcnFT0/setWebhook?url=https://bot-grupos-api.vercel.app/webhook-telegram
```

**Deve retornar:**
```json
{"ok": true, "result": true, "description": "Webhook was set"}
```

---

### 3️⃣ TESTAR URL DO WEBHOOK MANUALMENTE

Acesse no navegador:
```
https://bot-grupos-api.vercel.app/webhook-telegram
```

**Resultado:**
- Se aparecer erro ou página em branco → FUNÇÃO EXISTE ✅
- Se aparecer 404 → FUNÇÃO NÃO FOI DEPLOYADA ❌

---

### 4️⃣ VERIFICAR DEPLOY NA VERCEL

1. Acesse: https://vercel.com/dashboard
2. Vá em: **bot-grupos-api**
3. Clique em: **Deployments**
4. Verifique o **último deployment**:
   - ✅ Verde = Deploy OK
   - ❌ Vermelho = Deploy falhou

**Se falhou:**
- Clique no deployment
- Veja os **logs do build**
- Me mostre os erros

---

### 5️⃣ VERIFICAR VARIÁVEIS DE AMBIENTE

Na Vercel:

1. Vá em: **Settings** → **Environment Variables**
2. Verifique se TODAS existem:
   - ✅ `BOT_TOKEN`
   - ✅ `SUPABASE_URL`
   - ✅ `SUPABASE_ANON_KEY`
   - ✅ `ADMIN_IDS`
   - ✅ `NODE_ENV`

**Se faltar alguma:**
- Adicione
- Faça **novo deploy**

---

### 6️⃣ TESTAR ENDPOINT DE TESTE

Acesse no navegador:
```
https://bot-grupos-api.vercel.app/api/test
```

**Deve aparecer:**
```json
{
  "ok": true,
  "message": "Endpoint de teste funcionando!",
  "timestamp": "..."
}
```

**Se aparecer:**
- ✅ Endpoint funciona = Vercel está OK
- ❌ Erro 404 = Função não existe

---

## 🔍 CHECKLIST COMPLETO

- [ ] Webhook está configurado? (`getWebhookInfo`)
- [ ] URL do webhook está correta?
- [ ] Deploy na Vercel foi bem-sucedido?
- [ ] Variáveis de ambiente estão todas configuradas?
- [ ] Endpoint de teste funciona?
- [ ] Logs aparecem quando envio `/start`?

---

## 📝 O QUE VOCÊ DEVE FAZER AGORA

1. **Cole este comando no navegador:**
```
https://api.telegram.org/bot7745607430:AAG50YYIMbZ8FPzkQDGO8CBSIDK1-CcnFT0/getWebhookInfo
```

2. **Me diga o que apareceu:**
   - URL está vazia?
   - URL está errada?
   - URL está correta?

3. **Acesse o endpoint de teste:**
```
https://bot-grupos-api.vercel.app/api/test
```

4. **Me diga:**
   - Apareceu JSON?
   - Apareceu erro 404?
   - Outro erro?

---

**🚨 COM ESSAS INFORMAÇÕES VOU RESOLVER O PROBLEMA AGORA!**

