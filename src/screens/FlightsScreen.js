// // // FlightsScreen.js
// // import { useMemo, useState } from 'react';
// // import {
// //   Dimensions,
// //   LayoutAnimation,
// //   Modal,
// //   Platform,
// //   StyleSheet,
// //   Text,
// //   TouchableOpacity,
// //   UIManager,
// //   View,
// // } from 'react-native';
// // import { GestureHandlerRootView, Pressable } from 'react-native-gesture-handler';
// // import Animated, {
// //   interpolate,
// //   useAnimatedScrollHandler,
// //   useAnimatedStyle,
// //   useSharedValue,
// // } from 'react-native-reanimated';
// // import { BoardingPassCard } from '../utils/BoardingPassCard.js';
// // import { formatDistance } from '../utils/distanceCalculator.js';

// // if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
// //   UIManager.setLayoutAnimationEnabledExperimental(true);
// // }

// // const { width: SCREEN_WIDTH } = Dimensions.get('window');

// // // Constants : ajuste la hauteur/espacement à ton design
// // const CARD_HEIGHT = 200;       // hauteur visible de la carte
// // const CARD_MARGIN = 16;
// // const STACK_OFFSET = 48;       // combien chaque carte "déborde" vers le haut
// // const VISIBLE_CARDS = 6;       // nombre max de cartes à empiler pour performance

// // // Composant séparé pour chaque carte afin d'utiliser les hooks correctement
// // const StackedCard = ({ item, index, stackLength, scrollY, expandedCard, onToggleExpand, onLongPress }) => {
// //   const zIndexBase = (stackLength - index) * 10;

// //   // animated style calculé via scrollY + index
// //   const animatedStyle = useAnimatedStyle(() => {
// //     // Parallax léger lié au scroll : les cartes de fond bougent moins
// //     const parallax = interpolate(
// //       scrollY.value,
// //       [0, CARD_HEIGHT * Math.max(1, index)],
// //       [0, -index * 6],
// //       "clamp"
// //     );

// //     // Scale progressif selon profondeur (les cartes en arrière sont légèrement plus petites)
// //     const scale = interpolate(index, [0, 6], [1.00, 0.92], "clamp");
// //     // Opacité pour donner de la profondeur
// //     const opacity = interpolate(index, [0, 6], [1, 0.65], "clamp");

// //     return {
// //       transform: [
// //         { translateY: parallax },
// //         { scale: scale },
// //       ],
// //       opacity,
// //     };
// //   });

// //   const isExpanded = expandedCard === item.id;
  
// //   // Position de base pour l'empilement
// //   const baseTop = index * STACK_OFFSET;
  
// //   const containerDynamic = {
// //     top: baseTop,
// //     zIndex: isExpanded ? 9999 : zIndexBase,
// //     elevation: isExpanded ? 9999 : zIndexBase,
// //     marginTop: isExpanded ? 10 : 0,
// //   };

// //   return (
// //     <Animated.View
// //       style={[
// //         styles.cardWrapper,
// //         containerDynamic,
// //         animatedStyle,
// //       ]}
// //       pointerEvents={isExpanded ? 'auto' : 'box-none'}
// //     >
// //       <Pressable
// //         onPress={() => onToggleExpand(item.id)}
// //         onLongPress={() => onLongPress(item)}
// //         delayLongPress={260}
// //       >
// //         <View style={isExpanded ? styles.expandedCardContainer : undefined}>
// //           <BoardingPassCard
// //             boardingPass={item}
// //             style={isExpanded ? styles.expandedCard : undefined}
// //           />
// //         </View>
// //       </Pressable>
// //     </Animated.View>
// //   );
// // };

// // export const FlightsScreen = ({ boardingPasses }) => {
// //   // --- états UI classiques (comme ta version) ---
// //   const [searchQuery, setSearchQuery] = useState('');
// //   const [selectedBoardingPass, setSelectedBoardingPass] = useState(null);
// //   const [showDetailModal, setShowDetailModal] = useState(false);
// //   const [expandedCard, setExpandedCard] = useState(null);

// //   // --- données filtrées (comme avant) ---
// //   const filteredFlights = useMemo(() => {
// //     const q = searchQuery.toLowerCase();
// //     return boardingPasses.filter((bp) => {
// //       return (
// //         bp.airline.toLowerCase().includes(q) ||
// //         bp.flightNumber.toLowerCase().includes(q) ||
// //         bp.origin.toLowerCase().includes(q) ||
// //         bp.destination.toLowerCase().includes(q) ||
// //         bp.passengerName.toLowerCase().includes(q)
// //       );
// //     });
// //   }, [boardingPasses, searchQuery]);

