
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Alert, ImageBackground, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [productGroups, setProductGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductGroups();
  }, []);

  const fetchProductGroups = async () => {
    setLoading(true);
    try {
      const querySnapshot = await firestore().collection('productGroups').get();
      const groups = [];
      querySnapshot.forEach((doc) => {
        groups.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      setProductGroups(groups);
    } catch (error) {
      console.error('Error fetching product groups:', error);
      Alert.alert('Error', 'Failed to load product groups');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await auth().signOut();
              navigation.replace('Login');
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          }
        }
      ]
    );
  };

  const getGroupIcon = (groupName) => {
    const name = groupName.toLowerCase();
    if (name.includes('cook') || name.includes('utensil')) return 'restaurant';
    if (name.includes('steel') || name.includes('metal')) return 'build';
    if (name.includes('gift') || name.includes('set')) return 'card-giftcard';
    if (name.includes('hot') || name.includes('pot')) return 'local-fire-department';
    return 'category';
  };

  const renderItem = ({ item, index }) => (
    <TouchableOpacity 
      style={[styles.card, { marginLeft: index % 2 === 0 ? 0 : 10 }]}
      onPress={() => navigation.navigate('ProductList', { groupId: item.id, groupName: item.name })}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.cardIconContainer}>
          <Icon name={getGroupIcon(item.name)} size={32} color="#fff" />
        </View>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardSubtitle} numberOfLines={2}>
          {item.description || 'Product group'}
        </Text>
        <View style={styles.cardArrow}>
          <Icon name="arrow-forward" size={20} color="#fff" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#f093fb', '#f5576c']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Icon name="inventory-2" size={28} color="#fff" />
            <Text style={styles.headerTitle}>Stock Manager</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Icon name="power-settings-new" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Product Categories</Text>
            <Text style={styles.sectionSubtitle}>Manage your inventory by category</Text>
          </View>

          {productGroups.length === 0 ? (
            <View style={styles.emptyContainer}>
              <LinearGradient
                colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
                style={styles.emptyCard}
              >
                <Icon name="inventory" size={64} color="#666" />
                <Text style={styles.emptyText}>No Categories Found</Text>
                <Text style={styles.emptySubtext}>Start by creating your first product category</Text>
                <TouchableOpacity 
                  style={styles.createFirstButton}
                  onPress={() => navigation.navigate('ProductGroup')}
                >
                  <Icon name="add" size={20} color="#fff" />
                  <Text style={styles.createFirstButtonText}>Create Category</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          ) : (
            <FlatList
              data={productGroups}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              numColumns={2}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
              columnWrapperStyle={styles.row}
            />
          )}

          <TouchableOpacity 
            style={styles.fabButton}
            onPress={() => navigation.navigate('ProductGroup')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#ff9a9e', '#fecfef']}
              style={styles.fabGradient}
            >
              <Icon name="add" size={28} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionHeader: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 5,
  },
  list: {
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    width: (width - 50) / 2,
    marginBottom: 15,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardGradient: {
    padding: 20,
    height: 140,
    justifyContent: 'space-between',
  },
  cardIconContainer: {
    alignSelf: 'flex-start',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  cardSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  cardArrow: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 15,
    padding: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCard: {
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    width: '90%',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  createFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  createFirstButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  fabButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;
