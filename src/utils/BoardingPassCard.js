import { useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  clamp,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { AirlineLogo } from '../utils/AirlineLogo.js';
import { getAirlineName } from './airlines.js';

export const BoardingPassCard = ({ boardingPass, index, scrollY, activeCardIndex}) => {
  // Couleur de la compagnie (ou bleu par défaut)
  const bgColor = boardingPass.bgColor || '#E5E7EB';
  
  // Fonction pour obtenir la couleur de texte (blanc ou noir selon luminosité du fond)
  const getTextColor = (hexColor) => {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155 ? '#000000' : '#FFFFFF';
  };

  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const textColor = getTextColor(bgColor);

  const tiltX = useSharedValue(0);
  const tiltY = useSharedValue(0);
  const isPressed = useSharedValue(false);

  const [cardHeight, setCardHeight] = useState(0);
  const translateY = useSharedValue(0);

  const tap = Gesture.Tap()
  .onBegin(() => {
    // si tu scroll en même temps → empêche l’ouverture
    if (activeCardIndex.value !== null && activeCardIndex.value !== index) {
      return;
    }
  })
  .onEnd(() => {
    //console.log("Dans bp : " + activeCardIndex.value);
    if (activeCardIndex.value === null) {
      activeCardIndex.value = index;
    } else {
      activeCardIndex.value = null;
    }
  });

  const panGesture = Gesture.Pan()
    .onStart(() => {
      //console.log("Dans bp : " + activeCardIndex.value);
      if (activeCardIndex.value === index) isPressed.value = true;
    })
    .onUpdate((event) => {
      if (activeCardIndex.value === index) {
        const maxTilt = 15; // degrés max
        tiltY.value = clamp(event.translationX / 10, -maxTilt, maxTilt);
        tiltX.value = clamp(-event.translationY / 10, -maxTilt, maxTilt);
      }
    })
    .onEnd(() => {
      if (activeCardIndex.value === index) {
        tiltX.value = 0;
        tiltY.value = 0;
        isPressed.value = false;
      }
    });

  const composedGesture = Gesture.Simultaneous(tap, panGesture);
  const {height: screenHeight} = useWindowDimensions();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { perspective: 1000 },
        { rotateX: `${tiltX.value}deg` },
        { rotateY: `${tiltY.value}deg` },
        { scale: isPressed.value ? 1.02 : 1 },
      ],
    };
  });

  useAnimatedReaction(
    () => scrollY.value,
    (current) => {
      translateY.value = clamp(-current, -index * cardHeight, 0);
    }
  );

  useAnimatedReaction(
    () => activeCardIndex.value,
    (current, previous) => {
      if (current === previous) return;

      if(activeCardIndex.value === null) {
        translateY.value = withTiming(
          clamp(-scrollY.value,-index * cardHeight ,0)
        );
      } 
      //si c'est cette carte qui devient active -> la monter en haut
      else if (activeCardIndex.value === index) {
        translateY.value = withTiming(-index * cardHeight, 
        { easing: Easing.out(Easing.quad), duration: 400 });
      } 
      //si une autre carte devient active -> la descendre un peu
      else {
        translateY.value = withTiming(-index * cardHeight * 0.9 + screenHeight * 0.7, 
          { easing: Easing.out(Easing.quad) , duration: 400 }
        );
      }
    }
  );

  return (
    <GestureDetector gesture={composedGesture}>
    <Animated.View
        source={boardingPass}
        style={[styles.cardWrapper,
          { transform: [{ translateY: translateY }] },
          animatedStyle
        ]}
        onLayout={(event) => setCardHeight(event.nativeEvent.layout.height)}
    >
      <View style={[styles.card, { backgroundColor: bgColor }]}>
      {/* Header : Compagnie + Numéro de vol*/}
        <View style={styles.header}>
        <View style={styles.headerLeft}>
          {/* Logo de la compagnie */}
          <AirlineLogo 
            iataCode={boardingPass.airline} 
            size={40}
          />
          <View>
            <Text style={[styles.airlineName, { color: textColor }]}>
              {getAirlineName(boardingPass.airline)}
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text style={[styles.flightNumber, { color: textColor }]}>
            {boardingPass.airline} {boardingPass.flightNumber}
          </Text>
        </View>
      </View>

      {/* Route principale : ORIGINE → DESTINATION */}
      <View style={styles.routeSection}>
        <View style={styles.cityBlock}>
          <Text style={[styles.cityName, { color: textColor, opacity: 0.8 }]}>
            {boardingPass.originCity || boardingPass.origin}
          </Text>
          <Text style={[styles.iataCode, { color: textColor }]}>
            {boardingPass.origin}
          </Text>
        </View>

        <View style={[styles.arrowContainer]}>
          <Text style={[styles.planeIcon, { color: textColor }]}>✈</Text>
        </View>

        <View style={styles.cityBlock}>
          <Text style={[styles.cityName, { color: textColor, opacity: 0.8 }]}>
            {boardingPass.destCity || boardingPass.destination}
          </Text>
          <Text style={[styles.iataCode, { color: textColor }]}>
            {boardingPass.destination}
          </Text>
        </View>
      </View>

      {/* Nom du passager */}
      <View style={styles.passengerSection}>
        <Text style={[styles.passengerName, { color: textColor }]}>
          {boardingPass.passengerName.replace("/", " ")}
        </Text>
      </View>

      {/* Grille d'informations : DATE / PNR / CLASS / SEAT */}
      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: textColor, opacity: 0.7 }]}>
            DATE
          </Text>
          <Text style={[styles.detailValue, { color: textColor }]}>
            {boardingPass.date}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: textColor, opacity: 0.7 }]}>
            SEAT
          </Text>
          <Text style={[styles.detailValue, { color: textColor }]}>
            {boardingPass.seatNumber || '-'}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: textColor, opacity: 0.7 }]}>
            CLASS
          </Text>
          <Text style={[styles.detailValue, { color: textColor }]}>
            {boardingPass.travelClass}
          </Text>
        </View>
        
      </View>

      {/* Footer : Tap to view details */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: textColor, opacity: 0.6 }]}>
          Tap to view full details
        </Text>
      </View>

      </View>
    </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    width: '100%',
  },
  card: {
    height: 350,
    borderRadius: 10,
    borderColor: '#00000027',
    borderWidth: 1,
    padding: 24,
    marginBottom: 0,
    marginHorizontal: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'visible',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  airlineName: {
    fontSize: 16,
    fontWeight: '600',
  },
  airlineCode: {
    fontSize: 11,
    marginTop: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,

  },
  flightNumber: {
    fontSize: 16,
    fontWeight: '700',
  },
  date: {
    fontSize: 11,
    marginTop: 2,
  },

  // Route Section
  routeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: -50,
    marginBottom: 25,
  },
  cityBlock: {
    flex: 1,
    alignItems: 'center',
  },
  cityName: {
    fontSize: 10,
    fontWeight: '',
    marginBottom: 3,
    textTransform: 'uppercase',
    textAlign: 'center',
    
  },
  iataCode: {
    fontSize: 48,
    fontFamily: 'Inter_400Regular',
    letterSpacing: -1,
  },
  arrowContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },

  planeIcon: {
    fontSize: 24,
  },

  // Passenger
  passengerSection: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  passengerName: {
    fontSize: 25,
    fontFamily: 'Inter_500Medium',
  },


  // Details Grid
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    opacity: 0.7,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Footer
  footer: {
    alignItems: 'center',
    marginTop: 8,
  },
  footerText: {
    fontSize: 11,
    fontWeight: '500',
  },
});


