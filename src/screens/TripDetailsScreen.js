import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Image,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View
} from 'react-native';
import { SaveToListModal } from '../components/SaveToListModal'; // 👈 IMPORT DU NOUVEAU COMPOSANT

// Active l'animation sur Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- COMPOSANT TIROIR (ACCORDION) ---
// On ajoute la prop "onAdd" pour gérer le clic sur le bouton +
const AccordionItem = ({ title, icon, color, items, onAdd }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  if (!items || items.length === 0) return null;

  return (
    <View style={styles.accordionContainer}>
      <TouchableOpacity style={styles.accordionHeader} onPress={toggleExpand} activeOpacity={0.7}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
            <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon} size={20} color={color} />
            </View>
            <Text style={styles.accordionTitle}>{title} ({items.length})</Text>
        </View>
        <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={20} color="#94A3B8" />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.accordionContent}>
          {items.map((item, index) => (
            <View key={index} style={styles.recoRow}>
               {/* INFO DU LIEU (A GAUCHE) */}
               <View style={{flex: 1, marginRight: 10}}>
                   <Text style={styles.recoName}>{item.name}</Text>
                   {item.note ? <Text style={styles.recoNote}>"{item.note}"</Text> : null}
               </View>

               {/* BOUTON AJOUTER (A DROITE) */}
               <TouchableOpacity onPress={() => onAdd(item.id)} hitSlop={10}>
                   <Ionicons name="add-circle-outline" size={28} color="#6050dc" />
               </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

// --- ÉCRAN PRINCIPAL ---
export const TripDetailsScreen = ({ route, navigation }) => {
  const { trip } = route.params;
  const recos = trip.recommendations || [];

  // Gestion de la modale d'ajout
  const [selectedRecoId, setSelectedRecoId] = useState(null);

  // Filtrer les recos par catégorie
  const foods = recos.filter(r => r.category === 'food');
  const visits = recos.filter(r => r.category === 'visit');
  const sleeps = recos.filter(r => r.category === 'sleep');

  return (
    <View style={{flex: 1}}>
      <ScrollView style={styles.container}>
        
        {/* Header Image */}
        <View style={styles.imageContainer}>
          {trip.photos && trip.photos.length > 0 ? (
             <Image source={{ uri: trip.photos[0] }} style={styles.coverImage} />
          ) : (
             <View style={[styles.coverImage, {backgroundColor:'#333'}]} />
          )}
          
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          
          <View style={styles.headerOverlay}>
              <Text style={styles.tripTitle}>{trip.title}</Text>
              <Text style={styles.tripLocation}>{trip.location}</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Description */}
          <Text style={styles.sectionTitle}>À propos</Text>
          <Text style={styles.description}>{trip.description}</Text>

          {/* Section Carnet d'adresses */}
          <Text style={[styles.sectionTitle, { marginTop: 30, marginBottom: 15 }]}>Carnet d'adresses 📒</Text>
          
          {/* On passe la fonction setSelectedRecoId à chaque accordéon */}
          <AccordionItem 
              title="Où manger ?" 
              icon="restaurant" 
              color="#F59E0B" 
              items={foods} 
              onAdd={(id) => setSelectedRecoId(id)}
          />
          <AccordionItem 
              title="À visiter" 
              icon="camera" 
              color="#10B981" 
              items={visits} 
              onAdd={(id) => setSelectedRecoId(id)}
          />
          <AccordionItem 
              title="Où dormir ?" 
              icon="bed" 
              color="#6366F1" 
              items={sleeps} 
              onAdd={(id) => setSelectedRecoId(id)}
          />
          
          {/* Espace en bas pour le scroll */}
          <View style={{height: 50}} />
        </View>
      </ScrollView>

      {/* MODALE D'AJOUT AUX LISTES */}
      <SaveToListModal 
         visible={!!selectedRecoId} // Visible si un ID est sélectionné
         recommendationId={selectedRecoId}
         onClose={() => setSelectedRecoId(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  imageContainer: { height: 350, position: 'relative' },
  coverImage: { width: '100%', height: '100%' },
  backBtn: { position: 'absolute', top: 50, left: 20, backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 20, zIndex: 10 },
  headerOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: 'rgba(0,0,0,0.4)' },
  tripTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFF' },
  tripLocation: { fontSize: 16, color: '#E2E8F0' },
  
  content: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF', marginBottom: 10 },
  description: { fontSize: 15, color: '#94A3B8', lineHeight: 24 },

  // Accordion Styles
  accordionContainer: { marginBottom: 15, backgroundColor: '#1E293B', borderRadius: 12, overflow: 'hidden' },
  accordionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15 },
  iconBox: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  accordionTitle: { fontSize: 16, fontWeight: '600', color: '#FFF' },
  
  accordionContent: { paddingHorizontal: 15, paddingBottom: 5 }, // Padding ajusté
  
  // Style d'une ligne de recommandation (modifié pour le bouton)
  recoRow: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center', // Centrer verticalement le texte et le bouton
      paddingVertical: 12, 
      borderTopWidth: 1, 
      borderTopColor: '#334155' 
  },
  recoName: { fontSize: 15, color: '#E2E8F0', fontWeight: '600' },
  recoNote: { fontSize: 13, color: '#94A3B8', marginTop: 4, fontStyle: 'italic' }
});