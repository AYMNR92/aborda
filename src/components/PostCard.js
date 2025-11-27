import { Ionicons } from '@expo/vector-icons';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
const { width } = Dimensions.get('window');

export const PostCard = ({ trip }) => {
  const flight = trip.flight; // Données du vol lié (si existe)
  const { user } = useAuth();
  return (
    <View style={styles.card}>
      {/* HEADER: User info (Simulé pour l'instant) */}
      <View style={styles.header}>
        <View style={styles.avatarPlaceholder}>
           <Text>👤</Text>
        </View>
        <View>
           <Text style={styles.username}>@{user?.email ? user.email.split('@')[0] : "VOYAGEUR"}</Text>
           <Text style={styles.location}>Los Angeles</Text>
        </View>
        {flight && (
            <View style={styles.badgeFlight}>
                <Ionicons name="airplane" size={12} color="#fff" />
                <Text style={styles.badgeText}>{flight.departure_airport} ➔ {flight.arrival_airport}</Text>
            </View>
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
            <View style={styles.actionBtn}>
                <Ionicons name="heart-outline" size={24} color="#fff" />
                <Text style={styles.actionText}>0</Text>
            </View>
            <View style={styles.actionBtn}>
                <Ionicons name="chatbubble-outline" size={22} color="#fff" />
                <Text style={styles.actionText}>Commenter</Text>
            </View>
            <View style={{flex:1}} />
            <Ionicons name="bookmark-outline" size={24} color="#fff" />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
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