// api/telegram-webhook.js
// Webhook handler FINAL - Versão completa e otimizada

require('dotenv').config();

const { Telegraf, Markup } = require('telegraf');

// Validar variáveis de ambiente
if (!process.env.BOT_TOKEN) {
  console.error('❌ BOT_TOKEN não configurado');
}

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error('❌ Supabase não configurado');
}

// Importar módulos
let db, subscriptions, proofAnalyzer, checkExpirations;

try {
  db = require('../src/database');
  subscriptions = require('../src/subscriptions');
  proofAnalyzer = require('../src/proofAnalyzer');
  const groupControl = require('../src/jobs/groupControl');
  checkExpirations = groupControl.checkExpirations;
  console.log('✅ [WEBHOOK] Módulos carregados com sucesso');
} catch (err) {
  console.error('❌ [WEBHOOK] Erro ao carregar módulos:', err.message);
}

// Criar instância do bot
const bot = new Telegraf(process.env.BOT_TOKEN || '');

// Inicializar sessões globais
global._PLAN_SESSIONS = global._PLAN_SESSIONS || {};

console.log('🤖 [WEBHOOK] Valzinha VIP Bot inicializado');

// ===== COMANDO /start =====

bot.start(async (ctx) => {
  try {
    console.log(`👤 [START] Usuário ${ctx.from.id} iniciou o bot`);
    
    const userId = ctx.from.id;
    const firstName = ctx.from.first_name || 'usuário';
    
    // Tentar criar usuário em background (não bloquear resposta)
    if (db && db.getOrCreateUser) {
      setImmediate(async () => {
        try {
          // Timeout de 3 segundos para não travar
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 3000)
          );
          
          await Promise.race([
            db.getOrCreateUser(ctx.from),
            timeoutPromise
          ]);
          console.log('✅ [START] Usuário criado/atualizado no banco');
        } catch (userErr) {
          console.error('⚠️ [START] Erro ao criar usuário (não crítico):', userErr.message);
          // Não é crítico, continuar
        }
      });
    }
    
    // ENVIAR MENSAGEM IMEDIATAMENTE (não esperar banco)
    const message = `👋 *Olá, ${firstName}!*\n\n` +
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
    
    const sentMessage = await ctx.reply(message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: buttons
      }
    });
    
    console.log('✅ [START] Mensagem enviada com sucesso!');
    return sentMessage;
    
  } catch (err) {
    console.error('❌ [START] Erro completo:', err);
    console.error('Stack:', err.stack);
    
    // Fallback simples - SEMPRE enviar algo
    try {
      const fallbackMessage = await ctx.reply(
        '👋 Olá! Bem-vindo ao Valzinha VIP Bot! 🔥\n\n' +
        'Use os botões abaixo para navegar:\n\n' +
        '👥 Ver Grupos\n' +
        '📋 Minhas Assinaturas\n' +
        '💬 Suporte',
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: '👥 Ver Grupos Disponíveis', callback_data: 'show_all_groups' }],
              [{ text: '📋 Minhas Assinaturas', callback_data: 'my_subscriptions' }],
              [{ text: '💬 Suporte', callback_data: 'support' }]
            ]
          }
        }
      );
      console.log('✅ [START] Mensagem fallback enviada');
      return fallbackMessage;
    } catch (fallbackErr) {
      console.error('❌ [START] Erro até no fallback:', fallbackErr);
      // Última tentativa - mensagem sem formatação
      try {
        return await ctx.reply('👋 Olá! Bem-vindo ao Valzinha VIP Bot! 🔥');
      } catch (finalErr) {
        console.error('❌ [START] Erro final:', finalErr);
      }
    }
  }
});

// ===== OUTROS COMANDOS =====

bot.command('assinaturas', async (ctx) => {
  try {
    if (subscriptions && subscriptions.showMySubscriptions) {
      return await subscriptions.showMySubscriptions(ctx);
    }
    return await ctx.reply('❌ Função temporariamente indisponível.');
  } catch (err) {
    console.error('❌ [ASSINATURAS] Erro:', err);
    return await ctx.reply('❌ Erro ao carregar assinaturas.');
  }
});

bot.command('grupos', async (ctx) => {
  try {
    if (subscriptions && subscriptions.showGroupsList) {
      return await subscriptions.showGroupsList(ctx);
    }
    return await ctx.reply('❌ Função temporariamente indisponível.');
  } catch (err) {
    console.error('❌ [GRUPOS] Erro:', err);
    return await ctx.reply('❌ Erro ao carregar grupos.');
  }
});

bot.command('suporte', async (ctx) => {
  return await ctx.reply(
    '💬 *SUPORTE*\n\n' +
    'Entre em contato com nosso suporte:\n\n' +
    '📱 WhatsApp: [Clique aqui](https://wa.me/5598985400784)\n' +
    '💬 Telegram: @suporte_valzinha\n\n' +
    '⏰ Horário de atendimento: 9h às 22h',
    { parse_mode: 'Markdown' }
  );
});

// ===== CALLBACKS =====

bot.action('show_all_groups', async (ctx) => {
  try {
    await ctx.answerCbQuery('📋 Carregando grupos...');
    if (subscriptions && subscriptions.showGroupsList) {
      return await subscriptions.showGroupsList(ctx);
    }
    return await ctx.reply('❌ Grupos temporariamente indisponíveis.');
  } catch (err) {
    console.error('❌ [SHOW_GROUPS] Erro:', err);
    await ctx.answerCbQuery('❌ Erro ao carregar grupos');
  }
});