// import { useState } from 'react';
// import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
// import { Gesture, GestureDetector } from 'react-native-gesture-handler';
// import Animated, {
//   Easing,
//   Extrapolate,
//   clamp,
//   interpolate,
//   useAnimatedReaction,
//   useAnimatedStyle,
//   useSharedValue,
//   withSpring,
//   withTiming
// } from 'react-native-reanimated';
// import { AirlineLogo } from '../utils/AirlineLogo.js';
// import { getAirlineName } from './airlines.js';

// // --- CONFIGURATION DU TILT 3D ---
// const TILT_MAX_DEG = 10; // Angle max de rotation
// const SPRING_CONFIG = {
//   damping: 15,
//   stiffness: 150,
//   mass: 1
// };

// export const BoardingPassCard = ({ boardingPass, index, scrollY, activeCardIndex }) => {
//   // --- 1. GESTION DES COULEURS (Inchangé) ---
//   const bgColor = boardingPass.bgColor || '#E5E7EB';
  
//   const getTextColor = (hexColor) => {
//     if (!hexColor) return '#000';
//     const r = parseInt(hexColor.slice(1, 3), 16);
//     const g = parseInt(hexColor.slice(3, 5), 16);
//     const b = parseInt(hexColor.slice(5, 7), 16);
//     const brightness = (r * 299 + g * 587 + b * 114) / 1000;
//     return brightness > 155 ? '#000000' : '#FFFFFF';
//   };
//   const textColor = getTextColor(bgColor);

