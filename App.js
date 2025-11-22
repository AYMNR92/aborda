import './src/utils/polyfills.js';

import { Inter_400Regular, Inter_500Medium, Inter_700Bold, Inter_900Black, useFonts } from '@expo-google-fonts/inter';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { FlightsScreen } from './src/screens/FlightsScreen.js';
import { MapScreen } from './src/screens/MapScreen.js';
import { ScannerScreen } from './src/screens/ScannerScreen.js';
import { getAirlineColors } from './src/utils/airlines.js';
import { enrichBoardingPass } from './src/utils/enrichBoardingPass.js';
const Tab = createBottomTabNavigator();

export default function App() {
    let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
    Inter_900Black,
  });

  const [boardingPasses, setBoardingPasses] = useState([]);
  
  if (!fontsLoaded) {
    return null; // Ou un loading screen
  }
  
  const hashString = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
      hash = hash & hash; // Convertit en 32-bit integer
    }
    return Math.abs(hash);
  };

  const pickColorForAirline = (iata) => {
    const colors = getAirlineColors(iata) || [];
    
    const isWhite = (c) => {
      if (!c) return false;
      const x = c.toLowerCase();
      return x === "#fff" || x === "#ffffff" || x === "white";
    };

    const valid = colors.filter((c) => !isWhite(c));

    if (valid.length === 0) {
      return '#E5E7EB'; // Couleur par défaut
    }
    const hash = hashString(iata) % valid.length;
    return valid[hash];
  };

  const handleScanSuccess = async (parsedBCBP) => {
    const enrichedBCBP = await enrichBoardingPass(parsedBCBP);

    const color = pickColorForAirline(parsedBCBP.airline); //nouveau
    const newIndex = boardingPasses.length;

    const newBoardingPass = {
      ...enrichedBCBP,
      id: Date.now(),
      bgColor: color,
      index: newIndex,
    };

    setBoardingPasses([...boardingPasses, newBoardingPass]);
    console.log('✅ Boarding pass ajoutée:', newBoardingPass);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#eb8825ff',
            tabBarInactiveTintColor: '#000000ff',
            tabBarShowLabel: true,
            tabBarLabelStyle: styles.tabBarLabel,
            tabBarStyle: styles.tabBar,
            tabBarBackground: () => (
              <BlurView
                intensity={95}
                tint="extraLight"
                style={styles.blurView}
              />
            ),
          }}
        >
          {/* Onglet 1 : Vols */}
          <Tab.Screen
            name="Flights"
            options={{
              tabBarLabel: 'Vols',
              tabBarIcon: ({ color, focused, size }) => (
                <Ionicons
                  name={focused ? 'airplane' : 'airplane-outline'}
                  size={24}
                  color={color}
                />
              ),
            }}
          >
            {() => <FlightsScreen boardingPasses={boardingPasses} />}
          </Tab.Screen>

          {/* Onglet 2 : Scanner */}
          <Tab.Screen
            name="Scanner"
            options={{
              tabBarLabel: 'Scanner',
              tabBarIcon: ({ color, focused, size}) => (
                <View style={styles.scannerIconContainer}>
                  <Ionicons
                    name={focused ? 'scan' : 'scan-outline'}
                    size={24}
                    color="#FFFFFF"
                  />
                </View>
              ),
            }}
          >
            {({ navigation }) => (
              <ScannerScreen
                onScanSuccess={(parsedBCBP) => {
                  handleScanSuccess(parsedBCBP);
                  navigation.navigate('Flights');
                }}
                onClose={() => navigation.navigate('Flights')}
              />
            )}
          </Tab.Screen>

          {/* Onglet 3 : Map */}
          <Tab.Screen
            name="Map"
            options={{
              tabBarLabel: 'Map',
              tabBarIcon: ({ color, focused, size }) => (
                <Ionicons
                  name={focused ? 'globe' : 'globe-outline'}
                  size={24}
                  color={color}
                />
              ),
            }}
          >
            {() => <MapScreen boardingPasses={boardingPasses} />}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    backgroundColor: '#0000001a',
    borderTopWidth: 0,
    height: Platform.OS === 'ios' ? 88 : 70,
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
    paddingTop: 8,
    elevation: 0,
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 9,
  },
  scannerIconContainer: {
    backgroundColor: '#eb8825ff',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#eb8825ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
    marginBottom:0,
  },
});