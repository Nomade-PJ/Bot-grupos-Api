// api/telegram-webhook.js
// VERSÃO ULTRA SIMPLIFICADA PARA DEBUG

console.log('🚀 [WEBHOOK] Arquivo carregado!');

module.exports = async (req, res) => {
  // LOG IMEDIATO - PRIMEIRA COISA
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📥 [WEBHOOK] FUNÇÃO EXECUTADA!');
  console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
  console.log(`📋 Method: ${req.method || 'N/A'}`);
  console.log(`📋 URL: ${req.url || 'N/A'}`);
  console.log(`📋 Has body: ${!!req.body}`);
  
  // Responder IMEDIATAMENTE
  res.status(200).json({ ok: true, message: 'Webhook recebido!' });
  
  // Processar em background
  setImmediate(async () => {
    try {
      console.log('📦 [WEBHOOK] Iniciando processamento...');
      
      // Verificar variáveis de ambiente
      console.log(`🔑 [WEBHOOK] BOT_TOKEN existe? ${!!process.env.BOT_TOKEN}`);
      console.log(`🔑 [WEBHOOK] SUPABASE_URL existe? ${!!process.env.SUPABASE_URL}`);
      
      if (!process.env.BOT_TOKEN) {
        console.error('❌ [WEBHOOK] BOT_TOKEN não configurado!');
        return;
      }
      
      if (!req.body) {
        console.log('⚠️ [WEBHOOK] Body vazio!');
        return;
      }
      
      console.log('📦 [WEBHOOK] Body:', JSON.stringify(req.body, null, 2));
      
      // Carregar módulos
      const { Telegraf } = require('telegraf');
      const bot = new Telegraf(process.env.BOT_TOKEN);
      
      // COMANDO /start - VERSÃO SIMPLIFICADA
      if (req.body.message && req.body.message.text === '/start') {
        console.log('🎯 [WEBHOOK] Comando /start detectado!');
        
        const chatId = req.body.message.chat.id;
        const firstName = req.body.message.from.first_name || 'usuário';
        
        console.log(`👤 [WEBHOOK] Chat ID: ${chatId}`);
        console.log(`👤 [WEBHOOK] Nome: ${firstName}`);
        
        try {
          // Mensagem simples
          const message = `👋 *Olá, ${firstName}!*\n\n` +
            `Bem-vindo ao *Valzinha VIP Bot*! 🔥\n\n` +
            `Aqui você pode assinar grupos exclusivos:\n\n` +
            `📅 Semanal\n` +
            `📆 Mensal\n` +
            `🗓️ Trimestral\n\n` +
            `Escolha uma opção:`;
          
          await bot.telegram.sendMessage(chatId, message, {
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [{ text: '👥 Ver Grupos', callback_data: 'show_all_groups' }],
                [{ text: '📋 Minhas Assinaturas', callback_data: 'my_subscriptions' }],
                [{ text: '💬 Suporte', callback_data: 'support' }]
              ]
            }
          });
          
          console.log('✅ [WEBHOOK] Mensagem enviada com sucesso!');
          
        } catch (sendErr) {
          console.error('❌ [WEBHOOK] Erro ao enviar mensagem:', sendErr.message);
          console.error('Stack:', sendErr.stack);
        }
      } else {
        console.log('ℹ️ [WEBHOOK] Update não é /start');
        
        // Tentar processar com Telegraf
        try {
          await bot.handleUpdate(req.body);
          console.log('✅ [WEBHOOK] Update processado');
        } catch (updateErr) {
          console.error('❌ [WEBHOOK] Erro ao processar:', updateErr.message);
        }
      }
      
    } catch (err) {
      console.error('❌ [WEBHOOK] Erro crítico:', err);
      console.error('Stack:', err.stack);
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  });
};
