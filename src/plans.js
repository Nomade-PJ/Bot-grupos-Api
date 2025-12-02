// src/plans.js
const db = require('./database');

/**
 * Busca todos os planos de um grupo
 * @param {string} groupId - ID UUID do grupo
 * @returns {Array} - Array de planos
 */
async function getGroupPlans(groupId) {
  try {
    const { data, error} = await db.supabase
      .from('groups')
      .select('plans')
      .eq('id', groupId)
      .single();
    
    if (error) throw error;
    return data?.plans || [];
  } catch (err) {
    console.error('Erro ao buscar planos:', err.message);
    return [];
  }
}

/**
 * Busca um plano específico
 * @param {string} groupId - ID UUID do grupo
 * @param {string} planType - Tipo do plano (weekly, monthly, quarterly)
 * @returns {Object|null} - Objeto do plano ou null
 */
async function getPlanByType(groupId, planType) {
  try {
    const plans = await getGroupPlans(groupId);
    return plans.find(p => p.type === planType) || null;
  } catch (err) {
    console.error('Erro ao buscar plano:', err.message);
    return null;
  }
}

/**
 * Calcula preço e detalhes com base no plano
 * @param {Array} plans - Array de planos
 * @param {string} planType - Tipo do plano
 * @returns {Object} - Detalhes do plano
 */
function calculatePlanDetails(plans, planType) {
  const plan = plans.find(p => p.type === planType);
  
  if (!plan) {
    throw new Error(`Plano '${planType}' não encontrado`);
  }
  
  return {
    type: plan.type,
    name: plan.name,
    price: parseFloat(plan.price),
    days: plan.days,
    discount: plan.discount_percentage || 0,
    badge: plan.badge || '',
    emoji: getPlanEmoji(plan.type)
  };
}

/**
 * Retorna emoji baseado no tipo de plano
 * @param {string} planType 
 * @returns {string}
 */
function getPlanEmoji(planType) {
  const emojis = {
    'weekly': '📅',
    'monthly': '📆',
    'quarterly': '🗓️'
  };
  return emojis[planType] || '📋';
}

/**
 * Formata mensagem de plano para exibição
 * @param {Object} plan - Objeto do plano
 * @returns {string} - Mensagem formatada
 */
function formatPlanMessage(plan) {
  const emoji = getPlanEmoji(plan.type);
  const badge = plan.badge ? ` ${plan.badge}` : '';
  const discount = plan.discount_percentage 
    ? ` (💰 ${plan.discount_percentage}% OFF)` 
    : '';
  
  return `${emoji} *${plan.name}*${badge}\n` +
    `💰 R$ ${parseFloat(plan.price).toFixed(2)}${discount}\n` +
    `📅 ${plan.days} dias de acesso`;
}

/**
 * Valida se um tipo de plano é válido
 * @param {string} planType 
 * @returns {boolean}
 */
function isValidPlanType(planType) {
  const validTypes = ['weekly', 'monthly', 'quarterly'];
  return validTypes.includes(planType);
}

/**
 * Calcula desconto baseado no plano
 * @param {number} basePrice - Preço base
 * @param {number} discountPercentage - Porcentagem de desconto
 * @returns {Object} - { originalPrice, discountAmount, finalPrice }
 */
function calculateDiscount(basePrice, discountPercentage) {
  const discountAmount = (basePrice * discountPercentage) / 100;
  const finalPrice = basePrice - discountAmount;
  
  return {
    originalPrice: parseFloat(basePrice.toFixed(2)),
    discountAmount: parseFloat(discountAmount.toFixed(2)),
    finalPrice: parseFloat(finalPrice.toFixed(2)),
    percentage: discountPercentage
  };
}

module.exports = {
  getGroupPlans,
  getPlanByType,
  calculatePlanDetails,
  formatPlanMessage,
  isValidPlanType,
  calculateDiscount,
  getPlanEmoji
};

