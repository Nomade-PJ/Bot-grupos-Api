// src/subscriptions.js
const { Markup } = require('telegraf');
const db = require('./database');
const manualPix = require('./pix/manual');
const plans = require('./plans');

/**
 * Mostra lista de todos os grupos disponíveis
 */
async function showGroupsList(ctx) {
  try {
    const allGroups = await db.getAllGroups();
    const activeGroups = allGroups.filter(g => g.is_active);
    
    if (activeGroups.length === 0) {
      return ctx.reply('❌ Nenhum grupo disponível no momento.');
    }
    
    let message = '👥 *GRUPOS DISPONÍVEIS*\n\n';
    message += 'Escolha um grupo para ver os planos:\n\n';
    
    const buttons = [];
    
    for (const group of activeGroups) {
      const groupPlans = await plans.getGroupPlans(group.id);
      const minPrice = groupPlans.length > 0 
        ? Math.min(...groupPlans.map(p => parseFloat(p.price)))
        : 0;
      
      message += `🔥 *${group.group_name}*\n`;
      if (minPrice > 0) {
        message += `💰 A partir de R$ ${minPrice.toFixed(2)}\n`;
      }
      message += `\n`;
      
      buttons.push([
        Markup.button.callback(
          `👉 ${group.group_name}`,
          `show_plans:${group.id}`
        )
      ]);
    }
    
    return ctx.reply(message, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard(buttons)
    });
  } catch (err) {
    console.error('Erro ao mostrar grupos:', err);
    return ctx.reply('❌ Erro ao carregar grupos. Tente novamente.');
  }
}

/**
 * Mostra opções de planos para um grupo específico
 */
async function showGroupPlans(ctx, groupId) {
  try {
    // Buscar grupo
    const { data: group, error: groupError } = await db.supabase
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .single();
    
    if (groupError || !group) {
      await ctx.answerCbQuery('❌ Grupo não encontrado');
      return ctx.reply('❌ Grupo não encontrado.');
    }
    
    // Buscar planos
    const groupPlans = await plans.getGroupPlans(groupId);
    
    if (groupPlans.length === 0) {
      await ctx.answerCbQuery('❌ Sem planos disponíveis');
      return ctx.reply('❌ Este grupo não possui planos configurados.');
    }
    
    // Montar mensagem
    let message = `👥 *${group.group_name}*\n\n`;
    message += `🎯 *Escolha seu plano:*\n\n`;
    
    const buttons = [];
    
    for (const plan of groupPlans) {
      message += `${plans.formatPlanMessage(plan)}\n\n`;
      
      const emoji = plans.getPlanEmoji(plan.type);
      buttons.push([
        Markup.button.callback(
          `${emoji} ${plan.name} - R$ ${parseFloat(plan.price).toFixed(2)}`,
          `subscribe:${groupId}:${plan.type}`
        )
      ]);
    }
    
    buttons.push([Markup.button.callback('⬅️ Voltar', 'back_to_groups')]);
    
    await ctx.answerCbQuery('✅');
    return ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard(buttons)
    });
  } catch (err) {
    console.error('Erro ao mostrar planos:', err);
    await ctx.answerCbQuery('❌ Erro ao carregar planos');
    return ctx.reply('❌ Erro ao carregar planos. Tente novamente.');
  }
}

/**
 * Processa assinatura de um plano
 */
