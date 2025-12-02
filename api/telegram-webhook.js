// api/telegram-webhook.js
// Webhook handler para Vercel Serverless Functions

const { Telegraf, Markup } = require('telegraf');
const db = require('../src/database');
const subscriptions = require('../src/subscriptions');
const proofAnalyzer = require('../src/proofAnalyzer');
const { checkExpirations } = require('../src/jobs/groupControl');

// Validar variáveis de ambiente
if (!process.env.BOT_TOKEN) {
  console.error('❌ BOT_TOKEN não configurado');
  throw new Error('BOT_TOKEN não configurado');
}

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error('❌ Supabase não configurado');
  throw new Error('Supabase não configurado');
}

const bot = new Telegraf(process.env.BOT_TOKEN);

// Inicializar sessões globais (mantém entre requisições no Vercel)
global._PLAN_SESSIONS = global._PLAN_SESSIONS || {};

console.log('🤖 [WEBHOOK] Valzinha VIP Bot iniciado');

// ===== COMANDOS =====

bot.start(async (ctx) => {
  try {
    const userId = ctx.from.id;
    const user = await db.getOrCreateUser(ctx.from);
    
    console.log(`👤 [START] Usuário ${userId} iniciou o bot`);
    
    const message = `👋 *Olá, ${ctx.from.first_name}!*\n\n` +
      `Bem-vindo ao *Valzinha VIP Bot*! 🔥\n\n` +
      `Aqui você pode assinar grupos exclusivos com planos flexíveis:\n\n` +
      `📅 *Semanal* - Teste por 7 dias\n` +
      `📆 *Mensal* - O mais escolhido\n` +
      `🗓️ *Trimestral* - Economize mais!\n\n` +
      `Escolha uma opção abaixo:`;
    
    const buttons = [
      [{ text: '👥 Ver Grupos Disponíveis', callback_data: 'show_all_groups' }],
      [{ text: '📋 Minhas Assinaturas', callback_data: 'my_subscriptions' }],
      [{ text: '💬 Suporte', callback_data: 'support' }]
    ];
    
    return ctx.reply(message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: buttons
      }
    });
  } catch (err) {
    console.error('❌ [START] Erro:', err);
    return ctx.reply('❌ Erro ao iniciar. Tente novamente.');
  }
});

bot.command('assinaturas', async (ctx) => {
  return subscriptions.showMySubscriptions(ctx);
});

bot.command('grupos', async (ctx) => {
  return subscriptions.showGroupsList(ctx);
});

bot.command('suporte', (ctx) => {
  return ctx.reply(
    '💬 *SUPORTE*\n\n' +
    'Entre em contato com nosso suporte:\n\n' +
    '📱 WhatsApp: [Clique aqui](https://wa.me/5598985400784)\n' +
    '💬 Telegram: @suporte_valzinha\n\n' +
    '⏰ Horário de atendimento: 9h às 22h',
    { parse_mode: 'Markdown' }
  );
});

// ===== CALLBACKS =====

bot.action('show_all_groups', (ctx) => {
  ctx.answerCbQuery('📋 Carregando grupos...');
  return subscriptions.showGroupsList(ctx);
});

bot.action('my_subscriptions', (ctx) => {
  ctx.answerCbQuery('📋 Carregando suas assinaturas...');
  return subscriptions.showMySubscriptions(ctx);
});

bot.action('support', (ctx) => {
  ctx.answerCbQuery('💬 Suporte');
  return ctx.reply(
    '💬 *SUPORTE*\n\n' +
    'Entre em contato:\n\n' +
    '📱 WhatsApp: [Clique aqui](https://wa.me/5598985400784)\n' +
    '💬 Telegram: @suporte_valzinha\n\n' +
    '⏰ Horário: 9h às 22h',
    { parse_mode: 'Markdown' }
  );
});

bot.action(/^show_plans:(.+)$/, (ctx) => {
  const groupId = ctx.match[1];
  return subscriptions.showGroupPlans(ctx, groupId);
});

bot.action(/^subscribe:(.+):(.+)$/, (ctx) => {
  const groupId = ctx.match[1];
  const planType = ctx.match[2];
  return subscriptions.subscribeToPlan(ctx, groupId, planType);
});

bot.action('back_to_groups', (ctx) => {
  ctx.answerCbQuery('⬅️ Voltando...');
  return subscriptions.showGroupsList(ctx);
});

// ===== RECEBIMENTO DE COMPROVANTE =====

