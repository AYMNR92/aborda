import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { fetchListDetails } from '../services/api';

export const ListDetailsScreen = ({ route, navigation }) => {
  const { list } = route.params; // On récupère l'objet liste (id, name, emoji)
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDetails = async () => {
      const data = await fetchListDetails(list.id);
      setItems(data);
      setLoading(false);
    };
    loadDetails();
  }, [list.id]);

  // Helper pour ouvrir Google Maps (Optionnel mais cool)
  const openMap = (lat, lon, name) => {
    const url = Platform.select({
      ios: `maps:0,0?q=${name}@${lat},${lon}`,
      android: `geo:0,0?q=${lat},${lon}(${name})`
    });
    Linking.openURL(url);
  };

  const getIcon = (cat) => {
      if (cat === 'food') return 'restaurant';
      if (cat === 'sleep') return 'bed';
      return 'camera';
  }

  return (
    <View style={styles.container}>
      {/* Header Simple */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{list.emoji} {list.name}</Text>
        <View style={{width: 24}} /> 
      </View>

      {loading ? (
        <ActivityIndicator color="#6050dc" style={{marginTop: 50}} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20 }}
          ListEmptyComponent={<Text style={styles.emptyText}>Cette liste est vide.</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => openMap(item.latitude, item.longitude, item.name)}>
              <View style={[styles.iconBox, { backgroundColor: '#6050dc20' }]}>
                 <Ionicons name={getIcon(item.category)} size={20} color="#6050dc" />
              </View>
              <View style={{flex: 1}}>
                 <Text style={styles.itemName}>{item.name}</Text>
                 <Text style={styles.itemAddress} numberOfLines={1}>{item.location}</Text>
              </View>
              <Ionicons name="navigate-circle-outline" size={28} color="#6050dc" />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', paddingTop: 50 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 10 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  emptyText: { color: '#666', textAlign: 'center', marginTop: 50 },
  
  card: { 
      flexDirection: 'row', alignItems: 'center', 
      backgroundColor: '#1E293B', padding: 15, borderRadius: 12, marginBottom: 15, gap: 15 
  },
  iconBox: { width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  itemName: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  itemAddress: { color: '#94A3B8', fontSize: 12, marginTop: 2 }
});