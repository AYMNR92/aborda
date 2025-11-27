import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Services
import { fetchUserFlights, postTrip, uploadImageToSupabase } from '../services/api';
import { getAirlineColors } from '../utils/airlines';

export const CreateTripScreen = () => {
  const navigation = useNavigation();
  
  // Formulaire
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [selectedFlight, setSelectedFlight] = useState(null);
  
  // Data
  const [myFlights, setMyFlights] = useState([]);
  const [loading, setLoading] = useState(false);

  // Charger les vols pour le sélecteur
  useEffect(() => {
    const loadFlights = async () => {
      const flights = await fetchUserFlights();
      setMyFlights(flights);
    };
    loadFlights();
  }, []);

  // Choisir une image
const pickImage = async () => {
    try {
      console.log("1. Début demande permission...");
      
      // On demande la permission directement (plus fiable que le hook pour le debug)
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log("2. Statut permission:", status);

      if (status !== 'granted') {
        Alert.alert("Désolé", "Nous avons besoin de la permission pour accéder aux photos !");
        return;
      }

      console.log("3. Ouverture galerie...");
      
      let result = await ImagePicker.launchImageLibraryAsync({
        // Astuce : On passe la chaîne 'Images' directement si l'enum pose problème
        mediaTypes: 'Images', 
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });

      console.log("4. Résultat galerie :", result.canceled ? "Annulé" : "Succès");

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }

    } catch (error) {
      console.error("❌ ERREUR CRITIQUE PICKER :", error);
      Alert.alert("Erreur", "Impossible d'ouvrir la galerie : " + error.message);
    }
  };
  // Envoyer le post
  const handlePublish = async () => {
    if (!title || !image) {
      Alert.alert("Oups", "Il faut au moins une photo et un titre !");
      return;
    }

    setLoading(true);
    try {
      // 1. Upload de l'image
      console.log("📤 Upload image...");
      const imageUrl = await uploadImageToSupabase(image);

      // 2. Création du Trip
      console.log("📝 Création trip...");
      await postTrip({
        title,
        description,
        location: selectedFlight ? selectedFlight.arrival?.city : "Destination inconnue",
        flightId: selectedFlight?.id,
        photos: [imageUrl]
      });

      Alert.alert("Succès", "Votre voyage a été publié ! 🚀");
      navigation.goBack(); // Retour à l'écran précédent

    } catch (error) {
      Alert.alert("Erreur", "Impossible de publier : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouveau Trip</Text>
        <TouchableOpacity onPress={handlePublish} disabled={loading}>
          {loading ? <ActivityIndicator color="#6050dc" /> : <Text style={styles.publishBtn}>Publier</Text>}
        </TouchableOpacity>
      </View>

      {/* 1. MÉDIA */}
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.previewImage} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="camera-outline" size={40} color="#666" />
            <Text style={styles.placeholderText}>Ajouter une photo de couverture</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* 2. LIER UN VOL (Selecteur Horizontal) */}
      <Text style={styles.label}>Lier à un vol récent (Optionnel)</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.flightSelector}>
        {myFlights.map((flight) => {
          const isSelected = selectedFlight?.id === flight.id;
          const color = getAirlineColors(flight.airline_code)[0] || '#333';
          
          return (
            <TouchableOpacity 
              key={flight.id} 
              style={[styles.flightChip, isSelected && { borderColor: '#6050dc', borderWidth: 2 }]}
              onPress={() => setSelectedFlight(isSelected ? null : flight)}
            >
              <View style={[styles.airlineDot, { backgroundColor: color }]} />
              <View>
                <Text style={styles.flightRoute}>{flight.departure_airport} ➔ {flight.arrival_airport}</Text>
                <Text style={styles.flightDate}>{new Date(flight.departure_date).toLocaleDateString()}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 3. DETAILS */}
      <View style={styles.form}>
        <TextInput
          style={styles.inputTitle}
          placeholder="Titre du voyage (ex: Roadtrip Japon)"
          placeholderTextColor="#666"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={styles.inputDesc}
          placeholder="Racontez votre expérience..."
          placeholderTextColor="#666"
          multiline
          value={description}
          onChangeText={setDescription}
        />
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  publishBtn: { color: '#6050dc', fontSize: 16, fontWeight: 'bold' },
  
  imagePicker: { height: 250, backgroundColor: '#1a1a1a', marginHorizontal: 20, borderRadius: 15, overflow: 'hidden', marginBottom: 20 },
  previewImage: { width: '100%', height: '100%' },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: '#666', marginTop: 10 },

  label: { color: '#fff', marginLeft: 20, marginBottom: 10, fontWeight: 'bold' },
  flightSelector: { paddingLeft: 20, marginBottom: 20 },
  flightChip: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: '#1a1a1a', padding: 10, borderRadius: 10, marginRight: 10,
    width: 160
  },
  airlineDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  flightRoute: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  flightDate: { color: '#999', fontSize: 10 },

  form: { paddingHorizontal: 20 },
  inputTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#333', paddingBottom: 10 },
  inputDesc: { color: '#ccc', fontSize: 16, minHeight: 100, textAlignVertical: 'top' }
});