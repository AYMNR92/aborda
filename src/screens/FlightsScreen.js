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

// //         {/* Modal détails (long press) */}
// //         <Modal 
// //           visible={showDetailModal} 
// //           transparent 
// //           animationType="slide" 
// //           onRequestClose={() => setShowDetailModal(false)}
// //         >
// //           <View style={styles.modalBackdrop}>
// //             <View style={styles.modalCard}>
// //               <Text style={styles.modalTitle}>{selectedBoardingPass?.flightNumber || ''}</Text>
// //               <Text style={styles.modalSubtitle}>{selectedBoardingPass?.passengerName || ''}</Text>

// //               <TouchableOpacity
// //                 style={styles.modalCloseBtn}
// //                 onPress={() => setShowDetailModal(false)}
// //               >
// //                 <Text style={styles.modalCloseText}>Fermer</Text>
// //               </TouchableOpacity>
// //             </View>
// //           </View>
// //         </Modal>

// //       </View>
// //     </GestureHandlerRootView>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: '#F5F7FA',
// //   },
// //   header: {
// //     backgroundColor: '#2563EB',
// //     padding: 20,
// //     paddingTop: Platform.OS === 'ios' ? 60 : 40,
// //     paddingBottom: 20,
// //   },
// //   headerTitle: {
// //     fontSize: 32,
// //     fontWeight: 'bold',
// //     color: '#FFFFFF',
// //   },
// //   selectionCounter: {
// //     backgroundColor: '#FFFFFF',
// //     marginHorizontal: 16,
// //     marginTop: -10,
// //     marginBottom: 20,
// //     paddingVertical: 12,
// //     borderRadius: 12,
// //     alignItems: 'center',
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.1,
// //     shadowRadius: 4,
// //     elevation: 3,
// //   },
// //   counterText: {
// //     fontSize: 16,
// //     fontWeight: '700',
// //     color: '#2563EB',
// //   },
// //   scrollContent: {
// //     flexGrow: 1,
// //   },
// //   stackContainer: {
// //     position: 'relative',
// //     paddingHorizontal: CARD_MARGIN,
// //     minHeight: 600, // Hauteur minimale pour contenir les cartes empilées
// //   },
// //   cardWrapper: {
// //     position: 'absolute',
// //     left: CARD_MARGIN,
// //     right: CARD_MARGIN,
// //     top: 0,
// //   },
// //   expandedCardContainer: {
// //     transform: [{ scale: 1.02 }],
// //   },
// //   expandedCard: {
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 8 },
// //     shadowOpacity: 0.3,
// //     shadowRadius: 12,
// //     elevation: 12,
// //   },
// //   emptyState: {
// //     flex: 1,
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     paddingVertical: 80,
// //   },
// //   emptyStateTitle: {
// //     fontSize: 22,
// //     fontWeight: '700',
// //     color: '#1F2937',
// //     marginBottom: 8,
// //   },
// //   emptyStateSubtitle: {
// //     fontSize: 15,
// //     color: '#6B7280',
// //     textAlign: 'center',
// //   },
  
// //   // Modal styles
// //   modalBackdrop: {
// //     flex: 1,
// //     backgroundColor: 'rgba(0, 0, 0, 0.6)',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     padding: 20,
// //   },
// //   modalCard: {
// //     backgroundColor: '#FFFFFF',
// //     borderRadius: 24,
// //     padding: 32,
// //     width: '90%',
// //     maxWidth: 400,
// //   },
// //   modalTitle: {
// //     fontSize: 26,
// //     fontWeight: 'bold',
// //     color: '#1F2937',
// //     marginBottom: 8,
// //     textAlign: 'center',
// //   },
// //   modalSubtitle: {
// //     fontSize: 18,
// //     color: '#6B7280',
// //     marginBottom: 24,
// //     textAlign: 'center',
// //   },
// //   modalCloseBtn: {
// //     backgroundColor: '#2563EB',
// //     padding: 16,
// //     borderRadius: 12,
// //     alignItems: 'center',
// //   },
// //   modalCloseText: {
// //     color: '#FFFFFF',
// //     fontSize: 17,
// //     fontWeight: '700',
// //   },
// // });

// import { useState } from 'react';
// import { Dimensions, StyleSheet, Text, View } from 'react-native';
// import Animated, {
//   interpolate,
//   useAnimatedScrollHandler,
//   useAnimatedStyle,
//   useSharedValue
// } from 'react-native-reanimated';
// import { BoardingPassCard } from '../utils/BoardingPassCard.js';

// const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// // CONFIGURATION DE L'APPARENCE
// const CARD_HEIGHT = 220; // Hauteur totale de ta carte
// const VISIBLE_HEIGHT = 80; // Ce qu'on voit de la carte quand elle est recouverte (le haut)

// const AnimatedFlightCard = ({ item, index, scrollY, onPress }) => {
//   // La position Y théorique de la carte dans la liste
//   const positionY = index * VISIBLE_HEIGHT;

//   const animatedStyle = useAnimatedStyle(() => {
//     // STICKY EFFECT :
//     // Si on a scrollé plus bas que la position de la carte, on la force à rester en haut (y=0 relatif à l'écran)
//     // Le scrollY.value représente combien on a descendu dans la liste.
    
//     const isSticking = scrollY.value > positionY;
    
//     const translateY = isSticking
//       ? scrollY.value - positionY // On annule le scroll pour qu'elle reste fixe
//       : 0;

