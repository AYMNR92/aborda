import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { loadAirportsDatabase } from '../utils/airportsDatabase.js';
import { formatDistance } from '../utils/distanceCalculator.js';

const { width, height } = Dimensions.get('window');

export const MapScreen = ({ boardingPasses }) => {
  const webViewRef = useRef(null);
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [arcs, setArcs] = useState([]);
  const [selectedFlights, setSelectedFlights] = useState(new Set());
  const [selectedKm, setSelectedKm] = useState(0);

  // Extraire les destinations uniques
  const allDestinations = [
    ...boardingPasses.map((bp) => bp.origin),
    ...boardingPasses.map((bp) => bp.destination),
  ];
  const uniqueDestinations = [...new Set(allDestinations)];

  // Initialiser tous les vols comme sélectionnés par défaut
  useEffect(() => {
    if (boardingPasses.length > 0) {
      setSelectedFlights(new Set(boardingPasses.map(bp => bp.id)));
    }
  }, [boardingPasses.length]);

  // Toggle la sélection d'un vol
  const toggleFlightSelection = (flightId) => {
    setSelectedFlights(prev => {
      const newSet = new Set(prev);
      if (newSet.has(flightId)) {
        newSet.delete(flightId);
      } else {
        newSet.add(flightId);
      }
      return newSet;
    });
  };

  // Sélectionner/Désélectionner tous
  const toggleSelectAll = () => {
    if (selectedFlights.size === boardingPasses.length) {
      setSelectedFlights(new Set());
    } else {
      setSelectedFlights(new Set(boardingPasses.map(bp => bp.id)));
    }
  };

  // Charger les coordonnées depuis l'API
  useEffect(() => {
    const loadPoints = async () => {
      setLoading(true);
      const airports = await loadAirportsDatabase();
      
      // Filtrer les vols sélectionnés
      const selectedBPs = boardingPasses.filter(bp => selectedFlights.has(bp.id));
      setSelectedKm(
        selectedBPs.reduce((sum, bp) => sum + (bp.distanceKm || 0), 0)
      );
      // Créer les points pour les vols sélectionnés
      const selectedDestinations = [
        ...selectedBPs.map((bp) => bp.origin),
        ...selectedBPs.map((bp) => bp.destination),
      ];
      const uniqueSelected = [...new Set(selectedDestinations)];
      
      const pointsData = uniqueSelected
        .filter(dest => airports[dest])
        .map(dest => ({
          lat: airports[dest].lat,
          lng: airports[dest].lng,
          size: 0.3,
          color: '#22c55e',
          label: `${dest} - ${airports[dest].city}`,
        }));

      // Créer les arcs pour les vols sélectionnés
      const arcsData = selectedBPs
        .map(bp => {
          const origin = airports[bp.origin];
          const destination = airports[bp.destination];
          if (!origin || !destination) return null;

          return {
            startLat: origin.lat,
            startLng: origin.lng,
            endLat: destination.lat,
            endLng: destination.lng,
            color: ['#3b82f6', '#60a5fa'],
            stroke: 1.5,
            arcAltitude: 0.2
          };
        })
        .filter(Boolean);

      setPoints(pointsData);
      setArcs(arcsData);
      setLoading(false);
      console.log(`✅ ${pointsData.length} destinations et ${arcsData.length} arcs chargés`);
    };

    if (selectedFlights.size > 0) {
      loadPoints();
    } else {
      setPoints([]);
      setArcs([]);
      setLoading(false);
      setSelectedKm(0);   
    }
  }, [selectedFlights, boardingPasses]);

  // HTML avec globe.gl
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    body { margin: 0; overflow: hidden; background: #0F172A; }
    #globeViz { width: 100vw; height: 100vh; }
  </style>
  <script src="https://unpkg.com/globe.gl"></script>
</head>
<body>
  <div id="globeViz"></div>
  <script>
    const points = ${JSON.stringify(points)};
    const arcs = ${JSON.stringify(arcs)};
    
    const globe = Globe()
      (document.getElementById('globeViz'))
      .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-night.jpg')
      .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
      .backgroundImageUrl('https://unpkg.com/three-globe/example/img/night-sky.png')
      .pointsData(points)
      .arcsData(arcs)
      .arcColor(d => ['rgba(59, 130, 246, 0.5)', 'rgba(96, 165, 250, 0.8)'])
      .arcStroke('stroke')
      .arcAltitude('arcAltitude')
      .arcDashLength(0.4)
      .arcDashGap(0.2)
      .arcDashAnimateTime(1500)
      .pointAltitude(0.01)
      .pointRadius('size')
      .pointColor('color')
      .pointLabel(d => d.label)
      .atmosphereColor('#eef2f8ff')
      .atmosphereAltitude(0.15);

    // Auto-rotation
    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.3;
    globe.controls().enableZoom = true;
    globe.controls().enablePan = false;
    globe.controls().minDistance = 150;
    globe.controls().maxDistance = 500;

    // Responsive
    window.addEventListener('resize', () => {
      globe.width(window.innerWidth);
      globe.height(window.innerHeight);
    });
  </script>
</body>
</html>
  `;

  return (
    <View style={styles.container}>
      {/* Liste des vols avec checkboxes */}
      <View style={styles.flightsPanel}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Vols à afficher</Text>
          <TouchableOpacity onPress={toggleSelectAll} style={styles.selectAllButton}>
            <Text style={styles.selectAllText}>
              {selectedFlights.size === boardingPasses.length ? 'Tout désélectionner' : 'Tout sélectionner'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.flightsList}
        >
          {boardingPasses.map((bp) => {
            const isSelected = selectedFlights.has(bp.id);
            return (
              <TouchableOpacity
                key={bp.id}
                style={[
                  styles.flightChip,
                  isSelected && styles.flightChipSelected
                ]}
                onPress={() => toggleFlightSelection(bp.id)}
                activeOpacity={0.7}
              >
                <View style={styles.checkbox}>
                  {isSelected && <View style={styles.checkboxInner} />}
                </View>
                <Text style={[
                  styles.flightChipText,
                  isSelected && styles.flightChipTextSelected
                ]}>
                  {bp.airline} {bp.flightNumber}
                </Text>
                <Text style={[
                  styles.flightChipRoute,
                  isSelected && styles.flightChipRouteSelected
                ]}>
                  {bp.origin} → {bp.destination}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Globe WebView */}
      <View style={styles.globeContainer}>
        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Chargement des aéroports...</Text>
          </View>
        ) : (
          <WebView
            ref={webViewRef}
            source={{ html: htmlContent }}
            style={styles.webview}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loading}>
                <ActivityIndicator size="large" color="#2563EB" />
                <Text style={styles.loadingText}>Chargement du globe...</Text>
              </View>
            )}
          />
        )}
      </View>

      {/* Compteur sélection */}
      {boardingPasses.length > 0 && (
        <View style={styles.selectionCounter}>
          <Text style={styles.counterText}>
            {selectedFlights.size} vol{selectedFlights.size > 1 ? 's' : ''} sélectionné{selectedFlights.size > 1 ? 's' : ''} • {formatDistance(selectedKm)} km
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  
  // Panel des vols
  flightsPanel: {
    backgroundColor: '#1E293B',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  selectAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  selectAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  flightsList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  flightChip: {
    backgroundColor: '#334155',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  flightChipSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#60A5FA',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#94A3B8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  flightChipText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  flightChipTextSelected: {
    color: '#FFFFFF',
  },
  flightChipRoute: {
    fontSize: 12,
    color: '#94A3B8',
  },
  flightChipRouteSelected: {
    color: '#BFDBFE',
  },
  
  // Globe
  globeContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  webview: {
    flex: 1,
    width: '100%',
    backgroundColor: 'transparent',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 12,
    fontSize: 14,
  },
  
  // Compteur
  selectionCounter: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 80,
    left: 0,
    right: 0,
    alignItems: 'center',
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
