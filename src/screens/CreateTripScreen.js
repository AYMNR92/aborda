// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import * as ImagePicker from 'expo-image-picker';
// import { useEffect, useState } from 'react';
// import { ActivityIndicator, Alert, FlatList, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// // Services
// import { fetchUserFlights, postTrip, uploadImageToSupabase } from '../services/api';
// import { getAirlineColors } from '../utils/airlines';

// export const CreateTripScreen = () => {
//   const navigation = useNavigation();
  
//   // Formulaire
//   const [title, setTitle] = useState('');
//   const [description, setDescription] = useState('');
//   const [image, setImage] = useState(null);
//   const [selectedFlight, setSelectedFlight] = useState(null);
  
//   // Data
//   const [myFlights, setMyFlights] = useState([]);
//   const [loading, setLoading] = useState(false);

//   //Recommandations
//   const [recommendations, setRecommendations] = useState([]);
//   const [showSearchModal, setShowSearchModal] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [searchResults, setSearchResults] = useState([]); // <--- C'est lui qui manquait !
//   const [searchLoading, setSearchLoading] = useState(false);
//   // États temporaires pour le formulaire d'ajout d'adresse
//   const [recoName, setRecoName] = useState('');
//   const [recoCategory, setRecoCategory] = useState('food');
  
//   // Charger les vols pour le sélecteur
//   useEffect(() => {
//     const loadFlights = async () => {
//       const flights = await fetchUserFlights();
//       setMyFlights(flights);
//     };
//     loadFlights();
//   }, []);

//   // Choisir une image
// const pickImage = async () => {
//     try {
//       console.log("1. Début demande permission...");
      
//       // On demande la permission directement (plus fiable que le hook pour le debug)
//       const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//       console.log("2. Statut permission:", status);

//       if (status !== 'granted') {
//         Alert.alert("Désolé", "Nous avons besoin de la permission pour accéder aux photos !");
//         return;
//       }

//       console.log("3. Ouverture galerie...");
      
//       let result = await ImagePicker.launchImageLibraryAsync({
//         // Astuce : On passe la chaîne 'Images' directement si l'enum pose problème
//         mediaTypes: 'Images', 
//         allowsEditing: true,
//         aspect: [4, 3],
//         quality: 0.5,
//       });

//       console.log("4. Résultat galerie :", result.canceled ? "Annulé" : "Succès");

//       if (!result.canceled) {
//         setImage(result.assets[0].uri);
//       }

//     } catch (error) {
//       console.error("❌ ERREUR CRITIQUE PICKER :", error);
//       Alert.alert("Erreur", "Impossible d'ouvrir la galerie : " + error.message);
//     }
//   };

//   // Fonction pour ajouter une reco à la liste locale
//   const addRecommendation = () => {
//     if (!recoName.trim()) return;
//     setRecommendations([...recommendations, { 
//       category: recoCategory, 
//       name: recoName, 
//       id: Date.now() // ID temporaire pour la list Key
//     }]);
//     setRecoName(''); // Reset champ
//   };

//   // Envoyer le post
//   const handlePublish = async () => {
//     if (!title || !image) {
//       Alert.alert("Oups", "Il faut au moins une photo et un titre !");
//       return;
//     }

//     setLoading(true);
//     try {
//       // 1. Upload de l'image
//       console.log("📤 Upload image...");
//       const imageUrl = await uploadImageToSupabase(image);

//       // 2. Création du Trip
//       console.log("📝 Création trip...");
//       await postTrip({
//         title,
//         description,
//         location: selectedFlight ? selectedFlight.arrival?.city : "Destination inconnue",
//         flightId: selectedFlight?.id,
//         photos: [imageUrl],
//         recommendations: recommendations
//       });

//       Alert.alert("Succès", "Votre voyage a été publié ! 🚀");
//       navigation.goBack(); // Retour à l'écran précédent

//     } catch (error) {
//       Alert.alert("Erreur", "Impossible de publier : " + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getCategoryIcon = (cat) => {
//       switch(cat) {
//           case 'food': return 'restaurant';
//           case 'visit': return 'camera';
//           case 'sleep': return 'bed';
//           default: return 'pin';
//       }
//   };