bot.action('my_subscriptions', async (ctx) => {
  try {
    await ctx.answerCbQuery('📋 Carregando suas assinaturas...');
    if (subscriptions && subscriptions.showMySubscriptions) {
      return await subscriptions.showMySubscriptions(ctx);
    }
    return await ctx.reply('❌ Assinaturas temporariamente indisponíveis.');
  } catch (err) {
    console.error('❌ [MY_SUBSCRIPTIONS] Erro:', err);
    await ctx.answerCbQuery('❌ Erro ao carregar assinaturas');
  }
});

bot.action('support', async (ctx) => {
  await ctx.answerCbQuery('💬 Suporte');
  return await ctx.reply(
    '💬 *SUPORTE*\n\n' +
    'Entre em contato:\n\n' +
    '📱 WhatsApp: [Clique aqui](https://wa.me/5598985400784)\n' +
    '💬 Telegram: @suporte_valzinha\n\n' +
    '⏰ Horário: 9h às 22h',
    { parse_mode: 'Markdown' }
  );
});

bot.action(/^show_plans:(.+)$/, async (ctx) => {
  try {
    const groupId = ctx.match[1];
    if (subscriptions && subscriptions.showGroupPlans) {
      return await subscriptions.showGroupPlans(ctx, groupId);
    }
    return await ctx.reply('❌ Planos temporariamente indisponíveis.');
  } catch (err) {
    console.error('❌ [SHOW_PLANS] Erro:', err);
    await ctx.answerCbQuery('❌ Erro ao carregar planos');
  }
});

bot.action(/^subscribe:(.+):(.+)$/, async (ctx) => {
  try {
    const groupId = ctx.match[1];
    const planType = ctx.match[2];
    if (subscriptions && subscriptions.subscribeToPlan) {
      return await subscriptions.subscribeToPlan(ctx, groupId, planType);
    }
    return await ctx.reply('❌ Assinatura temporariamente indisponível.');
  } catch (err) {
    console.error('❌ [SUBSCRIBE] Erro:', err);
    await ctx.answerCbQuery('❌ Erro ao processar assinatura');
  }
});

bot.action('back_to_groups', async (ctx) => {
  await ctx.answerCbQuery('⬅️ Voltando...');
  if (subscriptions && subscriptions.showGroupsList) {
    return await subscriptions.showGroupsList(ctx);
  }
  return await ctx.reply('❌ Grupos temporariamente indisponíveis.');
});

// ===== RECEBIMENTO DE COMPROVANTE =====

bot.on(['photo', 'document'], async (ctx) => {
  try {
    const userId = ctx.from.id;
    console.log(`📸 [PROOF] Comprovante recebido de ${userId}`);
    
    if (!db || !db.supabase) {
      return await ctx.reply('❌ Sistema temporariamente indisponível.');
    }
    
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
      return await ctx.reply(
        '⚠️ *Nenhuma transação pendente encontrada.*\n\n' +
        'Para fazer uma compra, use /start e escolha um grupo!',
        { parse_mode: 'Markdown' }
      );
    }
    
    // Processar comprovante (versão simplificada por enquanto)
    return await ctx.reply(
      '✅ *Comprovante recebido!*\n\n' +
      'Seu pagamento será analisado em breve.\n' +
      'Você será notificado assim que for aprovado!',
      { parse_mode: 'Markdown' }
    );
  } catch (err) {
    console.error('❌ [PROOF] Erro:', err);
    return await ctx.reply('❌ Erro ao processar comprovante. Tente novamente.');
  }
});

// ===== ERROS =====

bot.catch((err, ctx) => {
  console.error('❌ [BOT-ERROR]', err);
  console.error('Stack:', err.stack);
  ctx.reply('❌ Ocorreu um erro. Por favor, tente novamente.').catch(() => {});
});

// ===== EXPORT PARA VERCEL =====

module.exports = async (req, res) => {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📥 [WEBHOOK] Requisição recebida');
    console.log(`📋 [WEBHOOK] Method: ${req.method}`);
    console.log(`📋 [WEBHOOK] Update ID: ${req.body?.update_id || 'N/A'}`);
    
    // Aceitar apenas POST
    if (req.method !== 'POST') {
      console.log('⚠️ [WEBHOOK] Método não permitido:', req.method);
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
    
    if (!req.body) {
      console.error('❌ [WEBHOOK] Body vazio');
      return res.status(400).json({ error: 'Bad Request' });
    }
    
    if (req.body.message) {
      console.log(`👤 [WEBHOOK] From: ${req.body.message.from?.id} (@${req.body.message.from?.username || 'N/A'})`);
      console.log(`📝 [WEBHOOK] Text: ${req.body.message.text || 'N/A'}`);
    }
    
    if (req.body.callback_query) {
      console.log(`🖱️ [WEBHOOK] Callback: ${req.body.callback_query.data}`);
    }
    
    // Responder ao Telegram PRIMEIRO (importante!)
    res.status(200).json({ ok: true });
    
    // Processar update em background
    setImmediate(async () => {
      try {
        console.log('⚙️ [WEBHOOK] Processando update...');
        await bot.handleUpdate(req.body);
        console.log('✅ [WEBHOOK] Update processado com sucesso');
      } catch (updateError) {
        console.error('❌ [WEBHOOK] Erro ao processar update:', updateError);
        console.error('Stack:', updateError.stack);
      }
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });
    
  } catch (err) {
    console.error('❌ [WEBHOOK] Erro crítico:', err);
    console.error('Stack:', err.stack);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Iniciar job de verificação de expirações (apenas se módulo carregou)
if (checkExpirations && !global._EXPIRATION_JOB_STARTED) {
  global._EXPIRATION_JOB_STARTED = true;
  
  setInterval(async () => {
    try {
      console.log('🔍 [JOB] Verificando expirações...');
      await checkExpirations(bot);
    } catch (err) {
      console.error('❌ [JOB] Erro ao verificar expirações:', err);
    }
  }, 60 * 60 * 1000);
}
