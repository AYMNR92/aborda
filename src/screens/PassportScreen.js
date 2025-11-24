import { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { fetchUserStats } from '../services/api'; // On importe notre fonction API

import { useAuth } from '../context/AuthContext';

export const PassportScreen = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 2. RÉCUPÉRER L'UTILISATEUR CONNECTÉ
  const { user } = useAuth();

  // Fonction pour charger les données
  const loadStats = async () => {
    const data = await fetchUserStats();
    // Si l'API échoue ou renvoie null, on met des valeurs par défaut pour éviter le crash
    if (data) {
      setStats(data);
    } else {
      setStats({
        totalKm: 0,
        countriesCount: 0,
        totalFlights: 0,
        visitedCountries: []
      });
    }
    setLoading(false);
    setRefreshing(false);
  };

  // Chargement initial
  useEffect(() => {
    loadStats();
  }, []);

  // Fonction pour le "Pull to Refresh" (tirer pour rafraîchir)
  const onRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  const pseudo = user?.email ? user.email.split('@')[0].toUpperCase() : "VOYAGEUR";

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6050dc" />
        <Text style={{marginTop: 10, color: '#fff'}}>Chargement du passeport...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
      }
    >
      {/* --- EN-TÊTE IDENTITÉ --- */}
      <View style={styles.idCard}>
        <View style={styles.avatarPlaceholder}>
          <Text style={{fontSize: 40}}>👤</Text>
        </View>
        <View style={styles.idInfo}>
          <Text style={styles.idLabel}>TRAVELER ID</Text>
          <Text style={styles.idName} numberOfLines={1} adjustsFontSizeToFit>
            {pseudo}
          </Text>
          <View style={styles.badgeRow}>
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>LEVEL 1</Text>
            </View>
          </View>
        </View>
      </View>

      {/* --- ZONE DE STATS (Celle connectée au Backend) --- */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          {/* .toLocaleString() permet d'afficher "9 386" au lieu de "9386" */}
          <Text style={styles.statNumber}>{stats?.totalKm?.toLocaleString()}</Text>
          <Text style={styles.statLabel}>KM</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{stats?.countriesCount}</Text>
          <Text style={styles.statLabel}>PAYS</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{stats?.totalFlights}</Text>
          <Text style={styles.statLabel}>VOLS</Text>
        </View>
      </View>

      {/* --- LISTE DES TAMPONS --- */}
      <Text style={styles.sectionTitle}>VISAS & TAMPONS</Text>
      
      {stats?.visitedCountries.length === 0 ? (
        <Text style={styles.emptyText}>Aucun voyage validé pour l'instant.</Text>
      ) : (
        <View style={styles.stampsGrid}>
          {stats?.visitedCountries.map((item, index) => (
            <View key={index} style={styles.stampWrapper}>
              <View style={[styles.stamp, { transform: [{ rotate: `${Math.random() * 20 - 10}deg` }] }]}>
                <Text style={styles.stampCode}>{item.code}</Text>
                <Text style={styles.stampDate}>ENTRY</Text>
                <Text style={styles.stampCountry}>{item.country.substring(0, 10)}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
        <TouchableOpacity 
        onPress={() => supabase.auth.signOut()} 
        style={{backgroundColor: 'red', padding: 15, margin: 20, borderRadius: 10}}
     >
        <Text style={{color: 'white', textAlign: 'center', fontWeight: 'bold'}}>
           Se Déconnecter
        </Text>
     </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', padding: 20, paddingTop: 60 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' },
  
  // ID CARD
  idCard: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  avatarPlaceholder: {
    width: 80, height: 80,
    backgroundColor: '#334155',
    borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 20,
  },
  idInfo: { justifyContent: 'center' },
  idLabel: { color: '#94A3B8', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  idName: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 5 },
  badgeRow: { flexDirection: 'row', marginTop: 5 },
  rankBadge: { backgroundColor: '#F59E0B', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  rankText: { color: '#000', fontSize: 10, fontWeight: 'bold' },

  // STATS
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statBox: { alignItems: 'center', flex: 1 },
  separator: { width: 1, backgroundColor: '#334155', height: '80%', alignSelf: 'center' },
  statNumber: { fontSize: 20, fontWeight: '900', color: '#fff' },
  statLabel: { fontSize: 12, color: '#94A3B8', marginTop: 4, fontWeight: '600' },

  // STAMPS
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 20, letterSpacing: 1 },
  stampsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' },
  stampWrapper: { width: '33%', alignItems: 'center', marginBottom: 20 },
  stamp: {
    width: 90, height: 90,
    borderRadius: 45,
    borderWidth: 3, borderColor: '#38BDF8', // Bleu cyan style encre
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'transparent',
    opacity: 0.8,
  },
  stampCode: { fontSize: 20, fontWeight: '900', color: '#38BDF8' },
  stampCountry: { fontSize: 8, color: '#38BDF8', textTransform: 'uppercase', marginTop: 2 },
  stampDate: { fontSize: 8, color: '#38BDF8', marginVertical: 2 },
  
  emptyText: { color: '#64748B', textAlign: 'center', marginTop: 20, fontStyle: 'italic' }
});