//   // Fonction de recherche (appelée quand on tape)
//   const handleSearch = async (text) => {
//     setSearchQuery(text);
//     if (text.length > 2) {
//         setSearchLoading(true);
//         // Petit délai pour ne pas spammer l'API
//         setTimeout(async () => {
//             // Assurez-vous d'avoir importé searchPlaces depuis api.js !
//             const results = await searchPlaces(text);
//             setSearchResults(results);
//             setSearchLoading(false);
//         }, 500);
//     } else {
//         setSearchResults([]);
//     }
//   };

//   // Quand on clique sur un résultat
//   const selectPlace = (place) => {
//       setRecommendations([...recommendations, {
//           id: Date.now(),
//           category: recoCategory, // Utilise la catégorie sélectionnée (food, visit...)
//           name: place.name,
//           address: place.address, 
//           lat: place.lat,
//           lon: place.lon
//       }]);
      
//       // On ferme tout et on nettoie
//       setShowSearchModal(false);
//       setSearchQuery('');
//       setSearchResults([]);
//   };

//   return (
//     <KeyboardAvoidingView
//       style={{ flex: 1 }}
//       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//       keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0} // Ajuste si besoin selon ton header
//     >
//     <ScrollView 
//         style={styles.container}
//         contentContainerStyle={{ paddingBottom: 120 }} // 2. MARGE DE SÉCURITÉ EN BAS
//         keyboardShouldPersistTaps="handled" // Permet de cliquer sur les boutons même si le clavier est ouvert
//       >
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Ionicons name="close" size={28} color="#fff" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Nouveau Trip</Text>
//         <TouchableOpacity onPress={handlePublish} disabled={loading}>
//           {loading ? <ActivityIndicator color="#6050dc" /> : <Text style={styles.publishBtn}>Publier</Text>}
//         </TouchableOpacity>
//       </View>

//       {/* 1. MÉDIA */}
//       <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
//         {image ? (
//           <Image source={{ uri: image }} style={styles.previewImage} />
//         ) : (
//           <View style={styles.placeholder}>
//             <Ionicons name="camera-outline" size={40} color="#666" />
//             <Text style={styles.placeholderText}>Ajouter une photo de couverture</Text>
//           </View>
//         )}
//       </TouchableOpacity>

//       {/* 2. LIER UN VOL (Selecteur Horizontal) */}
//       <Text style={styles.label}>Lier à un vol récent (Optionnel)</Text>
//       <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.flightSelector}>
//         {myFlights.map((flight) => {
//           const isSelected = selectedFlight?.id === flight.id;
//           const color = getAirlineColors(flight.airline_code)[0] || '#333';
          
//           return (
//             <TouchableOpacity 
//               key={flight.id} 
//               style={[styles.flightChip, isSelected && { borderColor: '#6050dc', borderWidth: 2 }]}
//               onPress={() => setSelectedFlight(isSelected ? null : flight)}
//             >
//               <View style={[styles.airlineDot, { backgroundColor: color }]} />
//               <View>
//                 <Text style={styles.flightRoute}>{flight.departure_airport} ➔ {flight.arrival_airport}</Text>
//                 <Text style={styles.flightDate}>{new Date(flight.departure_date).toLocaleDateString()}</Text>
//               </View>
//             </TouchableOpacity>
//           );
//         })}
//       </ScrollView>

//       {/* 3. DETAILS */}
//       <View style={styles.form}>
//         <TextInput
//           style={styles.inputTitle}
//           placeholder="Titre du voyage (ex: Roadtrip Japon)"
//           placeholderTextColor="#666"
//           value={title}
//           onChangeText={setTitle}
//         />
//         <TextInput
//           style={styles.inputDesc}
//           placeholder="Racontez votre expérience..."
//           placeholderTextColor="#666"
//           multiline
//           value={description}
//           onChangeText={setDescription}
//         />
//       </View>

//       {/* 4. CARNET D'ADRESSES (NOUVEAU BLOC) */}
//       <Text style={styles.label}>Bonnes adresses</Text>
      
