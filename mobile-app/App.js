import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Smart AI Hotel</Text>
        <TouchableOpacity style={styles.profileBtn}>
          <Text style={styles.profileTxt}>J</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Welcome to Luxury</Text>
          <Text style={styles.bannerSub}>Book your perfect stay today.</Text>
          <TouchableOpacity style={styles.bookBtn}>
            <Text style={styles.bookBtnTxt}>Find a Room</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Our Services</Text>
        <View style={styles.grid}>
          {['Book Room', 'Restaurant', 'AI Chat', 'My Stay'].map((item, i) => (
            <TouchableOpacity key={i} style={styles.card}>
              <View style={styles.iconPlaceholder} />
              <Text style={styles.cardText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e1b4b',
  },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileTxt: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  content: {
    paddingHorizontal: 20,
  },
  banner: {
    backgroundColor: '#1e1b4b',
    padding: 24,
    borderRadius: 20,
    marginBottom: 30,
  },
  bannerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  bannerSub: {
    color: '#c7d2fe',
    marginBottom: 15,
  },
  bookBtn: {
    backgroundColor: '#4f46e5',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  bookBtnTxt: {
    color: 'white',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e1b4b',
    marginBottom: 15,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  iconPlaceholder: {
    width: 40,
    height: 40,
    backgroundColor: '#e0e7ff',
    borderRadius: 20,
    marginBottom: 10,
  },
  cardText: {
    fontWeight: '600',
    color: '#334155',
  }
});