//     // SCALE EFFECT (Optionnel) :
//     // Pour donner l'impression qu'elle part un peu au fond quand elle est recouverte
//     const scale = interpolate(
//       scrollY.value,
//       [positionY, positionY + VISIBLE_HEIGHT], // Pendant que la suivante passe dessus
//       [1, 0.94], // Elle réduit légèrement
//       { extrapolateRight: 'clamp' }
//     );

//     // OPACITÉ (Optionnel) : 
//     // Assombrir un peu la carte quand elle est sticky pour le focus sur la nouvelle
//     const opacity = interpolate(
//         scrollY.value,
//         [positionY, positionY + 300],
//         [1, 0.6], // Devient un peu transparente si elle est très loin haut
//         { extrapolateRight: 'clamp' }
//     );

//     return {
//       transform: [
//         { translateY }, 
//         { scale }
//       ],
//       // Z-INDEX :
//       // Plus l'index est grand, plus c'est au dessus. C'est le comportement par défaut,
//       // mais on le force ici pour être sûr.
//       zIndex: index, 
//       opacity: isSticking ? opacity : 1,
//     };
//   });

//   return (
//     <Animated.View style={[styles.cardWrapper, animatedStyle]}>
//       <BoardingPassCard 
//         boardingPass={item} 
//         onPress={onPress}
//       />
//     </Animated.View>
//   );
// };

// export const FlightsScreen = ({ boardingPasses }) => {
//   const [selectedBoardingPass, setSelectedBoardingPass] = useState(null);
//   const [showDetailModal, setShowDetailModal] = useState(false);

//   const scrollY = useSharedValue(0);

//   const scrollHandler = useAnimatedScrollHandler((event) => {
//     scrollY.value = event.contentOffset.y;
//   });

//   const handleCardPress = (boardingPass) => {
//     setSelectedBoardingPass(boardingPass);
//     setShowDetailModal(true);
//   };

//   // Ton header existant (simplifié pour l'exemple)
//   const ListHeader = () => (
//     <View style={styles.headerContainer}>
//         <Text style={styles.headerTitle}>Mes Vols</Text>
//         <Text style={styles.subTitle}>{boardingPasses.length} billets</Text>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <Animated.FlatList
//         data={boardingPasses}
//         keyExtractor={(item) => item.id}
//         onScroll={scrollHandler}
//         scrollEventThrottle={16}
//         ListHeaderComponent={ListHeader}
//         // Marge en bas pour pouvoir scroller jusqu'à la dernière carte entièrement
//         contentContainerStyle={{ paddingBottom: SCREEN_HEIGHT / 2 }}
//         showsVerticalScrollIndicator={false}
//         renderItem={({ item, index }) => (
//           <AnimatedFlightCard 
//             item={item} 
//             index={index} 
//             scrollY={scrollY}
//             onPress={() => handleCardPress(item)}
//           />
//         )}
//       />

//      {/* Ton modal reste inchangé */}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F2F2F7',
//   },
//   headerContainer: {
//     paddingTop: 60,
//     paddingBottom: 20,
//     paddingHorizontal: 20,
//     zIndex: 100, // Le header doit être au dessus de tout
//     backgroundColor: '#F2F2F7',
//   },
//   headerTitle: {
//     fontSize: 34,
//     fontWeight: 'bold',
//     color: '#000',
//   },
//   subTitle: {
//     fontSize: 16,
//     color: 'gray',
//     marginTop: 5
//   },
//   cardWrapper: {
//     height: CARD_HEIGHT, // La vue fait la taille totale de la carte
//     marginBottom: -(CARD_HEIGHT - VISIBLE_HEIGHT), // C'EST ICI QUE LA MAGIE OPÈRE
//     // Ex: Si carte = 220 et visible = 80. MarginBottom = -140.
//     // La carte suivante commencera donc 140px "dans" celle-ci, ne laissant dépasser que les 80px du haut.
    
//     justifyContent: 'flex-start',
//     alignItems: 'center',
//     // Pas de background ici, c'est la carte qui l'a
//   },
// });

import { useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
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
// // Active les animations sur Android
// if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
//   UIManager.setLayoutAnimationEnabledExperimental(true);
// }

configureReanimatedLogger({
  strict: false, // Reanimated runs in strict mode by default
});

export const FlightsScreen = ({ boardingPasses }) => {
  const [listHeight, setListHeight] = useState(0);
  const { height: screenHeight } = useWindowDimensions();

  const activeCardIndex = useSharedValue(null); // Index de la carte active (-1 si aucune)

  const scrollY = useSharedValue(0); // Position du scroll vertical
  const maxScrollY = (boardingPasses.length-1) * 350; // Ajuste selon la hauteur des cartes et de l'écran

  const pan = Gesture.Pan()
    .onBegin(() => {
      cancelAnimation(scrollY);
    })
    .onStart(() => {
      console.log("paquet");
    })
    .onChange((event) => {
      scrollY.value = clamp(scrollY.value - event.changeY, 0, maxScrollY);
    })
    .onEnd((event) => {
      scrollY.value = withClamp(
        {min: 0, max: maxScrollY},
        withDecay({
          velocity: -(event.velocityY *1.5),
          deceleration: 0.998,
        }),
      );
    });

  return (
    
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vols</Text>
        
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
    padding: 20,
    paddingTop: 60,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
});