import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import {
  Gesture,
  GestureDetector
} from 'react-native-gesture-handler';
import {
  cancelAnimation,
  clamp,
  configureReanimatedLogger,
  Easing,
  useSharedValue,
  withClamp,
  withDecay,
  withTiming
} from 'react-native-reanimated';
import { BoardingPassCard } from '../components/BoardingPassCard.js';
import { formatDistance } from '../utils/formatters.js';

configureReanimatedLogger({
  strict: false, // Reanimated runs in strict mode by default
});

export const FlightsScreen = ({ boardingPasses = [], onDelete }) => {
  const [listHeight, setListHeight] = useState(0);
  const { height: screenHeight } = useWindowDimensions();

  const navigation = useNavigation();

  const activeCardIndex = useSharedValue(null); // Index de la carte active (null si aucune)
  const totalKm = (boardingPasses || []).reduce((sum, bp) => sum + (bp.distanceKm || 0), 0);
  const scrollY = useSharedValue(0); // Position du scroll vertical
  const maxScrollY = Math.max(0, ((boardingPasses || []).length - 1) * 255); // Ajuste selon la hauteur des cartes

  const prevLengthRef = useRef((boardingPasses || []).length);

  const pan = Gesture.Pan()
    .minPointers(1)
    .maxPointers(1)
    .activeOffsetY([-8, 8]) // Active seulement sur gestes verticaux (scroll)
    .failOffsetX([-25, 25]) // Échoue si le geste est trop horizontal (laisse les cartes gérer)
    .onBegin(() => {
      // Si une carte est active, on ne scroll pas
      if (activeCardIndex.value !== null) return;
      cancelAnimation(scrollY);
    })
    .onChange((event) => {
      // Si une carte est active, on ne scroll pas
      if (activeCardIndex.value !== null) return;
      scrollY.value = clamp(scrollY.value - event.changeY, 0, maxScrollY);
    })
    .onEnd((event) => {
      // Si une carte est active, on ne scroll pas
      if (activeCardIndex.value !== null) return;
      scrollY.value = withClamp(
        { min: 0, max: maxScrollY },
        withDecay({
          velocity: -(event.velocityY * 2),
          deceleration: 0.998,
        }),
      );
    });

  useEffect(() => {
    // Si on a ajouté des éléments (longueur actuelle > longueur précédente)
    if ((boardingPasses || []).length > prevLengthRef.current) {
      // On attend un tout petit peu (300ms) que le rendu visuel et le calcul de hauteur (onLayout) soient finis
        // Calcul de la position cible (tout en bas)
        // On prend la hauteur totale de la liste - la hauteur de l'écran + une marge (ex: 200px)
        
      const targetY = ((boardingPasses || []).length - 2) * 255 +200;
      setTimeout(() => {
        // Animation fluide vers le bas
        scrollY.value = withTiming(targetY, {
          duration: 800, // Durée en ms (0.8s)
          easing: Easing.out(Easing.cubic), // Effet de ralentissement à la fin
        });
      }, 50);
    }

    // Mise à jour de la référence pour la prochaine fois
    prevLengthRef.current = (boardingPasses || []).length;
  }, [(boardingPasses || []).length]);

  return (
    
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vols</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Scanner')}>
          <Ionicons name="scan-outline" size={30} color="#6050dc" />
        </TouchableOpacity>
      </View>
      {/* Counter */}
      <View style={styles.selectionCounter}>
           <Text style={styles.counterText}>{formatDistance(totalKm)} km parcourus</Text>
      </View>
      <GestureDetector gesture={pan}>
      {/* Liste des vols empilés */}
      <View
        style={styles.flightsList} 
        onLayout={(event) => setListHeight(event.nativeEvent.layout.height)}
      >
        {(boardingPasses || []).map((bp, index) => (
          <BoardingPassCard
                  key={bp.id}
                  boardingPass={bp}
                  index={index}
                  scrollY={scrollY}
                  activeCardIndex={activeCardIndex}
                  onDelete={() => onDelete(bp.id)}
          />
        ))}
      </View>
      </GestureDetector>
    </View>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    backgroundColor: '#000000',
    marginHorizontal :20,
    marginBottom : 0, 
    paddingTop: 60,

    flexDirection : 'row',
    justifyContent : 'space-between',
    alignItems : 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  flightsList: {
    flex: 1,
    paddingHorizontal:20,
    //overflow: 'visible',
  },
  selectionCounter: {
    position: 'static',
    top:65,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom : 10, 
  },
  counterText: {
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '600',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
});