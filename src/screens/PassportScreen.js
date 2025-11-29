import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { fetchUserLists, fetchUserStats } from '../services/api'; // On importe notre fonction API

import { Medal } from '../components/Medal'; // Import composant
import { useAuth } from '../context/AuthContext';
import { CONTINENTS, COUNTRIES } from '../utils/countriesData';

export const PassportScreen = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { width: SCREEN_WIDTH } = Dimensions.get('window');
  const navigation = useNavigation();
  const [lists, setLists] = useState([]);
  // 2. RÉCUPÉRER L'UTILISATEUR CONNECTÉ
  const { user } = useAuth();

  const [activeContinentIndex, setActiveContinentIndex] = useState(0);
  const flatListRef = useRef(null);

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
    const userLists = await fetchUserLists();
    setLists(userLists);
    setLoading(false);
    setRefreshing(false);
  };

  const handleNextContinent = () => {
    if (activeContinentIndex < CONTINENTS.length - 1) {
      const nextIndex = activeContinentIndex + 1;
      setActiveContinentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex });
    }
  };

  const handlePrevContinent = () => {
    if (activeContinentIndex > 0) {
      const prevIndex = activeContinentIndex - 1;
      setActiveContinentIndex(prevIndex);
      flatListRef.current?.scrollToIndex({ index: prevIndex });
    }
  };

  const onViewRef = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveContinentIndex(viewableItems[0].index);
    }
  });
  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

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

  const renderContinentPage = ({ item: continent }) => {
    const continentCountries = COUNTRIES[continent.id] || [];
    
    // Liste des pays visités (codes ISO) depuis la DB
    // Assure-toi que ton backend renvoie bien le code pays (ex: 'FR') dans visitedCountries
    // Sinon il faudra mapper le nom vers le code.
    const visitedCodes = stats?.visitedCountries.map(c => c.countryCode).filter(Boolean); 
    
    const myMedals = continentCountries.filter(country => 
        visitedCodes.includes(country.code)
    );
    // Pour tester si tu n'as pas encore les codes :
    // const visitedCodes = ['FR', 'JP', 'US']; 

    return (
      <View style={[styles.continentPage, { width: SCREEN_WIDTH - 40 }]}>
        
        {myMedals.length > 0 ? (
          <View style={styles.medalsGrid}>
            {myMedals.map((country) => (
              <Medal 
                key={country.code}
                country={{...country, flag: null}} // Plus besoin du flag emoji
                isUnlocked={true}
              />
            ))}
          </View>
        ) : (
          // 4. Affichage si aucune médaille sur ce continent
          <View style={styles.emptyState}>
            <Ionicons name="earth-outline" size={40} color="#334155" />
            <Text style={styles.emptyContinentText}>
              Aucune exploration en {continent.name} pour le moment.
            </Text>
          </View>
        )}
        
      </View>
    );
  };

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

      {/* --- SECTION COLLECTION --- */}
      <View style={styles.collectionHeader}>
         <Text style={styles.sectionTitle}>COLLECTION</Text>
         <View style={styles.controls}>
            <TouchableOpacity onPress={handlePrevContinent} disabled={activeContinentIndex === 0}>
               <Ionicons name="chevron-back" size={24} color={activeContinentIndex === 0 ? '#334155' : '#FFF'} />
            </TouchableOpacity>
            
            <Text style={[styles.continentTitle, { color: CONTINENTS[activeContinentIndex].color }]}>
                {CONTINENTS[activeContinentIndex].name.toUpperCase()}
            </Text>

            <TouchableOpacity onPress={handleNextContinent} disabled={activeContinentIndex === CONTINENTS.length - 1}>
               <Ionicons name="chevron-forward" size={24} color={activeContinentIndex === CONTINENTS.length - 1 ? '#334155' : '#FFF'} />
            </TouchableOpacity>
         </View>
      </View>

      <View style={styles.carouselContainer}>
        <FlatList
          ref={flatListRef}
          data={CONTINENTS}
          renderItem={renderContinentPage}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewRef.current}
          viewabilityConfig={viewConfigRef.current}
        />
      </View>

      <View style={{ marginTop: 30, marginBottom: 50 }}>
        <Text style={styles.sectionTitle}>MES CARNETS 📁</Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 0 }}>
           {lists.length === 0 ? (
              <Text style={styles.emptyText}>Aucune liste créée.</Text>
           ) : (
              lists.map(list => (
                <TouchableOpacity 
                   key={list.id} 
                   style={styles.listCard}
                   onPress={() => navigation.navigate('ListDetails', { list })}
                >
                   <Text style={styles.listEmoji}>{list.emoji}</Text>
                   <Text style={styles.listName} numberOfLines={1}>{list.name}</Text>
                   <Text style={styles.listCount}>{list.count} lieux</Text>
                </TouchableOpacity>
              ))
           )}
        </ScrollView>
      </View>

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
  
  emptyText: { color: '#64748B', textAlign: 'center', marginTop: 20, fontStyle: 'italic' },
  collectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 30, marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', letterSpacing: 1 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  continentTitle: { fontSize: 14, fontWeight: 'bold', width: 120, textAlign: 'center' },
  
  carouselContainer: {
    minHeight: 100, // Hauteur fixe pour le swipe
    backgroundColor: '#1E293B', // Fond légèrement plus clair pour détacher la zone
    borderRadius: 16,
    // paddingVertical: 5,
    borderWidth: 1, borderColor: '#334155'
  },
  continentPage: {
    alignItems: 'center', // Centrer la grille
    justifyContent: 'center',
  },
  medalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%'
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    opacity: 0.7
  },
  emptyContinentText: {
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic'
  },
  listCard: {
      width: 140, height: 100,
      backgroundColor: '#1E293B', borderRadius: 12,
      padding: 15, marginRight: 15,
      justifyContent: 'center',
      borderWidth: 1, borderColor: '#334155'
  },
  listEmoji: { fontSize: 24, marginBottom: 5 },
  listName: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  listCount: { color: '#94A3B8', fontSize: 12, marginTop: 2 }

});