const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// 1. Créer une nouvelle liste
async function createList(userId, name, emoji) {
  const { data, error } = await supabase
    .from('saved_lists')
    .insert([{ user_id: userId, name, emoji }])
    .select()
    .single();
    
  if (error) throw new Error(error.message);
  return data;
}

// 2. Récupérer toutes les listes de l'utilisateur (avec le nombre d'items)
async function getUserLists(userId) {
  const { data, error } = await supabase
    .from('saved_lists')
    .select(`
      *,
      saved_items (count)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  
  // On nettoie la sortie pour avoir juste un champ "count"
  return data.map(list => ({
    ...list,
    count: list.saved_items[0]?.count || 0
  }));
}

// 3. Ajouter un item dans une liste
async function addItemToList(listId, recommendationId) {
  const { error } = await supabase
    .from('saved_items')
    .insert([{ list_id: listId, recommendation_id: recommendationId }]);

  if (error) {
      // Si c'est un doublon (déjà dans la liste), on ne renvoie pas d'erreur bloquante
      if (error.code === '23505') return { duplicate: true };
      throw new Error(error.message);
  }
  return { success: true };
}

// 4. Voir le contenu d'une liste
async function getListDetails(listId) {
    const { data, error } = await supabase
        .from('saved_items')
        .select(`
            id,
            recommendation:recommendations (*) 
        `)
        .eq('list_id', listId);
        
    if (error) throw new Error(error.message);
    // On aplatit le résultat pour avoir direct l'objet recommendation
    return data.map(item => item.recommendation);
}

module.exports = { createList, getUserLists, addItemToList, getListDetails };