//       <View style={styles.recoForm}>
//         <View style={styles.catSelector}>
//             {['food', 'visit', 'sleep'].map(cat => (
//                 <TouchableOpacity 
//                     key={cat} 
//                     onPress={() => setRecoCategory(cat)}
//                     style={[styles.catBtn, recoCategory === cat && styles.catBtnActive]}
//                 >
//                     <Ionicons name={getCategoryIcon(cat)} size={20} color={recoCategory === cat ? '#FFF' : '#666'} />
//                 </TouchableOpacity>
//             ))}
//         </View>
        
//         <View style={styles.addRow}>
//             <TextInput
//                 style={styles.recoInput}
//                 placeholder="Nom du lieu (ex: Sushi Dai)"
//                 placeholderTextColor="#666"
//                 value={recoName}
//                 onChangeText={setRecoName}
//             />
//             <TouchableOpacity onPress={addRecommendation} style={styles.addBtn}>
//                 <Ionicons name="add" size={24} color="#FFF" />
//             </TouchableOpacity>
//         </View>
//       </View>

//       {/* Liste des recos ajoutées */}
//       <View style={styles.recoList}>
//         {recommendations.map((item) => (
//             <View key={item.id} style={styles.recoItem}>
//                 <Ionicons name={getCategoryIcon(item.category)} size={16} color="#6050dc" />
//                 <Text style={styles.recoText}>{item.name}</Text>
//                 <TouchableOpacity onPress={() => setRecommendations(recommendations.filter(r => r.id !== item.id))}>
//                     <Ionicons name="close-circle" size={20} color="#EF4444" />
//                 </TouchableOpacity>
//             </View>
//         ))}
//       </View>
//       <FlatList
//           data={searchResults}
//           keyExtractor={(item) => item.id}
//           renderItem={({ item }) => (
//               <TouchableOpacity style={styles.resultItem} onPress={() => selectPlace(item)}>
//                   <Ionicons name="location-outline" size={24} color="#fff" />
//                   <View style={{marginLeft: 10, flex: 1}}>
//                       {/* Nom du lieu en gras */}
//                       <Text style={styles.resultName}>{item.name}</Text>
                      
//                       {/* Adresse complète en petit en dessous */}
//                       <Text style={styles.resultAddress} numberOfLines={2}>
//                           {item.address}
//                       </Text>
//                   </View>
//                   <Ionicons name="add-circle-outline" size={24} color="#6050dc" />
//               </TouchableOpacity>
//           )}
//       />

//     </ScrollView>
//     </KeyboardAvoidingView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#000', paddingTop: 50 },
//   header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
//   headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
//   publishBtn: { color: '#6050dc', fontSize: 16, fontWeight: 'bold' },
  
//   imagePicker: { height: 250, backgroundColor: '#1a1a1a', marginHorizontal: 20, borderRadius: 15, overflow: 'hidden', marginBottom: 20 },
//   previewImage: { width: '100%', height: '100%' },
//   placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   placeholderText: { color: '#666', marginTop: 10 },

//   label: { color: '#fff', marginLeft: 20, marginBottom: 10, fontWeight: 'bold' },
//   flightSelector: { paddingLeft: 20, marginBottom: 20 },
//   flightChip: { 
//     flexDirection: 'row', alignItems: 'center', 
//     backgroundColor: '#1a1a1a', padding: 10, borderRadius: 10, marginRight: 10,
//     width: 160
//   },
//   airlineDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
//   flightRoute: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
//   flightDate: { color: '#999', fontSize: 10 },

//   form: { paddingHorizontal: 20 },
//   inputTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#333', paddingBottom: 10 },
//   inputDesc: { color: '#ccc', fontSize: 16, minHeight: 100, textAlignVertical: 'top' },
//   catSelector: { flexDirection: 'row', gap: 10, marginBottom: 10, marginLeft: 20 },
//   catBtn: { padding: 10, backgroundColor: '#1E293B', borderRadius: 8 },
//   catBtnActive: { backgroundColor: '#6050dc' },
//   addRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, alignItems: 'center' },
//   recoInput: { flex: 1, backgroundColor: '#1E293B', color: '#FFF', padding: 12, borderRadius: 8 },
//   addBtn: { backgroundColor: '#6050dc', padding: 12, borderRadius: 8 },
//   recoList: { paddingHorizontal: 20, marginTop: 10, marginBottom: 20 },
//   recoItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', padding: 10, borderRadius: 8, marginBottom: 5, gap: 10 },
//   recoText: { color: '#FFF', flex: 1 }
// });

