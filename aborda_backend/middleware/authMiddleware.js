const { createClient } = require('@supabase/supabase-js');

// On a besoin d'un client Supabase pour vérifier le token
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const requireAuth = async (req, res, next) => {
  // 1. Récupérer le token dans le header "Authorization: Bearer xyz..."
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: "Token manquant" });
  }

  const token = authHeader.split(' ')[1]; // Enlever le mot "Bearer"

  // 2. Vérifier le token auprès de Supabase
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: "Token invalide ou expiré" });
  }

  // 3. Si tout est bon, on attache le VRAI user à la requête
  req.user = user;
  
  // 4. On passe à la suite (la route API)
  next();
};

module.exports = requireAuth;