async function subscribeToPlan(ctx, groupId, planType) {
  try {
    const userId = ctx.from.id;
    
    await ctx.answerCbQuery('🔐 Gerando PIX...');
    
    // Buscar grupo
    const { data: group, error: groupError } = await db.supabase
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .single();
    
    if (groupError || !group) {
      return ctx.reply('❌ Grupo não encontrado.');
    }
    
    // Buscar plano específico
    const selectedPlan = await plans.getPlanByType(groupId, planType);
    
    if (!selectedPlan) {
      return ctx.reply('❌ Plano não encontrado.');
    }
    
    // Gerar PIX
    const { charge } = await manualPix.createManualCharge({
      amount: parseFloat(selectedPlan.price).toFixed(2)
    });
    
    // Criar usuário se não existir
    const user = await db.getOrCreateUser(ctx.from);
    
    // Salvar transação
    await db.createTransaction({
      telegramId: userId,
      userId: user.id,
      groupId: group.id,
      amount: parseFloat(selectedPlan.price),
      pixKey: charge.key,
      pixPayload: charge.copiaCola
    });
    
    // Salvar informações do plano na sessão (para usar depois na aprovação)
    global._PLAN_SESSIONS = global._PLAN_SESSIONS || {};
    global._PLAN_SESSIONS[charge.txid] = {
      groupId: group.id,
      planType: selectedPlan.type,
      planDays: selectedPlan.days,
      planName: selectedPlan.name
    };
    
    // Enviar QR Code
    const emoji = plans.getPlanEmoji(selectedPlan.type);
    const message = `✅ *Plano selecionado: ${emoji} ${selectedPlan.name}*\n\n` +
      `👥 *Grupo:* ${group.group_name}\n` +
      `💰 *Valor:* R$ ${parseFloat(selectedPlan.price).toFixed(2)}\n` +
      `📅 *Duração:* ${selectedPlan.days} dias\n\n` +
      `🔐 *Escaneie o QR Code abaixo:*`;
    
    await ctx.replyWithPhoto(
      { source: charge.qrcodeBuffer },
      { caption: message, parse_mode: 'Markdown' }
    );
    
    await ctx.reply(
      `📋 *Ou use o Copia e Cola:*\n\n` +
      `\`${charge.copiaCola}\`\n\n` +
      `💳 *Após pagar, envie o comprovante (foto ou PDF)!*\n\n` +
      `🆔 TXID: \`${charge.txid}\`\n\n` +
      `⏱️ Este PIX expira em 1 hora.`,
      { parse_mode: 'Markdown' }
    );
    
    console.log(`💳 [SUBSCRIPTION] PIX gerado: ${charge.txid} - ${selectedPlan.name} - R$ ${selectedPlan.price}`);
    
  } catch (err) {
    console.error('Erro ao processar assinatura:', err);
    await ctx.answerCbQuery('❌ Erro ao gerar PIX');
    return ctx.reply('❌ Erro ao gerar PIX. Tente novamente ou contate o suporte.');
  }
}

/**
 * Verifica se usuário já tem assinatura ativa em um grupo
 */
async function hasActiveSubscription(telegramId, groupId) {
  try {
    const { data, error } = await db.supabase
      .from('group_members')
      .select('*')
      .eq('telegram_id', telegramId)
      .eq('group_id', groupId)
      .eq('status', 'active')
      .gte('expires_at', new Date().toISOString())
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data ? true : false;
  } catch (err) {
    console.error('Erro ao verificar assinatura:', err);
    return false;
  }
}

/**
 * Mostra status da assinatura do usuário
 */
async function showMySubscriptions(ctx) {
  try {
    const userId = ctx.from.id;
    
    const { data: subscriptions, error } = await db.supabase
      .from('group_members')
      .select(`
        *,
        group:group_id(group_name, group_link)
      `)
      .eq('telegram_id', userId)
      .eq('status', 'active')
      .gte('expires_at', new Date().toISOString());
    
    if (error) throw error;
    
    if (!subscriptions || subscriptions.length === 0) {
      return ctx.reply(
        '📋 *MINHAS ASSINATURAS*\n\n' +
        '❌ Você não possui assinaturas ativas.\n\n' +
        'Use /start para ver os grupos disponíveis!',
        { parse_mode: 'Markdown' }
      );
    }
    
    let message = '📋 *MINHAS ASSINATURAS ATIVAS*\n\n';
    
    for (const sub of subscriptions) {
      const expiresAt = new Date(sub.expires_at);
      const now = new Date();
      const daysLeft = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
      
      message += `👥 *${sub.group.group_name}*\n`;
      message += `📅 Expira em: ${daysLeft} dias\n`;
      message += `🗓️ Data: ${expiresAt.toLocaleDateString('pt-BR')}\n`;
      message += `🔗 Link: ${sub.group.group_link}\n\n`;
    }
    
    message += '💡 *Dica:* Renove antes do vencimento para não perder o acesso!';
    
    return ctx.reply(message, { parse_mode: 'Markdown' });
  } catch (err) {
    console.error('Erro ao mostrar assinaturas:', err);
    return ctx.reply('❌ Erro ao carregar assinaturas.');
  }
}

module.exports = {
  showGroupsList,
  showGroupPlans,
  subscribeToPlan,
  hasActiveSubscription,
  showMySubscriptions
};

