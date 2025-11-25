import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  clamp,
  interpolate,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { getAirlineName } from '../utils/airlines.js';
import { AirlineLogo } from './AirlineLogo.js';

export const BoardingPassCard = ({ boardingPass, index, scrollY, activeCardIndex, onDelete}) => {
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

  const textColor = getTextColor(bgColor);

  const tiltX = useSharedValue(0);
  const tiltY = useSharedValue(0);
  const isPressed = useSharedValue(false);
  const [cardHeight, setCardHeight] = useState(0);
  const translateY = useSharedValue(0);
  const {height: screenHeight} = useWindowDimensions();

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
    .activeOffsetX([-15, 15]) // Active seulement sur gestes horizontaux (tilt) - seuil plus élevé
    .failOffsetY([-20, 20]) // Échoue rapidement sur gestes verticaux (laisse le parent gérer le scroll)
    .onStart(() => {
      // Ne s'active que si cette carte est active
      if (activeCardIndex.value !== index) return;
      isPressed.value = true;
    })
    .onUpdate((event) => {
      // Ne s'active que si cette carte est active
      if (activeCardIndex.value !== index) return;
      const maxTilt = 20; // degrés max
      tiltY.value = clamp(event.translationX / 8, -maxTilt, maxTilt);
      tiltX.value = clamp(-event.translationY / 8, -maxTilt, maxTilt);
    })
    .onEnd(() => {
      // Ne s'active que si cette carte est active
      if (activeCardIndex.value !== index) return;
      tiltX.value = withSpring(0);
      tiltY.value = withSpring(0);
      isPressed.value = false;
    });

  // Utiliser Simultaneous pour que tap et pan puissent fonctionner ensemble
  const composedGesture = Gesture.Simultaneous(tap, panGesture);


  const openAnimationProgress = useDerivedValue(() => {
    return withTiming(activeCardIndex.value === index ? 1 : 0, { duration: 300 });
  });

  const deleteButtonStyle = useAnimatedStyle(() => {
    return {
      opacity: openAnimationProgress.value,
      // Astuce : on déplace le bouton pour qu'il ne gêne pas quand il est invisible
      transform: [
        { translateY: openAnimationProgress.value === 0 ? -20 : 0 }, // Petit effet de glissement
        { scale: openAnimationProgress.value }
      ],
      // Si opacité 0, on désactive les clics (pointerEvents n'est pas animable directement mais géré par l'opacité visuelle)
      display: openAnimationProgress.value === 0 ? 'none' : 'flex',
    };
  });

  const animatedGlareStyle = useAnimatedStyle(() => {
    // On mappe l'angle d'inclinaison (ex: -30deg à 30deg) vers un déplacement en pixels (ex: -150px à 150px)
    const translateX = interpolate(tiltY.value, [-35, 35], [-300, 300]);
    const translateY = interpolate(tiltX.value, [-35, 35], [-300, 300]);
    
    return {
      opacity: openAnimationProgress.value, // Visible seulement si ouvert
      transform: [
        { translateX: translateX },
        { translateY: translateY },
        // Rotation initiale pour que le reflet soit en diagonale
        { rotate: '35deg' } 
      ]
    };
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
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

function formatBoardingDate(dateString) {
  const [day, month, year] = dateString.split("/");

  const date = new Date(year, month - 1, day);

  const d = String(date.getDate()).padStart(2, "0");
  const m = date.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const y = String(date.getFullYear()).slice(-2);

  return `${d}${m}${y}`; // 20SEP24
}

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

      <View style={styles.cardInnerContent}>

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
            {formatBoardingDate(boardingPass.date)}
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
      <Animated.View style={[styles.glareEffectContainer, animatedGlareStyle]}>
              <LinearGradient
                // Couleurs : Transparent -> Blanc semi-transparent -> Transparent
                colors={['transparent', 'rgba(255,255,255,0.4)', 'transparent']}
                locations={[0.3, 0.5, 0.7]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
      </Animated.View>
      </View>
      </View>
      <Animated.View style={[styles.deleteButtonContainer, deleteButtonStyle]}>
        <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={20} color="#FFF" />
          <Text style={styles.deleteText}>Supprimer</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    width: '100%',
  },
  card: {
    height: 250,
    width: '100%',
    borderRadius: 10,
    borderColor: '#00000027',
    borderWidth: 1,
    marginBottom: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'visible',
    
  },
  cardInnerContent: {
    flex: 1,
    overflow: 'hidden', // C'est lui qui coupe le reflet qui dépasse
    borderRadius: 10,   // Doit correspondre au border radius de la carte
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  // ✨ NOUVEAU ✨ : Le style du conteneur du reflet
  glareEffectContainer: {
    position: 'absolute',
    top: '50%',   // On le positionne bien au-dessus et à gauche pour commencer
    left: '50%',
    width: 1200,  // Beaucoup plus large que la carte
    height: 1200, // Beaucoup plus haut que la carte

    marginLeft: -600,
    marginTop: -600,

    zIndex: 10,  // Au-dessus du contenu texte
    pointerEvents: 'none', // Pour ne pas bloquer les gestes
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
    marginBottom: 20,
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
    marginHorizontal: -30,
    // marginBottom: 15,
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
    fontSize: 20,
    fontFamily: 'Inter_500Medium',
  },


  // Details Grid
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
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
    marginTop: 2,
  },
  footerText: {
    fontSize: 11,
    fontWeight: '500',
  },
  deleteButtonContainer: {
    position: 'absolute',
    top: 260, // Juste en dessous de la carte (hauteur 250 + 10 marge)
    alignSelf: 'center',
    zIndex: 0, // Derrière la carte si elle se ferme
  },
  deleteButton: {
    flexDirection: 'row',
    backgroundColor: '#EF4444', // Rouge
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  deleteText: {
    color: '#FFF',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 14,
  },
});