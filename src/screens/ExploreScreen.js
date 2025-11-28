import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PostCard } from '../components/PostCard'; // Import du composant
import { deleteTripFromBackend, fetchAllTrips } from '../services/api';

export const ExploreScreen = () => {
  const navigation = useNavigation();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Charger les posts
  const loadTrips = async () => {
    const data = await fetchAllTrips();
    setTrips(data);
    setLoading(false);
    setRefreshing(false);
  };

  // Recharge automatique quand on revient sur l'écran (pour voir son nouveau post)
  useFocusEffect(
    useCallback(() => {
      loadTrips();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadTrips();
  };

  const handleDeleteTrip = (tripId) => {
    Alert.alert(
      "Supprimer ce Trip ?",
      "Cette action est irréversible.",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Supprimer", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTripFromBackend(tripId);
              // Recharger la liste pour faire disparaître le post
              loadTrips(); 
            } catch (e) {
              Alert.alert("Erreur : " + e.message);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* HEADER FIXE */}
      <View style={styles.header}>
          <Text style={styles.headerTitle}>Explorer</Text>
      </View>

      {loading ? (
          <View style={styles.loader}><ActivityIndicator color="#6050dc" /></View>
      ) : (
          <FlatList
            data={trips}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                activeOpacity={0.9} // Petit effet visuel au clic
                onPress={() => navigation.navigate('TripDetails', { trip: item })} // On navigue et on passe les données du trip
              >
                <PostCard trip={item} onDelete={() => handleDeleteTrip(item.id)} />
              </TouchableOpacity>
            )}            
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
            contentContainerStyle={{ paddingBottom: 100 }} // Pour le FAB
            ListEmptyComponent={
                <Text style={styles.emptyText}>Aucun voyage partagé pour le moment.</Text>
            }
          />
      )}
      {/* FAB */}
      <TouchableOpacity 
        style={styles.fab} 
        activeOpacity={0.8}
        onPress={() => navigation.navigate('CreateTrip')}
      >
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#131313' },
  header: {
      paddingTop: 60, paddingBottom: 15, paddingHorizontal: 20,
      backgroundColor: '#000', borderBottomWidth: 1, borderBottomColor: '#1E293B'
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  loader: { marginTop: 50 },
  emptyText: { color: '#666', textAlign: 'center', marginTop: 50 },
  fab: {
    position: 'absolute', bottom: 120, right: 20,
    width: 50, height: 50, borderRadius: 25, backgroundColor: '#41aac4ff',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: "#6050dc", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 4.65, elevation: 8,
  }
});