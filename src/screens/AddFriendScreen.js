import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { addFriend, searchUsers } from '../services/api';

export const AddFriendScreen = () => {
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Debounce pour la recherche
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const users = await searchUsers(query);
      setResults(users);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const handleAdd = async (user) => {
    try {
      const res = await addFriend(user.id);
      Alert.alert("Succès", res.message);
    } catch (e) {
      Alert.alert("Erreur", "Impossible d'ajouter cet utilisateur.");
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
           <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Ajouter des amis</Text>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#94A3B8" />
        <TextInput
          style={styles.input}
          placeholder="Rechercher un pseudo..."
          placeholderTextColor="#64748B"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoFocus
        />
      </View>

      {/* Liste des résultats */}
      {loading ? (
        <ActivityIndicator style={{marginTop: 20}} color="#6050dc" />
      ) : (
        <FlatList
          data={results}
          keyExtractor={item => item.id}
          contentContainerStyle={{padding: 20}}
          ListEmptyComponent={query.length > 1 ? <Text style={styles.empty}>Aucun utilisateur trouvé</Text> : null}
          renderItem={({ item }) => (
            <View style={styles.userCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.username[0].toUpperCase()}</Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.username}>@{item.username}</Text>
                {/* <Text style={styles.fullname}>{item.full_name}</Text> */}
              </View>
              <TouchableOpacity style={styles.addBtn} onPress={() => handleAdd(item)}>
                <Ionicons name="person-add" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', paddingTop: 50 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
  backBtn: { marginRight: 15 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#FFF' },
  
  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1E293B', marginHorizontal: 20,
    paddingHorizontal: 15, borderRadius: 12, height: 50
  },
  input: { flex: 1, color: '#FFF', marginLeft: 10, fontSize: 16 },
  
  userCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1E293B', padding: 15, borderRadius: 12, marginBottom: 10
  },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center', marginRight: 15
  },
  avatarText: { color: '#FFF', fontWeight: 'bold', fontSize: 18 },
  userInfo: { flex: 1 },
  username: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  fullname: { color: '#94A3B8', fontSize: 14 },
  
  addBtn: {
    backgroundColor: '#6050dc', width: 40, height: 40,
    borderRadius: 20, justifyContent: 'center', alignItems: 'center'
  },
  empty: { color: '#64748B', textAlign: 'center', marginTop: 20 }
});