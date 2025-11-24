// import './src/utils/polyfills.js';

// import { Inter_400Regular, Inter_500Medium, Inter_700Bold, Inter_900Black, useFonts } from '@expo-google-fonts/inter';
// import { Ionicons } from '@expo/vector-icons';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { BlurView } from 'expo-blur';
// import { StatusBar } from 'expo-status-bar';
// import { useEffect, useState } from 'react';
// import { Alert, StyleSheet } from 'react-native'; // AJOUT DE ALERT
// import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import { AuthProvider, useAuth } from './src/context/AuthContext';
// import { AuthScreen } from './src/screens/AuthScreen';
// import { FlightsScreen } from './src/screens/FlightsScreen.js';
// import { MapScreen } from './src/screens/MapScreen.js';
// import { ScannerScreen } from './src/screens/ScannerScreen.js';
// import { getAirlineColors } from './src/utils/airlines.js';
// import { enrichBoardingPass } from './src/utils/enrichBoardingPass.js';
// import {
//   loadBoardingPassesFromStorage,
//   saveBoardingPassesToStorage
// } from './src/utils/storage.js';

// // --- AJOUT DE L'IMPORT API ---
// import { saveFlightToBackend } from './src/services/api.js';

// const Tab = createBottomTabNavigator();
// const Stack = createNativeStackNavigator();

// function AppContent() {
//   const { user, loading } = useAuth();

//   if (loading) return null; // Ou un écran de chargement

//   return (
//     <NavigationContainer>
//       <Stack.Navigator screenOptions={{ headerShown: false }}>
//         {user ? (
//           // Si connecté : On montre l'App
//           <>
//             <Stack.Screen name="MainTabs" component={MainTabs} />
//             <Stack.Screen name="Scanner">
//                {/* ... ton code scanner existant ... */}
//             </Stack.Screen>
//           </>
//         ) : (
//           // Si pas connecté : On montre le Login
//           <Stack.Screen name="Auth" component={AuthScreen} />
//         )}
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }

// export default function App() {
//     let [fontsLoaded] = useFonts({
//     Inter_400Regular,
//     Inter_500Medium,
//     Inter_700Bold,
//     Inter_900Black,
//   });

//   const [boardingPasses, setBoardingPasses] = useState([]);

//   useEffect(() => {
//     const loadData = async () => {
//       const savedPasses = await loadBoardingPassesFromStorage();
//       if (savedPasses.length > 0) {
//         setBoardingPasses(savedPasses);
//         console.log("📂 Données récupérées du stockage local");
//       }
//     };
//     loadData();
//   }, []);
  
//   if (!fontsLoaded) {
//     return null;
//   }

//   const hashString = (str) => {
//     let hash = 0;
//     for (let i = 0; i < str.length; i++) {
//       hash = str.charCodeAt(i) + ((hash << 5) - hash);
//       hash = hash & hash;
//     }
//     return Math.abs(hash);
//   };

//   const pickColorForAirline = (iata) => {
//     const colors = getAirlineColors(iata) || [];
//     const isWhite = (c) => {
//       if (!c) return false;
//       const x = c.toLowerCase();
//       return x === "#fff" || x === "#ffffff" || x === "white";
//     };
//     const valid = colors.filter((c) => !isWhite(c));
//     if (valid.length === 0) return '#E5E7EB';
//     const hash = hashString(iata) % valid.length;
//     return valid[hash];
//   };

//   // --- FONCTION MODIFIÉE POUR LE BACKEND ---
//   const handleScanSuccess = async (parsedBCBP) => {
//     try {
//       // 1. Enrichissement local (logos, noms, couleurs) pour l'affichage UI
//       const enrichedBCBP = await enrichBoardingPass(parsedBCBP);
//       const color = pickColorForAirline(parsedBCBP.airline);

//       // 2. Appel au Backend (Sauvegarde DB + Calcul Distance)
//       console.log("📡 Envoi au serveur...");
//       const savedFlight = await saveFlightToBackend(parsedBCBP);

//       const newIndex = boardingPasses.length;

//       // 3. Création de l'objet final (Mix données locales + données serveur)
//       const newBoardingPass = {
//         ...enrichedBCBP,
//         id: savedFlight.id,          // UUID de Supabase
//         distanceKm: savedFlight.distance_km, // Distance calculée par le serveur
//         bgColor: color,
//         index: newIndex,
//       };

//       const updatedList = [...boardingPasses, newBoardingPass];
//       setBoardingPasses(updatedList);
      
//       await saveBoardingPassesToStorage(updatedList);
      
//       console.log('✅ Boarding pass synchronisée et ajoutée !');
      
//     } catch (error) {
//       console.error("Erreur handleScanSuccess:", error);
//       Alert.alert(
//         "Erreur de connexion",
//         "Impossible de sauvegarder le vol sur le serveur. Vérifiez que votre ordinateur et votre téléphone sont sur le même Wifi."
//       );
//     }
//   };

//   function MainTabs() {
//       return (
//         <Tab.Navigator
//           screenOptions={{
//             headerShown: false,
//             tabBarActiveTintColor: '#6050dc',
//             tabBarInactiveTintColor: '#ffffff56',
//             tabBarShowLabel: false,
//             tabBarLabelStyle: styles.tabBarLabel,
//             tabBarStyle: styles.tabBar,
//             tabBarBackground: () => (
//               <BlurView
//                 intensity={95}
//                 tint="extraLight"
//                 style={styles.blurView}
//               />
//             ),
//           }} 
//         >
//           <Tab.Screen
//             name="Flights"
//             options={{
//               tabBarIcon: ({ color, focused, size }) => (
//                 <Ionicons
//                   name={focused ? 'airplane' : 'airplane-outline'}
//                   size={24}
//                   color={color}
//                 />
//               ),
//             }}
//           >
//             {() => <FlightsScreen boardingPasses={boardingPasses} />}
//           </Tab.Screen>

