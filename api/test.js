// api/test.js - Endpoint de teste simples
module.exports = async (req, res) => {
  console.log('🧪 [TEST] Endpoint de teste chamado!');
  console.log('📋 [TEST] Method:', req.method);
  console.log('📋 [TEST] URL:', req.url);
  
  return res.status(200).json({
    ok: true,
    message: 'Endpoint de teste funcionando!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
};

