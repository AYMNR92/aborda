import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { toggleBookmarkTrip, toggleLikeTrip } from '../services/api';
const { width } = Dimensions.get('window');

export const PostCard = ({ trip, onDelete }) => {
  const { user } = useAuth();
  const flight = trip.flight; // Données du vol lié (si existe)
  const isMyPost = user && user.id === trip.user_id;

  const [liked, setLiked] = useState(trip.isLiked);
  const [likesCount, setLikesCount] = useState(trip.likesCount || 0);
  const [bookmarked, setBookmarked] = useState(trip.isBookmarked);
  
  // Fonction Like
  const handleLike = async () => {
    // 1. Mise à jour visuelle immédiate (Optimistic)
    const newStatus = !liked;
    setLiked(newStatus);
    setLikesCount(prev => newStatus ? prev + 1 : prev - 1);

    try {
      // 2. Appel API en arrière-plan
      await toggleLikeTrip(trip.id);
    } catch (error) {
      // 3. Si erreur, on revient en arrière
      setLiked(!newStatus);
      setLikesCount(prev => newStatus ? prev - 1 : prev + 1);
      console.error("Erreur like:", error);
    }
  };

  // Fonction Bookmark
  const handleBookmark = async () => {
    setBookmarked(!bookmarked);
    try {
      await toggleBookmarkTrip(trip.id);
    } catch (error) {
      setBookmarked(!bookmarked); // Rollback
    }
  };
  
  const authorName = trip.author_email 
    ? trip.author_email.split('@')[0]
    : "ANONYME";
  return (
    <View style={styles.card}>
      {/* HEADER: User info (Simulé pour l'instant) */}
      <View style={styles.header}>
        <View style={styles.avatarPlaceholder}>
           <Text>👤</Text>
        </View>
        <View style={{flex:1}}>
           <Text style={styles.username}>@{authorName}</Text>
           <Text style={styles.location}>{trip.location}</Text>
        </View>
        {flight && (
            <View style={styles.badgeFlight}>
                <Ionicons name="airplane" size={12} color="#fff" />
                <Text style={styles.badgeText}>{flight.departure_airport} ➔ {flight.arrival_airport}</Text>
            </View>
        )}
        {isMyPost && (
            <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
        )}
      </View>

      {/* IMAGE PRINCIPALE */}
      <View style={styles.imageContainer}>
        {trip.photos && trip.photos.length > 0 ? (
            <Image source={{ uri: trip.photos[0] }} style={styles.image} resizeMode="cover" />
        ) : (
            <View style={[styles.image, {backgroundColor: '#333', justifyContent:'center', alignItems:'center'}]}>
                <Ionicons name="image-outline" size={50} color="#666" />
            </View>
        )}
      </View>

      {/* CONTENU TEXTE */}
      <View style={styles.content}>
        <Text style={styles.title}>{trip.title}</Text>
        <Text style={styles.description} numberOfLines={3}>{trip.description}</Text>
        
        {/* BARRE D'ACTIONS */}
        <View style={styles.actions}>
            
            {/* BOUTON LIKE */}
            <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
                <Ionicons 
                  name={liked ? "heart" : "heart-outline"} 
                  size={26} 
                  color={liked ? "#EF4444" : "#fff"} 
                />
                <Text style={[styles.actionText, liked && {color: '#EF4444'}]}>
                   {likesCount > 0 ? likesCount : ''}
                </Text>
            </TouchableOpacity>

            {/* BOUTON COMMENTAIRE */}
            <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="chatbubble-outline" size={24} color="#fff" />
            </TouchableOpacity>

            {/* ESPACE FLEXIBLE */}
            <View style={{flex:1}} />

            {/* BOUTON BOOKMARK */}
            <TouchableOpacity onPress={handleBookmark}>
                <Ionicons 
                  name={bookmarked ? "bookmark" : "bookmark-outline"} 
                  size={24} 
                  color={bookmarked ? "#6050dc" : "#fff"} 
                />
            </TouchableOpacity>
        </View>     
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#181f2aff',
    marginBottom: 20,
    borderRadius: 0, // Style "Instagram" ou 16 pour style "Card"
    borderBottomWidth: 1,
    borderBottomColor: '#334155'
  },
  header: {
    flexDirection: 'row', alignItems: 'center', padding: 15
  },
  avatarPlaceholder: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#334155',
    justifyContent: 'center', alignItems: 'center', marginRight: 10
  },
  deleteBtn: {
      padding: 8,
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderRadius: 20,
      marginLeft: 10
  },
  username: { color: '#fff', fontWeight: 'bold', fontSize: 14, paddingBottom: 5 },
  location: { color: '#94A3B8', fontSize: 12 },
  
  badgeFlight: {
      marginLeft: 'auto', flexDirection: 'row', alignItems: 'center',
      backgroundColor: '#41aac4ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold', marginLeft: 4 },

  imageContainer: { width: '100%', height: 300, backgroundColor: '#000' },
  image: { width: '100%', height: '100%' },

  content: { padding: 15 },
  title: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  description: { color: '#CBD5E1', fontSize: 14, lineHeight: 20 },

  actions: { flexDirection: 'row', marginTop: 15, alignItems: 'center' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  actionText: { color: '#fff', marginLeft: 5, fontSize: 14 }
});