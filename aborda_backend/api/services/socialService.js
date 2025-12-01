const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// 1. Chercher un utilisateur par son pseudo (pour l'ajouter)
async function searchUsers(query) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, full_name')
    .ilike('username', `%${query}%`) // Recherche partielle (ex: "Tho" -> "Thomas")
    .neq('id', currentUserId)
    .limit(10);

  if (error) throw new Error(error.message);
  return data;
}

// 2. Envoyer une demande d'ami
async function sendFriendRequest(requesterId, receiverId) {

  // Vérifier si une demande existe déjà (dans un sens ou l'autre)
  const { data: existing } = await supabase
    .from('friendships')
    .select('*')
    .or(`and(requester_id.eq.${requesterId},receiver_id.eq.${receiverId}),and(requester_id.eq.${receiverId},receiver_id.eq.${requesterId})`)
    .single();

  if (existing) {
      if (existing.status === 'accepted') throw new Error("Déjà amis !");
      if (existing.status === 'pending') throw new Error("Demande déjà en attente.");
  }

  const { error } = await supabase
    .from('friendships')
    .insert([{ requester_id: requesterId, receiver_id: receiverId, status: 'pending' }]);

  if (error) throw new Error(error.message);
  return { message: "Demande envoyée !" };
}

// 3. Récupérer mes amis (pour le partage)
async function getMyFriends(userId) {
  // C'est une requête un peu complexe car l'ami peut être le demandeur OU le receveur
  // Pour simplifier le MVP, on va faire 2 requêtes simples
  
  // Cas A : J'ai demandé, ils ont accepté
  const { data: sent } = await supabase
    .from('friendships')
    .select('friend:profiles!receiver_id(*)')
    .eq('requester_id', userId)
    .eq('status', 'accepted');

  // Cas B : Ils ont demandé, j'ai accepté
  const { data: received } = await supabase
    .from('friendships')
    .select('friend:profiles!requester_id(*)')
    .eq('receiver_id', userId)
    .eq('status', 'accepted');

  // On fusionne les listes
  const friends = [
      ...(sent?.map(f => f.friend) || []),
      ...(received?.map(f => f.friend) || [])
  ];
  
  return friends;
}

module.exports = { searchUsers, sendFriendRequest, getMyFriends };