//   // --- 2. STATES & SHARED VALUES ---
//   const [layout, setLayout] = useState({ width: 0, height: 0 }); // On a besoin de width ET height
//   const translateY = useSharedValue(0);
  
//   // Pour le Tilt 3D
//   const touchX = useSharedValue(0);
//   const touchY = useSharedValue(0);
//   const isPressed = useSharedValue(false);

//   const { height: screenHeight } = useWindowDimensions();


//   // --- 3. LOGIQUE DE SCROLL & EMPILEMENT (Ton code original) ---
//   useAnimatedReaction(
//     () => scrollY.value,
//     (current) => {
//       // Si une carte est active, on ne touche plus au translateY via le scroll
//       if (activeCardIndex.value !== null) return;
      
//       // On utilise la hauteur mesurée ou une valeur par défaut de 200
//       const h = layout.height || 200;
//       translateY.value = clamp(-current, -index * h, 0);
//     }
//   );

//   useAnimatedReaction(
//     () => activeCardIndex.value,
//     (current, previous) => {
//       if (current === previous) return;
//       const h = layout.height || 200;

//       if (activeCardIndex.value === null) {
//         // Retour à la liste
//         translateY.value = withTiming(
//           clamp(-scrollY.value, -index * h, 0),
//           { duration: 400, easing: Easing.out(Easing.quad) }
//         );
//       } 
//       else if (activeCardIndex.value === index) {
//         // Carte active monte
//         translateY.value = withTiming(-index * h, 
//           { easing: Easing.out(Easing.quad), duration: 400 }
//         );
//       } 
//       else {
//         // Les autres descendent
//         translateY.value = withTiming(-index * h * 0.9 + screenHeight * 0.7, 
//           { easing: Easing.out(Easing.quad), duration: 400 }
//         );
//       }
//     }
//   );

//   // --- 4. GESTES (Tap + Pan pour le Tilt) ---

//   const tap = Gesture.Tap()
//     .onBegin(() => {
//        isPressed.value = true;
//        // Empêche l'ouverture si on scrolle fort (optionnel, selon ton besoin)
//        // if (activeCardIndex.value !== null && activeCardIndex.value !== index) return;
//     })
//     .onEnd(() => {
//       if (activeCardIndex.value === null) {
//         activeCardIndex.value = index;
//       } else {
//         activeCardIndex.value = null;
//       }
//     })
//     .onFinalize(() => {
//        isPressed.value = false;
//     });

//   // const pan = Gesture.Pan()
//   //   .onBegin((e) => {
//   //     if (layout.width === 0 || layout.height === 0) return;
//   //     // Normalisation : 0 = centre, -1 = gauche/haut, 1 = droite/bas
//   //     touchX.value = (e.x / layout.width) * 2 - 1;
//   //     touchY.value = (e.y / layout.height) * 2 - 1;
//   //   })
//   //   .onChange((e) => {
//   //     if (layout.width === 0 || layout.height === 0) return;
//   //     touchX.value = (e.x / layout.width) * 2 - 1;
//   //     touchY.value = (e.y / layout.height) * 2 - 1;
//   //   })
//   //   .onFinalize(() => {
//   //     // Retour au centre avec effet ressort
//   //     touchX.value = withSpring(0, SPRING_CONFIG);
//   //     touchY.value = withSpring(0, SPRING_CONFIG);
//   //   });

//   // Combine les gestes pour qu'ils marchent ensemble
//   //const gesture = Gesture.Simultaneous(pan, tap);

//   // --- 5. STYLES ANIMÉS ---

//   // A. Style du Wrapper (Position verticale dans la pile)
//   const animatedWrapperStyle = useAnimatedStyle(() => ({
//     transform: [{ translateY: translateY.value }],
//     zIndex: activeCardIndex.value === index ? 999 : index, // Gestion du Z-Index ici
//   }));