// //   // on veut la carte la plus récente en bas & front -> reverse la data
// //   const stackData = useMemo(() => filteredFlights.slice().reverse(), [filteredFlights]);

// //   const totalKm = boardingPasses.reduce((sum, bp) => sum + (bp.distanceKm || 0), 0);

// //   // Shared value pour la position du scroll vertical
// //   const scrollY = useSharedValue(0);

// //   // Animated scroll handler -> inertie native conservée
// //   const onScroll = useAnimatedScrollHandler((event) => {
// //     scrollY.value = event.contentOffset.y;
// //   });

// //   // Toggle expand/retract avec animation Layout pour simplicité
// //   const toggleCardExpansion = (cardId) => {
// //     LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
// //     setExpandedCard(prev => (prev === cardId ? null : cardId));
// //   };

// //   const handleLongPress = (bp) => {
// //     setSelectedBoardingPass(bp);
// //     setShowDetailModal(true);
// //   };

// //   return (
// //     <GestureHandlerRootView style={{ flex: 1 }}>
// //       <View style={styles.container}>

// //         {/* Header */}
// //         <View style={styles.header}>
// //           <Text style={styles.headerTitle}>Mes Vols</Text>
// //         </View>

// //         {/* Counter */}
// //         <View style={styles.selectionCounter}>
// //           <Text style={styles.counterText}>{formatDistance(totalKm)} km parcourus</Text>
// //         </View>

// //         {/* EmptyState */}
// //         {stackData.length === 0 ? (
// //           <View style={styles.emptyState}>
// //             <Text style={styles.emptyStateTitle}>
// //               {searchQuery ? 'Aucun résultat' : "Aucun vol pour l'instant"}
// //             </Text>
// //             <Text style={styles.emptyStateSubtitle}>
// //               {searchQuery ? 'Essayez une autre recherche' : "Scannez votre première carte d'embarquement"}
// //             </Text>
// //           </View>
// //         ) : (
// //           // Animated ScrollView vertical : onScroll lie scrollY shared value
// //           <Animated.ScrollView
// //             onScroll={onScroll}
// //             scrollEventThrottle={16}
// //             showsVerticalScrollIndicator={false}
// //             contentContainerStyle={styles.scrollContent}
// //           >
// //             {/* Spacer en haut pour laisser respirer */}
// //             <View style={{ height: 32 }} />

// //             {/* Le conteneur absolu pour empiler les cartes */}
// //             <View style={styles.stackContainer}>
// //               {stackData.map((item, idx) => (
// //                 <StackedCard
// //                   key={item.id}
// //                   item={item}
// //                   index={idx}
// //                   stackLength={stackData.length}
// //                   scrollY={scrollY}
// //                   expandedCard={expandedCard}
// //                   onToggleExpand={toggleCardExpansion}
// //                   onLongPress={handleLongPress}
// //                 />
// //               ))}
// //             </View>

// //             {/* Spacer en bas pour que la dernière carte puisse se voir correctement */}
// //             <View style={{ height: 160 }} />
// //           </Animated.ScrollView>
// //         )}


import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import {
  Gesture,
  GestureDetector
} from 'react-native-gesture-handler';
import {
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

  const activeCardIndex = useSharedValue(0); // Index de la carte active (-1 si aucune)
  const totalKm = boardingPasses.reduce((sum, bp) => sum + (bp.distanceKm || 0), 0);
  const scrollY = useSharedValue(0); // Position du scroll vertical
  const maxScrollY = (boardingPasses.length-1) * 350; // Ajuste selon la hauteur des cartes et de l'écran

  const pan = Gesture.Pan()
    .onBegin(() => {
    console.log("begin : " + activeCardIndex.value);
      if (activeCardIndex.value !== null) return;
      //cancelAnimation(scrollY);
    })
    .onStart(() => {
       console.log("change : " + activeCardIndex.value);
      if (activeCardIndex.value !== null) return;
      console.log("paquet");
    })
    .onChange((event) => {
      if (activeCardIndex.value !== null) return;
      if (activeCardIndex.value === null) scrollY.value = clamp(scrollY.value - event.changeY, 0, maxScrollY);
    })
    .onEnd((event) => {
      if (activeCardIndex.value !== null) return;
      if (activeCardIndex.value === null) {
        scrollY.value = withClamp(
          {min: 0, max: maxScrollY},
          withDecay({
            velocity: -(event.velocityY *1.5),
            deceleration: 0.998,
          }),
        );
      }
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