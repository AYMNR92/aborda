import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

export const AuthScreen = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true); // Toggle entre Login et Inscription

  async function handleAuth() {
    setLoading(true);
    let error;

    if (isLogin) {
      // Login inchangé
      const res = await supabase.auth.signInWithPassword({ email, password });
      error = res.error;
    } else {
      // INSCRIPTION : ON PASSE LE PSEUDO EN METADATA
      if (!username) { Alert.alert("Oups", "Pseudo obligatoire !"); setLoading(false); return; }
      
      const res = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
            data: {
                username: username, // 👈 C'est ça la clé !
                // full_name: "..." (si tu veux l'ajouter aussi)
            }
        }
      });
      error = res.error;
    }

    if (error) Alert.alert("Erreur", error.message);
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.kcontainer}
    >
    <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        keyboardShouldPersistTaps="handled"
    >
    <View style={styles.container}>
      <Text style={styles.title}>{isLogin ? 'Connexion' : 'Inscription'}</Text>
      
      {!isLogin && (
        <TextInput 
          style={styles.input} 
          placeholder="Pseudo (@voyageur)" 
          placeholderTextColor="#94A3B8"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
      )}

      <TextInput 
        style={styles.input} 
        placeholder="Email" 
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput 
        style={styles.input} 
        placeholder="Mot de passe" 
        placeholderTextColor="#999"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={loading}>
        <Text style={styles.btnText}>{loading ? 'Chargement...' : (isLogin ? 'Se connecter' : "S'inscrire")}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.switchBtn}>
        <Text style={styles.switchText}>
          {isLogin ? "Pas de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
        </Text>
      </TouchableOpacity>
    </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  kcontainer: { 
    flex: 1, 
    backgroundColor: '#000000ff' // Même fond bleu nuit que le reste de l'app
  },
  scrollContent: {
    flexGrow: 1, 
    justifyContent: 'center', 
    //padding: 20 
  },
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#000' },
  title: { fontSize: 32, color: '#fff', fontWeight: 'bold', marginBottom: 40, textAlign: 'center' },
  input: { backgroundColor: '#1F2937', color: '#fff', padding: 15, borderRadius: 10, marginBottom: 15 },
  button: { backgroundColor: '#6050dc', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  switchBtn: { marginTop: 20, alignItems: 'center' },
  switchText: { color: '#BFDBFE' }
});