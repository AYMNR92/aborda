import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { DevTestPanel } from '../components/DevTestPanel.js';
import { parseBCBP } from '../utils/bcbpParser.js';

export const ScannerScreen = ({ onScanSuccess, onClose }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [showDevPanel, setShowDevPanel] = useState(__DEV__);

  const [torchEnabled, setTorchEnabled] = useState(false);

  // Gestion du scan réel (caméra)
  const handleBarCodeScanned = ({ type, data }) => {
    if (scanned) return; // Éviter les scans multiples
    
    setScanned(true);
    console.log('📷 Code-barres scanné:', { type, data });

    const parsed = parseBCBP(data);
    
    if (parsed) {
      // Alert.alert(
      //   '✅ Scan Réussi !',
      //   `Vol ${parsed.airline} ${parsed.flightNumber}\n${parsed.origin} → ${parsed.destination}`,
      //   [
      //     {
      //       text: 'Ajouter',
      //       onPress: () => onScanSuccess(parsed),
      //     },
      //     {
      //       text: 'Annuler',
      //       onPress: () => setScanned(false),
      //       style: 'cancel',
      //     },
      //   ]
      // );
      onScanSuccess(parsed);
    } else {
      Alert.alert(
        '❌ Erreur',
        'Impossible de lire la carte d\'embarquement. Vérifiez que le code-barres est bien visible.',
        [
          {
            text: 'Réessayer',
            onPress: () => setScanned(false),
          },
        ]
      );
    }
  };

  // Gestion du scan de test (mode dev)
  const handleTestScan = (bcbpString) => {
    console.log('🧪 Test scan:', bcbpString);
    const parsed = parseBCBP(bcbpString);
    
    if (parsed) {
      // Alert.alert(
      //   '✅ Test Réussi !',
      //   `Vol ${parsed.airline} ${parsed.flightNumber}\n${parsed.origin} → ${parsed.destination}`,
      //   [
      //     {
      //       text: 'Ajouter',
      //       onPress: () => {
      //         setShowDevPanel(false);
      //         onScanSuccess(parsed);
      //       },
      //     },
      //   ]
      // );
      setShowDevPanel(false);
      onScanSuccess(parsed);

    } else {
      Alert.alert('❌ Erreur', 'Données de test invalides');
    }
  };

  // États de permission
  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Demande d'accès à la caméra...
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>📷 Accès à la caméra requis</Text>
        <Text style={styles.permissionText}>
          Aborda a besoin d'accéder à votre caméra pour scanner les cartes d'embarquement.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Autoriser l'accès</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Scanner une Carte</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Camera */}
      <View style={styles.scannerContainer}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          enableTorch={torchEnabled}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr', 'pdf417', 'aztec'],
          }}
        />

        {/* Overlay avec cadre de visée */}
        <View style={styles.overlay}>
          <View style={styles.topOverlay} />
          <View style={styles.middleRow}>
            <View style={styles.sideOverlay} />
            <View style={styles.viewfinder}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <View style={styles.sideOverlay} />
          </View>
          <View style={styles.bottomOverlay}>
            <Text style={styles.instruction}>
              Placez le code-barres dans le cadre
            </Text>
            <TouchableOpacity 
          onPress={() => setTorchEnabled(!torchEnabled)} 
          style={styles.flashButton}
        >
          <Ionicons 
            name={torchEnabled ? "flash" : "flash-off"} 
            size={24} 
            color={torchEnabled ? "#FCD34D" : "#FFFFFF"} 
          />
        </TouchableOpacity>
            {__DEV__ && (
              <TouchableOpacity
                style={styles.devButton}
                onPress={() => setShowDevPanel(true)}
              >
                <Text style={styles.devButtonText}>🛠️ Mode Test</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Bouton si déjà scanné */}
        {scanned && (
          <View style={styles.scannedOverlay}>
            <TouchableOpacity
              style={styles.rescanButton}
              onPress={() => setScanned(false)}
            >
              <Text style={styles.rescanButtonText}>Scanner à nouveau</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Panel de test (mode dev) */}
      {showDevPanel && (
        <DevTestPanel
          onTestScan={handleTestScan}
          onClose={() => setShowDevPanel(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    backgroundColor: '#1F2937',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  scannerContainer: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  topOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  middleRow: {
    flexDirection: 'row',
    height: 250,
  },
  sideOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  viewfinder: {
    width: 300,
    height: 250,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#FFFFFF',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  bottomOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  instruction: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  devButton: {
    backgroundColor: '#FCD34D',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 12,
  },
  devButtonText: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '700',
  },
  scannedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rescanButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  rescanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 12,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  closeButton: {
    backgroundColor: '#374151',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});