//   // B. Style de la Carte (Effet 3D Tilt)
//   const animatedTiltStyle = useAnimatedStyle(() => {
//     const rotateY = interpolate(touchX.value, [-1, 1], [-TILT_MAX_DEG, TILT_MAX_DEG], Extrapolate.CLAMP);
//     // Inversion de Y pour X : si je touche en haut (-1), je veux que le haut recule (rotation positive)
//     const rotateX = interpolate(touchY.value, [-1, 1], [TILT_MAX_DEG, -TILT_MAX_DEG], Extrapolate.CLAMP);

//     return {
//       transform: [
//         { perspective: 1000 }, // Indispensable pour la 3D
//         { rotateX: `${rotateX}deg` },
//         { rotateY: `${rotateY}deg` },
//         { scale: withSpring(isPressed.value ? 0.98 : 1, SPRING_CONFIG) } // Petit effet de press
//       ]
//     };
//   });


//   // --- 6. RENDER ---
//   return (
//     // CONTENEUR EXTERNE : Gère l'empilement (TranslateY)
//     <Animated.View
//       style={[styles.cardWrapper, animatedWrapperStyle]}
//       onLayout={(event) => setLayout({
//         width: event.nativeEvent.layout.width,
//         height: event.nativeEvent.layout.height
//       })}
//     >
//       <GestureDetector gesture={tap}>
//         {/* CONTENEUR INTERNE : Gère le Tilt 3D */}
//         <Animated.View style={[styles.card, { backgroundColor: bgColor }, animatedTiltStyle]}>
          
//           {/* ... TON CONTENU VISUEL IDENTIQUE ... */}
          
//           {/* Header */}
//           <View style={styles.header}>
//             <View style={styles.headerLeft}>
//               <AirlineLogo iataCode={boardingPass.airline} size={40} />
//               <View style={{marginLeft: 10}}>
//                 <Text style={[styles.airlineName, { color: textColor }]}>
//                   {getAirlineName(boardingPass.airline)}
//                 </Text>
//               </View>
//             </View>
//             <View style={styles.headerRight}>
//               <Text style={[styles.flightNumber, { color: textColor }]}>
//                 {boardingPass.airline} {boardingPass.flightNumber}
//               </Text>
//             </View>
//           </View>

//           {/* Route */}
//           <View style={styles.routeSection}>
//             <View style={styles.cityBlock}>
//               <Text style={[styles.cityName, { color: textColor, opacity: 0.8 }]}>
//                 {boardingPass.originCity || boardingPass.origin}
//               </Text>
//               <Text style={[styles.iataCode, { color: textColor }]}>
//                 {boardingPass.origin}
//               </Text>
//             </View>

//             <View style={styles.arrowContainer}>
//               <Text style={[styles.planeIcon, { color: textColor }]}>✈</Text>
//             </View>

//             <View style={styles.cityBlock}>
//               <Text style={[styles.cityName, { color: textColor, opacity: 0.8 }]}>
//                 {boardingPass.destCity || boardingPass.destination}
//               </Text>
//               <Text style={[styles.iataCode, { color: textColor }]}>
//                 {boardingPass.destination}
//               </Text>
//             </View>
//           </View>

//           {/* Passager */}
//           <View style={styles.passengerSection}>
//             <Text style={[styles.passengerName, { color: textColor }]}>
//               {boardingPass.passengerName.replace("/", " ")}
//             </Text>
//           </View>

//           {/* Details Grid */}
//           <View style={styles.detailsGrid}>
//             <View style={styles.detailItem}>
//               <Text style={[styles.detailLabel, { color: textColor, opacity: 0.7 }]}>DATE</Text>
//               <Text style={[styles.detailValue, { color: textColor }]}>{boardingPass.date}</Text>
//             </View>
//             <View style={styles.detailItem}>
//               <Text style={[styles.detailLabel, { color: textColor, opacity: 0.7 }]}>SEAT</Text>
//               <Text style={[styles.detailValue, { color: textColor }]}>{boardingPass.seatNumber || '-'}</Text>
//             </View>
//             <View style={styles.detailItem}>
//               <Text style={[styles.detailLabel, { color: textColor, opacity: 0.7 }]}>CLASS</Text>
//               <Text style={[styles.detailValue, { color: textColor }]}>{boardingPass.travelClass}</Text>
//             </View>
//           </View>

