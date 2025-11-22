import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MOCK_BCBPS } from '../utils/mockData.js';

export const DevTestPanel = ({ onTestScan, onClose }) => {
  return (
    <View style={styles.devPanel}>
      {/* Header */}
      <View style={styles.devPanelHeader}>
        <Text style={styles.devPanelTitle}>🛠️ Mode Développement</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.devPanelClose}>✕</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.devPanelSubtitle}>
        Simule un scan de boarding pass sans caméra
      </Text>

      {/* Liste des boarding passes de test */}
      <ScrollView style={styles.devPanelScroll}>
        {MOCK_BCBPS.map((mock) => (
          <TouchableOpacity
            key={mock.id}
            style={styles.devPanelButton}
            onPress={() => onTestScan(mock.bcbp)}
            activeOpacity={0.7}
          >
            <Text style={styles.devPanelButtonText}>{mock.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.devPanelFooter}>
        <Text style={styles.devPanelFooterText}>
          💡 Ces données sont des exemples pour tester l'app pendant le développement
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  devPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FCD34D',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '75%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  devPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  devPanelTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  devPanelClose: {
    fontSize: 28,
    color: '#1F2937',
    fontWeight: '300',
  },
  devPanelSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  devPanelScroll: {
    maxHeight: 350,
  },
  devPanelButton: {
    backgroundColor: '#1F2937',
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  devPanelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  devPanelFooter: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#92400E',
  },
  devPanelFooterText: {
    fontSize: 12,
    color: '#92400E',
    textAlign: 'center',
  },
});