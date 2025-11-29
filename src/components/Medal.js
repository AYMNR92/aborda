import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, Text, View } from 'react-native';

export const Medal = ({ country, isUnlocked }) => {
  
  // On utilise une taille un peu plus grande pour la qualité
  const flagUrl = `https://flagcdn.com/w320/${country.code.toLowerCase()}.png`;

  return (
    <View style={styles.wrapper}>
      
      {/* CONTENEUR PRINCIPAL (Rectangulaire) */}
      <View style={[
        styles.badgeContainer, 
        isUnlocked ? styles.unlockedShadow : styles.lockedStyle
      ]}>
        
        {isUnlocked ? (
          <>
            {/* 1. LE DRAPEAU (Mode 'contain' ou 'cover' adapté au rectangle) */}
            <Image 
              source={{ uri: flagUrl }} 
              style={styles.flagImage}
              resizeMode="cover" // 'cover' remplit tout le rectangle, c'est le plus joli
            />

            {/* 2. L'EFFET SHINE (Brillance en diagonale) */}
            <LinearGradient
              colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.1)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            
            {/* 3. BORDURE INTERNE */}
            <View style={styles.innerBorder} />
          </>
        ) : (
          // VERSION BLOQUÉE
          <Text style={styles.lockedText}>?</Text>
        )}

      </View>
      
      {/* NOM DU PAYS */}
      <Text style={styles.label} numberOfLines={1}>{country.name}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { 
    alignItems: 'center', 
    margin: 8,      // Un peu moins de marge
    width: 100      // Wrapper plus large pour accueillir le rectangle
  },
  
  badgeContainer: {
    width: 90,      // Largeur augmentée (Rectangle)
    height: 60,     // Hauteur standard (Ratio 3:2)
    borderRadius: 6, // Arrondi plus léger (style carte)
    justifyContent: 'center', 
    alignItems: 'center',
    overflow: 'hidden',
  },

  // --- STYLE DÉBLOQUÉ ---
  unlockedShadow: {
    backgroundColor: '#1E293B',
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3, 
    shadowRadius: 4, 
    elevation: 6,
  },
  flagImage: {
    width: '100%', 
    height: '100%',
  },
  innerBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 6,
  },

  // --- STYLE BLOQUÉ ---
  lockedStyle: {
    backgroundColor: '#0F172A',
    borderWidth: 1.5, 
    borderColor: '#334155',
    borderStyle: 'dashed',
  },
  lockedText: {
    color: '#334155',
    fontSize: 20,
    fontWeight: 'bold'
  },

  label: { 
    fontSize: 11, 
    color: '#94A3B8', 
    marginTop: 6, 
    textAlign: 'center', 
    fontWeight: '600',
    width: '100%' // Pour que le texte utilise toute la largeur dispo
  }
});