// api/telegram-webhook.js
// Webhook handler ULTRA SIMPLIFICADO para debug

console.log('🚀 [WEBHOOK] Arquivo carregado!');

module.exports = async (req, res) => {
  // LOG IMEDIATO - ANTES DE QUALQUER COISA
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📥 [WEBHOOK] FUNÇÃO CHAMADA!');
  console.log(`⏰ [WEBHOOK] Timestamp: ${new Date().toISOString()}`);
  console.log(`📋 [WEBHOOK] Method: ${req.method}`);
  console.log(`📋 [WEBHOOK] URL: ${req.url}`);
  console.log(`📋 [WEBHOOK] Headers:`, JSON.stringify(req.headers));
  console.log(`📋 [WEBHOOK] Body existe? ${!!req.body}`);
  console.log(`📋 [WEBHOOK] Body type: ${typeof req.body}`);
  
  // Responder IMEDIATAMENTE para não dar timeout
  res.status(200).json({ ok: true, message: 'Webhook recebido' });
  
  // Processar em background
  setImmediate(async () => {
    try {
      console.log('📦 [WEBHOOK] Body completo:', JSON.stringify(req.body, null, 2));
      
      if (!req.body) {
        console.log('⚠️ [WEBHOOK] Body está vazio!');
        return;
      }
      
      if (req.method !== 'POST') {
        console.log(`⚠️ [WEBHOOK] Método errado: ${req.method} (esperado POST)`);
        return;
      }
      
      console.log('✅ [WEBHOOK] Processando update do Telegram...');
      
      // Carregar módulos apenas quando necessário
      const { Telegraf } = require('telegraf');
      
      // Verificar variáveis de ambiente
      const BOT_TOKEN = process.env.BOT_TOKEN;
      if (!BOT_TOKEN) {
        console.error('❌ [WEBHOOK] BOT_TOKEN não configurado!');
        return;
      }
      
      console.log(`✅ [WEBHOOK] BOT_TOKEN encontrado: ${BOT_TOKEN.substring(0, 10)}...`);
      
      const bot = new Telegraf(BOT_TOKEN);
      
      // Carregar módulos
      let db, subscriptions;
      try {
        db = require('../src/database');
        subscriptions = require('../src/subscriptions');
        console.log('✅ [WEBHOOK] Módulos carregados');
      } catch (moduleErr) {
        console.error('❌ [WEBHOOK] Erro ao carregar módulos:', moduleErr.message);
        console.error('Stack:', moduleErr.stack);
      }
      
      // COMANDO /start - VERSÃO ULTRA SIMPLES
      if (req.body.message && req.body.message.text === '/start') {
        console.log('🎯 [WEBHOOK] Comando /start detectado!');
        
        const userId = req.body.message.from.id;
        const firstName = req.body.message.from.first_name || 'usuário';
        
        console.log(`👤 [WEBHOOK] Usuário: ${userId} (@${req.body.message.from.username || 'N/A'})`);
        
        try {
          // Criar usuário no banco
          if (db && db.getOrCreateUser) {
            try {
              await db.getOrCreateUser(req.body.message.from);
              console.log('✅ [WEBHOOK] Usuário criado/atualizado no banco');
            } catch (userErr) {
              console.error('⚠️ [WEBHOOK] Erro ao criar usuário:', userErr.message);
            }
          }
          
          // Enviar mensagem
          const message = `👋 *Olá, ${firstName}!*\n\n` +
            `Bem-vindo ao *Valzinha VIP Bot*! 🔥\n\n` +
            `Aqui você pode assinar grupos exclusivos com planos flexíveis:\n\n` +
            `📅 *Semanal* - Teste por 7 dias\n` +
            `📆 *Mensal* - O mais escolhido\n` +
            `🗓️ *Trimestral* - Economize mais!\n\n` +
            `Escolha uma opção abaixo:`;
          
          const buttons = {
            inline_keyboard: [
              [{ text: '👥 Ver Grupos Disponíveis', callback_data: 'show_all_groups' }],
              [{ text: '📋 Minhas Assinaturas', callback_data: 'my_subscriptions' }],
              [{ text: '💬 Suporte', callback_data: 'support' }]
            ]
          };
          
          await bot.telegram.sendMessage(
            req.body.message.chat.id,
            message,
            {
              parse_mode: 'Markdown',
              reply_markup: buttons
            }
          );
          
          console.log('✅ [WEBHOOK] Mensagem /start enviada com sucesso!');
          
        } catch (sendErr) {
          console.error('❌ [WEBHOOK] Erro ao enviar mensagem:', sendErr.message);
          console.error('Stack:', sendErr.stack);
          
          // Tentar resposta simplificada
          try {
            await bot.telegram.sendMessage(
              req.body.message.chat.id,
              '👋 Olá! Bem-vindo ao Valzinha VIP Bot! 🔥\n\nUse os botões para navegar.',
              {
                reply_markup: {
                  inline_keyboard: [
                    [{ text: '👥 Ver Grupos', callback_data: 'show_all_groups' }],
                    [{ text: '📋 Assinaturas', callback_data: 'my_subscriptions' }]
                  ]
                }
              }
            );
            console.log('✅ [WEBHOOK] Mensagem simplificada enviada');
          } catch (fallbackErr) {
            console.error('❌ [WEBHOOK] Erro até no fallback:', fallbackErr.message);
          }
        }
      } else {
        console.log('ℹ️ [WEBHOOK] Update não é /start, tipo:', req.body.message?.text || req.body.callback_query?.data || 'outro');
        
        // Processar outros tipos de update
        try {
          await bot.handleUpdate(req.body);
          console.log('✅ [WEBHOOK] Update processado');
        } catch (updateErr) {
          console.error('❌ [WEBHOOK] Erro ao processar update:', updateErr.message);
        }
      }
      
    } catch (err) {
      console.error('❌ [WEBHOOK] Erro crítico no processamento:', err);
      console.error('Stack completo:', err.stack);
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  });
};