bot.on(['photo', 'document'], async (ctx) => {
  try {
    const userId = ctx.from.id;
    
    console.log(`📸 [PROOF] Comprovante recebido de ${userId}`);
    
    // Buscar transação pendente mais recente
    const { data: transactions, error } = await db.supabase
      .from('transactions')
      .select('*')
      .eq('telegram_id', userId)
      .eq('status', 'pending')
      .is('proof_file_id', null)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) throw error;
    
    if (!transactions || transactions.length === 0) {
      return ctx.reply(
        '⚠️ *Nenhuma transação pendente encontrada.*\n\n' +
        'Para fazer uma compra, use /start e escolha um grupo!',
        { parse_mode: 'Markdown' }
      );
    }
    
    const transaction = transactions[0];
    
    // Obter file_id
    let fileId, fileType;
    if (ctx.message.photo) {
      fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
      fileType = 'photo';
    } else if (ctx.message.document) {
      fileId = ctx.message.document.file_id;
      fileType = 'document';
    }
    
    // Atualizar transação com comprovante
    const { error: updateError } = await db.supabase
      .from('transactions')
      .update({
        proof_file_id: fileId,
        proof_received_at: new Date().toISOString(),
        status: 'proof_sent'
      })
      .eq('id', transaction.id);
    
    if (updateError) throw updateError;
    
    await ctx.reply(
      '✅ *Comprovante recebido!*\n\n' +
      '🔍 Analisando automaticamente...\n\n' +
      '⏱️ Aguarde alguns segundos.',
      { parse_mode: 'Markdown' }
    );
    
    // Tentar análise automática (em background)
    setImmediate(async () => {
      try {
        const analysis = await proofAnalyzer.analyzeProof(fileId, fileType, transaction.amount);
        
        if (analysis.approved && analysis.confidence >= 70) {
          // APROVAR AUTOMATICAMENTE
          console.log(`✅ [AUTO-APPROVE] Transação ${transaction.txid} aprovada automaticamente (${analysis.confidence}%)`);
          
          // Buscar grupo e plano
          const { data: group } = await db.supabase
            .from('groups')
            .select('*')
            .eq('id', transaction.group_id)
            .single();
          
          const planSession = global._PLAN_SESSIONS[transaction.txid];
          
          if (group && planSession) {
            // Adicionar ao grupo
            await db.addGroupMember({
              telegramId: userId,
              userId: transaction.user_id,
              groupId: group.id,
              days: planSession.planDays
            });
            
            // Atualizar transação
            await db.supabase
              .from('transactions')
              .update({
                status: 'approved',
                validated_at: new Date().toISOString(),
                delivered_at: new Date().toISOString()
              })
              .eq('id', transaction.id);
            
            // Notificar usuário
            await ctx.telegram.sendMessage(
              userId,
              `✅ *PAGAMENTO APROVADO AUTOMATICAMENTE!*\n\n` +
              `🤖 Análise de IA: ${analysis.confidence}% de confiança\n` +
              `💰 Valor confirmado: R$ ${analysis.details.amount || transaction.amount}\n\n` +
              `👥 *Grupo:* ${group.group_name}\n` +
              `📅 *Plano:* ${planSession.planName} (${planSession.planDays} dias)\n` +
              `🔗 *Link:* ${group.group_link}\n\n` +
              `✅ Você foi adicionado ao grupo!\n` +
              `Clique no link acima para entrar.\n\n` +
              `🆔 TXID: ${transaction.txid}`,
              { parse_mode: 'Markdown' }
            );
            
            // Limpar sessão
            delete global._PLAN_SESSIONS[transaction.txid];
          }
        } else {
          // Enviar para aprovação manual
          console.log(`⏳ [MANUAL-REVIEW] Transação ${transaction.txid} precisa de revisão manual`);
          
          await ctx.reply(
            '⏳ *Comprovante em análise manual*\n\n' +
            `🔍 Confiança da IA: ${analysis.confidence}%\n\n` +
            'Um administrador irá revisar seu pagamento em breve.\n' +
            'Você será notificado assim que for aprovado!',
            { parse_mode: 'Markdown' }
          );
        }
      } catch (analyzeErr) {
        console.error('❌ [AUTO-ANALYSIS] Erro:', analyzeErr);
        
        await ctx.reply(
          '⏳ *Comprovante recebido!*\n\n' +
          'Seu pagamento será analisado manualmente por um administrador.\n' +
          'Você será notificado assim que for aprovado!',
          { parse_mode: 'Markdown' }
        );
      }
    });
    
  } catch (err) {
    console.error('❌ [PROOF] Erro:', err);
    return ctx.reply('❌ Erro ao processar comprovante. Tente novamente.');
  }
});

// ===== ERROS =====

bot.catch((err, ctx) => {
  console.error('❌ [BOT-ERROR]', err);
  ctx.reply('❌ Ocorreu um erro. Por favor, tente novamente.').catch(() => {});
});

// ===== EXPORT PARA VERCEL =====

module.exports = async (req, res) => {
  try {
    // Aceitar apenas POST
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
    
    console.log('📥 [WEBHOOK] Update recebido do Telegram');
    console.log(`📋 [WEBHOOK] Update ID: ${req.body?.update_id || 'N/A'}`);
    
    if (req.body?.message) {
      console.log(`👤 [WEBHOOK] From: ${req.body.message.from?.id} (@${req.body.message.from?.username || 'N/A'})`);
      console.log(`📝 [WEBHOOK] Text: ${req.body.message.text || 'N/A'}`);
    }
    
    // Processar update do Telegram
    try {
      await bot.handleUpdate(req.body);
      console.log('✅ [WEBHOOK] Update processado com sucesso');
    } catch (updateError) {
      console.error('❌ [WEBHOOK] Erro ao processar update:', updateError);
      // Não retornar erro para não quebrar o webhook
    }
    
    // Resposta rápida para o Telegram
    return res.status(200).json({ ok: true });
    
  } catch (err) {
    console.error('❌ [WEBHOOK] Erro crítico:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Iniciar job de verificação de expirações (a cada hora)
if (!global._EXPIRATION_JOB_STARTED) {
  global._EXPIRATION_JOB_STARTED = true;
  
  setInterval(async () => {
    try {
      console.log('🔍 [JOB] Verificando expirações...');
      await checkExpirations(bot);
    } catch (err) {
      console.error('❌ [JOB] Erro ao verificar expirações:', err);
    }
  }, 60 * 60 * 1000); // 1 hora
  
  // Primeira verificação após 5 segundos
  setTimeout(async () => {
    try {
      console.log('🔍 [JOB] Primeira verificação de expirações...');
      await checkExpirations(bot);
    } catch (err) {
      console.error('❌ [JOB] Erro:', err);
    }
  }, 5000);
}

