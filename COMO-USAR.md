# 🚀 COMO USAR O BOT DE GRUPOS

## 📋 Passos para Iniciar

### 1️⃣ Instalar Dependências

**Windows:**
```
Clique duas vezes em: instalar.bat
```

**Linux/Mac:**
```bash
npm install
```

---

### 2️⃣ Configurar .env

O arquivo `.env` já está configurado com:
```
✅ BOT_TOKEN (do @Valzinhavip_bot)
✅ SUPABASE_URL
✅ SUPABASE_ANON_KEY
✅ ADMIN_IDS
```

**Não precisa alterar nada!**

---

### 3️⃣ Iniciar o Bot

**Windows:**
```
Clique duas vezes em: iniciar.bat
```

**Linux/Mac:**
```bash
npm start
```

---

## ✅ Verificar se está Funcionando

1. Abra o Telegram
2. Procure: `@Valzinhavip_bot`
3. Envie `/start`
4. Deve aparecer:
   ```
   👋 Olá!
   Bem-vindo ao Valzinha VIP Bot! 🔥
   
   [👥 Ver Grupos Disponíveis]
   [📋 Minhas Assinaturas]
   [💬 Suporte]
   ```

---

## 🔧 Adicionar Novo Grupo

### Via SQL (Supabase):

```sql
-- 1. Cadastrar grupo
INSERT INTO groups (group_id, group_name, group_link, is_active, plans)
VALUES (
  -1001234567890,  -- ID do seu grupo (obtém com /getid no grupo)
  'Nome do Grupo VIP',
  'https://t.me/joinchat/XXXXXXX',
  true,
  '[
    {
      "type": "weekly",
      "name": "📅 Semanal",
      "days": 7,
      "price": 29.90
    },
    {
      "type": "monthly",
      "name": "📆 Mensal",
      "days": 30,
      "price": 89.90
    },
    {
      "type": "quarterly",
      "name": "🗓️ Trimestral",
      "days": 90,
      "price": 229.90,
      "discount_percentage": 15,
      "badge": "🔥 MAIS VENDIDO"
    }
  ]'::jsonb
);
```

### Como obter o ID do grupo:

1. Adicione o bot `@userinfobot` no grupo
2. Ele enviará o ID do grupo (ex: `-1001234567890`)
3. Use esse ID no SQL acima

---

## 📊 Monitorar o Bot

### Ver Logs:
```
O bot mostra logs em tempo real no terminal:

✅ [BOT] Iniciado com sucesso!
👤 [START] Usuário 123456 iniciou o bot
📸 [PROOF] Comprovante recebido de 123456
✅ [AUTO-APPROVE] Transação aprovada
```

### Ver Transações no Supabase:
```sql
SELECT 
  txid,
  amount,
  status,
  created_at
FROM transactions
ORDER BY created_at DESC
LIMIT 10;
```

### Ver Membros Ativos:
```sql
SELECT 
  gm.telegram_id,
  u.first_name,
  g.group_name,
  gm.expires_at
FROM group_members gm
JOIN users u ON u.id = gm.user_id
JOIN groups g ON g.id = gm.group_id
WHERE gm.status = 'active'
ORDER BY gm.expires_at ASC;
```

---

## 🎯 Fluxo Completo

```
Cliente:
1. /start no @Valzinhavip_bot
2. Clica em "👥 Ver Grupos Disponíveis"
3. Escolhe "Privadinho da Val 🛐🔞"
4. Vê os planos:
   📅 Semanal - R$ 19,90
   📆 Mensal - R$ 59,90
   🗓️ Trimestral - R$ 149,90
5. Escolhe o plano
6. Recebe QR Code PIX
7. Paga
8. Envia comprovante (foto)
9. ✅ Bot analisa automaticamente
10. ✅ Cliente é adicionado ao grupo!

Bot:
1. Gera PIX único
2. Salva transação no banco
3. Aguarda comprovante
4. Analisa com OCR + IA
5. Se confiança ≥ 70%:
   → Aprova automaticamente
   → Adiciona ao grupo
   → Notifica cliente
6. Se confiança < 70%:
   → Envia para revisão manual
```

---

## ⚠️ Resolução de Problemas

### Bot não inicia:
```
❌ [SUPABASE] Erro de conexão

Solução: Verificar .env
- SUPABASE_URL correto?
- SUPABASE_ANON_KEY correto?
```

### Bot não adiciona ao grupo:
```
❌ Erro ao adicionar ao grupo

Solução: 
1. Bot precisa ser admin do grupo
2. Bot precisa ter permissão de "Add Members"
3. Grupo precisa permitir adicionar membros
```

### PIX não gera:
```
❌ Chave PIX não configurada

Solução:
Executar no Supabase:
INSERT INTO settings (key, value)
VALUES ('pix_key', 'sua_chave_pix_aqui')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
```

---

## 📞 Suporte

Problemas? Entre em contato:

- 💬 Telegram: @suporte_valzinha
- 📱 WhatsApp: (98) 98540-0784
- 📧 Email: suporte@valzinha.com

---

**Bot pronto para uso! 🚀**