//           <Tab.Screen
//             name="Map"
//             options={{
//               tabBarIcon: ({ color, focused, size }) => (
//                 <Ionicons
//                   name={focused ? 'planet' : 'planet-outline'}
//                   size={24}
//                   color={color}
//                 />
//               ),
//             }}
//           >
//             {() => <MapScreen boardingPasses={boardingPasses} />}
//           </Tab.Screen>
//         </Tab.Navigator>
//       )
//   }

//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <AuthProvider>
//       <StatusBar style={styles.tabBar} />
//       <AppContent />
//       <NavigationContainer>
//          <Stack.Navigator screenOptions={{ headerShown: false }}>
//           <Stack.Screen name="MainTabs" component={MainTabs} />
//           <Stack.Screen name="Scanner">
//             {({ navigation }) => (
//               <ScannerScreen
//                 onScanSuccess={(parsedBCBP) => {
//                   handleScanSuccess(parsedBCBP);
//                   navigation.navigate('MainTabs', { screen: 'Flights' });
//                 }}
//                 onClose={() => navigation.goBack()}
//               />
//             )}
//           </Stack.Screen>
//         </Stack.Navigator>
//       </NavigationContainer>
//       </AuthProvider>
//     </GestureHandlerRootView>
//   );
// }

// const styles = StyleSheet.create({
//   tabBar: {
//     position: 'absolute',
//     backgroundColor: '#000000ff',
//     borderTopWidth: 0,
//     height: 70,
//     paddingBottom: 30,
//     paddingTop: 5,
//     elevation: 0,
//   },
//   blurView: {
//     ...StyleSheet.absoluteFillObject,
//     overflow: 'hidden',
//     backgroundColor: 'rgba(0,0,0,0.8)', // Un peu plus sombre pour la lisibilité
//   },
// });

import { Inter_400Regular, Inter_500Medium, Inter_700Bold, Inter_900Black, useFonts } from '@expo-google-fonts/inter';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
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
import { fetchUserFlights, saveFlightToBackend } from './src/services/api.js';
import { getAirlineColors } from './src/utils/airlines.js';
import { enrichBoardingPass } from './src/utils/enrichBoardingPass.js';
import { saveBoardingPassesToStorage } from './src/utils/storage.js';

// Auth
import { AuthProvider, useAuth } from './src/context/AuthContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// --- 1. WRAPPER DE CONTENU (Gère la logique mais PAS le NavigationContainer) ---
function AppContent() {
  const { user, loading } = useAuth();
  const [boardingPasses, setBoardingPasses] = useState([]);

  // Chargement des données seulement si connecté
useEffect(() => {
    const syncFlights = async () => {
      if (!user) {
        setBoardingPasses([]); // Si pas connecté, liste vide !
        return;
      }

      console.log("📥 Téléchargement des vols depuis le serveur...");
      const dbFlights = await fetchUserFlights();

      // On doit transformer les données DB (snake_case) en format UI (camelCase + couleurs)
      const formattedFlights = dbFlights.map((flight, index) => {
        const color = pickColorForAirline(flight.airline_code); // On recalcule la couleur
        
        return {
          id: flight.id,
          airline: flight.airline_code,
          flightNumber: flight.flight_number,
          origin: flight.departure_airport,
          destination: flight.arrival_airport,
          date: new Date(flight.departure_date).toLocaleDateString('fr-FR'),
          seatNumber: flight.seat_number,
          travelClass: flight.travel_class,
          passengerName: flight.passenger_name,
          distanceKm: flight.distance_km,
          bgColor: color,
          index: index // Important pour l'animation de stack
        };
      });

      setBoardingPasses(formattedFlights);
      // Optionnel : Tu peux mettre à jour le storage local ici pour le mode hors-ligne
      saveBoardingPassesToStorage(formattedFlights);
    };

    syncFlights();
  }, [user]);

  // --- Helpers & Logique Scan ---
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

  const handleScanSuccess = async (parsedBCBP) => {
    try {
      const enrichedBCBP = await enrichBoardingPass(parsedBCBP);
      const color = pickColorForAirline(parsedBCBP.airline);

      console.log("📡 Envoi au serveur...");
      const savedFlight = await saveFlightToBackend(parsedBCBP);

      const newIndex = boardingPasses.length;
      const newBoardingPass = {
        ...enrichedBCBP,
        id: savedFlight.id,
        distanceKm: savedFlight.distance_km,
        bgColor: color,
        index: newIndex,
      };

      const updatedList = [...boardingPasses, newBoardingPass];
      setBoardingPasses(updatedList);
      await saveBoardingPassesToStorage(updatedList);
      console.log('✅ Vol ajouté !');
    } catch (error) {
      console.error("Erreur scan:", error);
      Alert.alert("Erreur", "Impossible de sauvegarder le vol.");
    }
  };

  // --- Navigation Principale (Tabs) ---
  function MainTabs() {
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
          {() => <FlightsScreen boardingPasses={boardingPasses} />}
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

  if (loading) {
    return (
      <View style={{flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#000'}}>
        <ActivityIndicator size="large" color="#6050dc" />
      </View>
    );
  }

  // --- Rendu Conditionnel des Stacks ---
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        // CONNECTÉ -> App
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
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
        // NON CONNECTÉ -> Login
        <Stack.Screen name="Auth" component={AuthScreen} />
      )}
    </Stack.Navigator>
  );
}

// --- 2. APP PRINCIPALE (Racine) ---
export default function App() {
  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
    Inter_900Black,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      {/* LE SEUL ET UNIQUE NavigationContainer EST ICI */}
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