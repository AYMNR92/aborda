import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getAuthToken } from '../services/api'; // Adapte tes imports API
import { API_BASE_URL } from '../utils/config';

export const SaveToListModal = ({ visible, onClose, recommendationId }) => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newListName, setNewListName] = useState('');
  const [creating, setCreating] = useState(false);

  // Charger mes listes
  const loadLists = async () => {
    setLoading(true);
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE_URL}/lists`, {
          headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setLists(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => {
    if (visible) loadLists();
  }, [visible]);

  // Créer une liste
  const handleCreateList = async () => {
    if (!newListName) return;
    setCreating(true);
    try {
      const token = await getAuthToken();
      await fetch(`${API_BASE_URL}/lists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: newListName, emoji: '📁' })
      });
      setNewListName('');
      loadLists(); // Recharger
    } catch (e) { console.error(e); }
    setCreating(false);
  };

  // Ajouter l'item à la liste choisie
  const handleAddToList = async (listId) => {
    try {
      const token = await getAuthToken();
      await fetch(`${API_BASE_URL}/lists/${listId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ recommendationId })
      });
      onClose(); // Fermer la modale
      alert("Ajouté à la liste !");
    } catch (e) { alert("Erreur ajout"); }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
             <Text style={styles.title}>Enregistrer dans...</Text>
             <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="#fff"/></TouchableOpacity>
          </View>

          {/* Créer nouvelle liste */}
          <View style={styles.createRow}>
             <TextInput 
                style={styles.input} 
                placeholder="Nouvelle liste..." 
                placeholderTextColor="#666"
                value={newListName}
                onChangeText={setNewListName}
             />
             <TouchableOpacity onPress={handleCreateList} style={styles.createBtn}>
                {creating ? <ActivityIndicator color="#fff"/> : <Ionicons name="add" size={24} color="#fff"/>}
             </TouchableOpacity>
          </View>

          {/* Liste des dossiers */}
          {loading ? <ActivityIndicator color="#6050dc" /> : (
             <FlatList 
                data={lists}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                   <TouchableOpacity style={styles.listItem} onPress={() => handleAddToList(item.id)}>
                      <View style={styles.listIcon}><Text>{item.emoji}</Text></View>
                      <View>
                        <Text style={styles.listName}>{item.name}</Text>
                        <Text style={styles.listCount}>{item.count} éléments</Text>
                      </View>
                      <Ionicons name="add-circle-outline" size={24} color="#6050dc" style={{marginLeft:'auto'}}/>
                   </TouchableOpacity>
                )}
             />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1E293B', height: '60%', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  title: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  createRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  input: { flex: 1, backgroundColor: '#0F172A', color: '#fff', padding: 12, borderRadius: 8 },
  createBtn: { backgroundColor: '#6050dc', padding: 12, borderRadius: 8, justifyContent:'center' },
  listItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#334155' },
  listIcon: { width: 40, height: 40, backgroundColor: '#334155', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  listName: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  listCount: { color: '#94A3B8', fontSize: 12 }
});