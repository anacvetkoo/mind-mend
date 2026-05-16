import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';
import { db } from './firebaseConfig'; // Uvozimo našo konfiguracijo
import { collection, addDoc } from "firebase/firestore"; 

export default function App() {

  // test baze --> to vse gre potem ven
  const posljiTestniPodatek = async () => {
    try {
      const docRef = await addDoc(collection(db, "test_povezave"), {
        uporabnik: "Ekipa MindMend",
        status: "Povezava dela!",
        cas: new Date().toISOString()
      });
      alert("Uspeh! V bazo dodan dokument z ID: " + docRef.id);
    } catch (e) {
      console.error("Napaka: ", e);
      alert("Napaka pri povezavi. Preveri konzolo!");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MindMend App</Text>
      <Text>Tvoj Expo projekt teče.</Text>
      
      <View style={{ marginTop: 20 }}>
        <Button 
          title="Testiraj povezavo z bazo" 
          onPress={posljiTestniPodatek} 
          color="#4CAF50"
        />
      </View>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  }
});