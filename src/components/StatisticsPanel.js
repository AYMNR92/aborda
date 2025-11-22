import { StyleSheet, Text, View } from 'react-native';

export const StatisticsPanel = ({ boardingPasses }) => {
  // Calcul des statistiques
  const totalFlights = boardingPasses.length;
  
  const uniqueAirlines = [...new Set(boardingPasses.map(bp => bp.airline))].length;
  
  const allDestinations = [
    ...boardingPasses.map(bp => bp.origin),
    ...boardingPasses.map(bp => bp.destination)
  ];
  const uniqueDestinations = [...new Set(allDestinations)].length;

  return (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{totalFlights}</Text>
        <Text style={styles.statLabel}>Vols</Text>
      </View>
      
      <View style={styles.statDivider} />
      
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{uniqueAirlines}</Text>
        <Text style={styles.statLabel}>Compagnies</Text>
      </View>
      
      <View style={styles.statDivider} />
      
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{uniqueDestinations}</Text>
        <Text style={styles.statLabel}>Aéroports</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginHorizontal: 16,
    marginTop: -30,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
});