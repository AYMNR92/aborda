const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Gérer le Like (Toggle : Ajoute ou Supprime)
async function toggleLike(tripId, userId) {
  // 1. Vérifier si existe déjà
  const { data } = await supabase
    .from('likes')
    .select('id')
    .eq('trip_id', tripId)
    .eq('user_id', userId)
    .single();

  if (data) {
    // Si existe -> DELETE (Unlike)
    await supabase.from('likes').delete().eq('id', data.id);
    return { liked: false };
  } else {
    // Sinon -> INSERT (Like)
    await supabase.from('likes').insert([{ trip_id: tripId, user_id: userId }]);
    return { liked: true };
  }
}

// Gérer le Bookmark (Toggle)
async function toggleBookmark(tripId, userId) {
  const { data } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('trip_id', tripId)
    .eq('user_id', userId)
    .single();

  if (data) {
    await supabase.from('bookmarks').delete().eq('id', data.id);
    return { bookmarked: false };
  } else {
    await supabase.from('bookmarks').insert([{ trip_id: tripId, user_id: userId }]);
    return { bookmarked: true };
  }
}

module.exports = { toggleLike, toggleBookmark };