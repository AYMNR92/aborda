import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import {
  Gesture,
  GestureDetector
} from 'react-native-gesture-handler';
import {
  cancelAnimation,
  clamp,
  configureReanimatedLogger,
  useSharedValue,
  withClamp,
  withDecay
} from 'react-native-reanimated';
import { BoardingPassCard } from '../utils/BoardingPassCard.js';
import { formatDistance } from '../utils/distanceCalculator.js';

configureReanimatedLogger({
  strict: false, // Reanimated runs in strict mode by default
});

export const FlightsScreen = ({ boardingPasses }) => {
  const [listHeight, setListHeight] = useState(0);
  const { height: screenHeight } = useWindowDimensions();

  const navigation = useNavigation();

  const activeCardIndex = useSharedValue(null); // Index de la carte active (null si aucune)
  const totalKm = boardingPasses.reduce((sum, bp) => sum + (bp.distanceKm || 0), 0);
  const scrollY = useSharedValue(0); // Position du scroll vertical
  const maxScrollY = Math.max(0, (boardingPasses.length - 1) * 350); // Ajuste selon la hauteur des cartes

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
        {boardingPasses.map((bp, index) => (
          <BoardingPassCard
                  key={bp.id}
                  boardingPass={bp}
                  index={index}
                  scrollY={scrollY}
                  activeCardIndex={activeCardIndex}
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
  headerScanIcon : {
    fontWeight: 'bold',
    color: '#ffffffff',

    backgroundColor: '#eb8825ff',
    fontSize: 32,
    borderRadius: 20,
    paddingRight : 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#BFDBFE',
    marginTop: 4,
  },
  clearButton: {
    fontSize: 20,
    color: '#9CA3AF',
    padding: 4,
  },
  flightsList: {
    flex: 1,
    paddingHorizontal:20,
    //overflow: 'visible',
  },
  stackContainer: {
    paddingTop: 20,
  },
  stackedCardContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  absoluteCard: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  collapsedCard: {
    // Les cartes empilées sont tronquées
  },
  expandedCard: {
    // La carte expandée est complète
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyStateIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyStateTitle: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
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