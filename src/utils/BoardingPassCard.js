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
      const maxTilt = 30; // degrés max
      tiltY.value = clamp(event.translationX / 10, -maxTilt, maxTilt);
      tiltX.value = clamp(-event.translationY / 10, -maxTilt, maxTilt);
    })
    .onEnd(() => {
      // Ne s'active que si cette carte est active
      if (activeCardIndex.value !== index) return;
      tiltX.value = 0;
      tiltY.value = 0;
      isPressed.value = false;
    });

  // Utiliser Simultaneous pour que tap et pan puissent fonctionner ensemble
  const composedGesture = Gesture.Simultaneous(tap, panGesture);
  const {height: screenHeight} = useWindowDimensions();

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