//           {/* Footer */}
//           <View style={styles.footer}>
//             <Text style={[styles.footerText, { color: textColor, opacity: 0.6 }]}>
//               Tap to view full details
//             </Text>
//           </View>

//         </Animated.View>
//       </GestureDetector>
//     </Animated.View>
//   );
// };

// const styles = StyleSheet.create({
//   // --- LOGIQUE D'ANIMATION (WRAPPER) ---
//   cardWrapper: {
//     width: '100%',
//     // Calcul pour l'effet Wallet : Hauteur (350) - Partie Visible (~90) = -260
//     // Ajuste cette valeur si tu veux que les cartes soient plus ou moins serrées
//     marginBottom: -260, 
//     alignItems: 'center',
//   },

//   // --- DESIGN DE LA CARTE ---
//   card: {
//     height: 350, // Ta hauteur personnalisée
//     width: '100%',
//     borderRadius: 16, // Arrondi légèrement augmenté pour le look moderne
//     borderColor: '#00000027',
//     borderWidth: 1,
//     padding: 24,
    
//     // Ombres (Ton design)
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.25,
//     shadowRadius: 16,
//     elevation: 8,
    
//     // Important pour la 3D Reanimated
//     backfaceVisibility: 'hidden', 
//     overflow: 'visible', // Permet aux avions/éléments de dépasser si besoin
//   },

//   // --- CONTENU INTERNE (Ton design préservé) ---

//   // Header
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center', // J'ai fusionné tes deux 'header' ici
//     marginBottom: 32,
//   },
//   headerLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//     flex: 1,
//   },
//   headerRight: {
//     alignItems: 'flex-end',
//     gap: 2,
//   },
  
//   // Textes Header
//   airlineName: {
//     fontSize: 16,
//     fontWeight: '600',
//     // color est géré dynamiquement dans le composant
//   },
//   airlineCode: {
//     fontSize: 11,
//     marginTop: 2,
//     opacity: 0.8,
//   },
//   flightNumber: {
//     fontSize: 16,
//     fontWeight: '700',
//   },
//   date: {
//     fontSize: 11,
//     marginTop: 2,
//     opacity: 0.8,
//   },

//   // Route Section
//   routeSection: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     // Attention : margin negatif peut couper le texte sur petits écrans
//     // J'ai réduit un peu pour la sécurité, remets -50 si tu préfères
//     marginHorizontal: -20, 
//     marginBottom: 25,
//   },
//   cityBlock: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   cityName: {
//     fontSize: 10,
//     marginBottom: 4,
//     textTransform: 'uppercase',
//     textAlign: 'center',
//     fontWeight: '600',
//     letterSpacing: 0.5,
//   },
//   iataCode: {
//     fontSize: 48,
//     // Assure-toi que la font est bien chargée dans App.js
//     fontFamily: 'Inter_400Regular', 
//     letterSpacing: -1,
//     lineHeight: 50, // Évite que la police ne prenne trop de place verticale
//   },
//   arrowContainer: {
//     paddingHorizontal: 10,
//     // paddingTop: 14, // Souvent pas nécessaire si align-items center
//   },
//   planeIcon: {
//     fontSize: 24,
//   },

//   // Passenger
//   passengerSection: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 24, // Un peu plus d'espace
//   },
//   passengerName: {
//     fontSize: 24,
//     fontFamily: 'Inter_500Medium',
//     textAlign: 'center',
//   },

//   // Details Grid
//   detailsGrid: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 'auto', // Pousse vers le bas si la carte est grande
//     marginBottom: 16,
//     paddingVertical: 16,
//     borderTopWidth: 1,
//     borderTopColor: 'rgba(0,0,0,0.1)', // Plus générique pour s'adapter aux thèmes clairs/sombres
//   },
//   detailItem: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   detailLabel: {
//     fontSize: 10,
//     fontFamily: 'Inter_500Medium',
//     opacity: 0.6,
//     marginBottom: 4,
//     letterSpacing: 0.5,
//     textTransform: 'uppercase',
//   },
//   detailValue: {
//     fontSize: 15,
//     fontWeight: '700',
//   },

//   // Footer
//   footer: {
//     alignItems: 'center',
//     marginTop: 8,
//   },
//   footerText: {
//     fontSize: 11,
//     fontWeight: '500',
//   },
// });