import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal, // 👈 IMPORTANT : Import de Modal
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// Services
import { fetchUserFlights, postTrip, searchPlaces, uploadImageToSupabase } from '../services/api'; // N'oubliez pas d'importer searchPlaces
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

  // Recommandations
  const [recommendations, setRecommendations] = useState([]);
  const [showSearchModal, setShowSearchModal] = useState(false); // Gestion visibilité Modale
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // Catégorie sélectionnée pour la prochaine reco
  const [recoCategory, setRecoCategory] = useState('food');
  
  // Charger les vols
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
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Désolé", "Permission refusée pour les photos.");
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        // Astuce : On passe la chaîne 'Images' directement si l'enum pose problème
        mediaTypes: 'Images', 
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Erreur " + error.message);
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
      const imageUrl = await uploadImageToSupabase(image);
      await postTrip({
        title,
        description,
        location: selectedFlight ? selectedFlight.destCity : "Destination inconnue", // Correction accès propriété
        flightId: selectedFlight?.id,
        photos: [imageUrl],
        recommendations: recommendations
      });

      Alert.alert("Succès", "Voyage publié ! 🚀");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Erreur", "Impossible de publier : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper icônes
  const getCategoryIcon = (cat) => {
      switch(cat) {
          case 'food': return 'restaurant';
          case 'visit': return 'camera';
          case 'sleep': return 'bed';
          default: return 'pin';
      }
  };

  // Recherche (Debounce via timeout)
  const handleSearch = (text) => {
    setSearchQuery(text);
    // Si on vide le champ, on vide les résultats tout de suite
    if (text.length === 0) {
        setSearchResults([]);
        setSearchLoading(false);
    }
  };

  useEffect(() => {
    // Si le texte est trop court, on ne fait rien
    if (!searchQuery || searchQuery.length <= 2) return;

    setSearchLoading(true);

    // On crée un Timer : "Dans 500ms, lance la recherche"
    const delaySearch = setTimeout(async () => {
      console.log("🔎 Recherche lancée pour :", searchQuery);
      try {
        const results = await searchPlaces(searchQuery);
        setSearchResults(results);
      } catch (e) {
        console.error(e);
      } finally {
        setSearchLoading(false);
      }
    }, 500); // 500ms de délai (ajustable)

    // 🧹 NETTOYAGE MAGIQUE
    // Si 'searchQuery' change AVANT les 500ms (donc si tu tapes une autre lettre),
    // React exécute cette fonction de nettoyage qui ANNULE le timer précédent.
    return () => clearTimeout(delaySearch);

  }, [searchQuery]);

  // Sélection d'un lieu depuis la recherche
  const selectPlace = (place) => {
      setRecommendations([...recommendations, {
          id: Date.now(),
          category: recoCategory,
          name: place.name,
          address: place.address, 
          lat: place.lat,
          lon: place.lon
      }]);
      
      // Reset et fermeture modale
      setShowSearchModal(false);
      setSearchQuery('');
      setSearchResults([]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
          style={styles.container}
          contentContainerStyle={{ paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
      >
        {/* HEADER */}
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

        {/* 2. LIER VOL */}
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
            placeholder="Titre du voyage"
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

        {/* 4. RECOMMANDATIONS */}
        <Text style={styles.label}>Bonnes adresses</Text>
        
        <View style={styles.recoForm}>
          {/* Sélecteur Catégorie */}
          <View style={styles.catSelector}>
              {['food', 'visit', 'sleep'].map(cat => (
                  <TouchableOpacity 
                      key={cat} 
                      onPress={() => setRecoCategory(cat)}
                      style={[styles.catBtn, recoCategory === cat && styles.catBtnActive]}
                  >
                      <Ionicons name={getCategoryIcon(cat)} size={20} color={recoCategory === cat ? '#FFF' : '#666'} />
                  </TouchableOpacity>
              ))}
          </View>
          
          {/* Bouton qui ouvre la modale */}
          <TouchableOpacity 
              style={styles.searchTriggerBtn} 
              onPress={() => setShowSearchModal(true)}
          >
              <Ionicons name="search" size={20} color="#94A3B8" />
              <Text style={styles.searchTriggerText}>
                  Ajouter {recoCategory === 'food' ? 'un restaurant' : recoCategory === 'visit' ? 'un lieu' : 'un hôtel'}
              </Text>
          </TouchableOpacity>
        </View>

        {/* Liste des recos ajoutées */}
        <View style={styles.recoList}>
          {recommendations.map((item) => (
              <View key={item.id} style={styles.recoItem}>
                  <Ionicons name={getCategoryIcon(item.category)} size={16} color="#6050dc" />
                  <View style={{flex: 1, marginLeft: 10}}>
                      <Text style={styles.recoText}>{item.name}</Text>
                      {item.address && <Text style={{color:'#666', fontSize: 10}} numberOfLines={1}>{item.address}</Text>}
                  </View>
                  <TouchableOpacity onPress={() => setRecommendations(recommendations.filter(r => r.id !== item.id))}>
                      <Ionicons name="close-circle" size={20} color="#EF4444" />
                  </TouchableOpacity>
              </View>
          ))}
        </View>
        
        {/* --- MODALE DE RECHERCHE (C'est ici qu'elle doit être !) --- */}
        <Modal visible={showSearchModal} animationType="slide" presentationStyle="pageSheet">
            <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Recherche</Text>
                    <TouchableOpacity onPress={() => setShowSearchModal(false)}>
                        <Text style={styles.closeText}>Fermer</Text>
                    </TouchableOpacity>
                </View>

                <TextInput
                    style={styles.searchInput}
                    placeholder="Tapez un nom de lieu..."
                    placeholderTextColor="#666"
                    value={searchQuery}
                    onChangeText={handleSearch}
                    autoFocus
                />

                {searchLoading ? (
                    <ActivityIndicator style={{marginTop: 20}} color="#6050dc" />
                ) : (
                    <FlatList
                        data={searchResults}
                        keyExtractor={(item) => item.id}
                        keyboardShouldPersistTaps="handled"
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.resultItem} onPress={() => selectPlace(item)}>
                                <Ionicons name="location-outline" size={24} color="#fff" />
                                <View style={{marginLeft: 10, flex: 1}}>
                                    <Text style={styles.resultName}>{item.name}</Text>
                                    <Text style={styles.resultAddress} numberOfLines={1}>{item.address}</Text>
                                </View>
                                <Ionicons name="add-circle-outline" size={24} color="#6050dc" />
                            </TouchableOpacity>
                        )}
                    />
                )}
            </View>
        </Modal>

      </ScrollView>
    </KeyboardAvoidingView>
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
  inputDesc: { color: '#ccc', fontSize: 16, minHeight: 100, textAlignVertical: 'top' },
  
  catSelector: { flexDirection: 'row', gap: 10, marginBottom: 15, marginLeft: 20 },
  catBtn: { padding: 10, backgroundColor: '#1E293B', borderRadius: 8 },
  catBtnActive: { backgroundColor: '#6050dc' },
  
  // Bouton déclencheur de recherche
  searchTriggerBtn: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: '#1E293B', padding: 12, borderRadius: 8,
      borderWidth: 1, borderColor: '#334155', marginHorizontal: 20
  },
  searchTriggerText: { color: '#94A3B8', marginLeft: 10 },

  recoList: { paddingHorizontal: 20, marginTop: 15, marginBottom: 20 },
  recoItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', padding: 10, borderRadius: 8, marginBottom: 5 },
  recoText: { color: '#FFF', fontWeight: 'bold' },

  // Styles Modale
  modalContainer: { flex: 1, backgroundColor: '#0F172A', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, marginTop: 20 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  closeText: { color: '#6050dc', fontSize: 16, fontWeight: '600' },
  searchInput: { backgroundColor: '#1E293B', color: '#fff', padding: 15, borderRadius: 10, fontSize: 16, marginBottom: 15 },
  resultItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#334155' },
  resultName: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  resultAddress: { color: '#94A3B8', fontSize: 12, marginTop: 2 }
});