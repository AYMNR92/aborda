import { Inter_400Regular, Inter_500Medium, Inter_700Bold, Inter_900Black, useFonts } from '@expo-google-fonts/inter';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import './src/utils/polyfills.js';

// Écrans
import { AuthScreen } from './src/screens/AuthScreen.js';
import { FlightsScreen } from './src/screens/FlightsScreen.js';
import { MapScreen } from './src/screens/MapScreen.js';
import { PassportScreen } from './src/screens/PassportScreen.js';
import { ScannerScreen } from './src/screens/ScannerScreen.js';

// Services & Utils
import { deleteFlightFromBackend, fetchUserFlights, saveFlightToBackend } from './src/services/api.js';
import { getAirlineColors } from './src/utils/airlines.js';
import { saveBoardingPassesToStorage } from './src/utils/storage.js';

// Auth
import { AuthProvider, useAuth } from './src/context/AuthContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs({ boardingPasses, onDelete }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6050dc',
        tabBarInactiveTintColor: '#ffffff56',
        tabBarShowLabel: false,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          <BlurView intensity={95} tint="extraLight" style={styles.blurView} />
        ),
      }} 
    >
      <Tab.Screen
        name="Flights"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'airplane' : 'airplane-outline'} size={24} color={color} />
          ),
        }}
      >
        {() => <FlightsScreen boardingPasses={boardingPasses} onDelete={onDelete}/>}
      </Tab.Screen>

      <Tab.Screen
        name="Map"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'planet' : 'planet-outline'} size={24} color={color} />
          ),
        }}
      >
        {() => <MapScreen boardingPasses={boardingPasses} />}
      </Tab.Screen>

      <Tab.Screen
        name="Passport"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'id-card' : 'id-card-outline'} size={24} color={color} />
          ),
        }}
        component={PassportScreen}
      />
    </Tab.Navigator>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  const [boardingPasses, setBoardingPasses] = useState([]);

  // --- HELPER POUR LES COULEURS ---
  const hashString = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
      hash = hash & hash;
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
    if (valid.length === 0) return '#E5E7EB';
    const hash = hashString(iata) % valid.length;
    return valid[hash];
  };

  // --- 1. FONCTION DE SYNCHRONISATION (Définie ici pour être accessible partout) ---
  const syncFlightsFromServer = async () => {
    if (!user) {
        setBoardingPasses([]);
        return;
    }

    try {
      console.log("📥 Téléchargement des vols depuis le serveur...");
      const dbFlights = await fetchUserFlights();

      // Mapping Backend -> Frontend
      const formattedFlights = dbFlights.map((flight, index) => {
        const color = pickColorForAirline(flight.airline_code); 
        
        // Gestion des aéroports (Fallback si null)
        const depDetails = flight.departure || {};
        const arrDetails = flight.arrival || {};

        return {
          id: flight.id,
          index: index,
          bgColor: color,
          
          airline: flight.airline_code,
          flightNumber: flight.flight_number,
          date: new Date(flight.departure_date).toLocaleDateString('fr-FR'),
          seatNumber: flight.seat_number || '-',
          travelClass: flight.travel_class || 'Economy',
          passengerName: flight.passenger_name,
          distanceKm: flight.distance_km,

          origin: depDetails.iata_code || flight.departure_airport,
          originCity: depDetails.city || flight.departure_airport,
          originCountry: depDetails.country || "",
          
          destination: arrDetails.iata_code || flight.arrival_airport,
          destCity: arrDetails.city || flight.arrival_airport,
          destCountry: arrDetails.country || "",
        };
      });

      setBoardingPasses(formattedFlights);
      await saveBoardingPassesToStorage(formattedFlights);
      console.log(`✅ ${formattedFlights.length} vols synchronisés.`);

    } catch (error) {
      console.error("Erreur sync:", error);
    }
  };

  const hasFetchedRef = useRef(false);

  // --- 2. USE EFFECT (Appel initial) ---
  useEffect(() => {
    if (!user) {
        hasFetchedRef.current = false;
        setBoardingPasses([]);
        return;
    }
    if (user && !hasFetchedRef.current) {
        hasFetchedRef.current = true; // 🔒 On verrouille l'appel
        syncFlightsFromServer(); 
    }
  }, [user]);

  const isProcessingScan = useRef(false);

  // --- 3. SCANNER (Utilise syncFlightsFromServer) ---
  const handleScanSuccess = async (parsedBCBP) => {
    if (isProcessingScan.current) {
      return;
    }

    isProcessingScan.current = true;
    try {
      console.log("📡 Envoi au serveur...");
      const savedFlight = await saveFlightToBackend(parsedBCBP);

      if (savedFlight.isDuplicate) {
          Alert.alert("Info", "Ce vol est déjà dans votre passeport !");
          return; 
      }
      // Rafraîchissement global
      await syncFlightsFromServer();
      
      console.log('✅ Vol ajouté !');
    } catch (error) {
      console.error("Erreur scan:", error);
      Alert.alert("Erreur", "Impossible de sauvegarder le vol.");
    } finally {
      setTimeout(() => {
        isProcessingScan.current = false;
      }, 2000);
    }
  };

  // --- 4. SUPPRESSION (Utilise syncFlightsFromServer) ---
  const handleDeleteFlight = async (flightId) => {
    console.log("🗑️ Tentative de suppression pour l'ID :", flightId);
    Alert.alert(
      "Supprimer le vol",
      "Êtes-vous sûr de vouloir supprimer ce billet ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Supprimer", 
          style: "destructive", 
          onPress: async () => {
            try {
              await deleteFlightFromBackend(flightId);
              
              // Rafraîchissement global
              await syncFlightsFromServer();
              
              console.log("🗑️ Vol supprimé !");
            } catch (error) {
              console.error("❌ ERREUR DELETE :", error); 
              Alert.alert("Erreur", "Impossible de supprimer le vol.");
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={{flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#000'}}>
        <ActivityIndicator size="large" color="#6050dc" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="MainTabs">
            {(props) => (
              <MainTabs 
                {...props} 
                boardingPasses={boardingPasses} 
                onDelete={handleDeleteFlight} 
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Scanner">
            {({ navigation }) => (
              <ScannerScreen
                onScanSuccess={(parsedBCBP) => {
                  handleScanSuccess(parsedBCBP);
                  navigation.navigate('MainTabs', { screen: 'Flights' });
                }}
                onClose={() => navigation.goBack()}
              />
            )}
          </Stack.Screen>
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthScreen} />
      )}
    </Stack.Navigator>
  );
}

// ... (App principal et Styles inchangés) ...
export default function App() {
  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
    Inter_900Black,
  });

  if (!fontsLoaded) { return null; }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <NavigationContainer>
        <AuthProvider>
           <AppContent />
        </AuthProvider>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    backgroundColor: '#000000ff',
    borderTopWidth: 0,
    height: 70,
    paddingBottom: 30,
    paddingTop: 5,
    elevation: 0,
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
});