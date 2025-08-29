import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [productGroups, setProductGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [isAdminUser, setIsAdminUser] = useState(false);

  const fetchUserData = useCallback(async (user) => {
    if (!user) return;
    try {
      const userDoc = await firestore().collection('users').doc(user.uid).get();
      if (userDoc.exists) {
        const userData = { id: user.uid, ...userDoc.data() };
        setCurrentUserData(userData);
        setIsAdminUser(userData.role === 'admin');
      } else {
        // Handle case where user document doesn't exist yet (e.g., first login)
        // You might want to create a default user document here or prompt for role
        console.warn(`User document not found for UID: ${user.uid}`);
        setIsAdminUser(false); // Default to false if no role is found
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to load user profile.');
    }
  }, []);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      if (user) {
        fetchUserData(user);
        fetchProductGroups();
      } else {
        setUser(null);
        setProductGroups([]);
        navigation.replace('Login');
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [fetchUserData, navigation]);

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
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
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

  const getGroupColor = (index) => {
    const colors = [
      ['#4F46E5', '#7C3AED'],
      ['#059669', '#10B981'],
      ['#DC2626', '#EF4444'],
      ['#D97706', '#F59E0B'],
      ['#7C2D12', '#EA580C'],
      ['#1E40AF', '#3B82F6'],
    ];
    return colors[index % colors.length];
  };

  const menuItems = [
    { id: '1', title: 'Product Categories', subtitle: 'View all categories', icon: 'category', color: '#4F46E5', onPress: () => navigation.navigate('ProductList', { screen: 'ProductListScreen' }) },
    ...(isAdminUser ? [
      { id: '2', title: 'Manage Users', subtitle: 'Add, edit, or remove users', icon: 'people', color: '#10B981', onPress: () => navigation.navigate('UserManagement') },
      { id: '3', title: 'Add Product', subtitle: 'Add new products to inventory', icon: 'add-shopping-cart', color: '#F59E0B', onPress: () => navigation.navigate('ProductForm', { mode: 'add' }) },
    ] : []),
    { id: '4', title: 'Order History', subtitle: 'View your past orders', icon: 'history', color: '#EF4444', onPress: () => navigation.navigate('OrderHistory') }
  ];

  const isAdmin = () => isAdminUser;

  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => navigation.navigate('ProductList', { groupId: item.id, groupName: item.name })}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={getGroupColor(index)}
        style={styles.categoryCardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.categoryIconContainer}>
          <Icon name={getGroupIcon(item.name)} size={28} color="#fff" />
        </View>
        <Text style={styles.categoryTitle} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.categoryDescription} numberOfLines={2}>
          {item.description || 'Product category'}
        </Text>
        <View style={styles.categoryArrow}>
          <Icon name="arrow-forward" size={16} color="rgba(255,255,255,0.8)" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Professional Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <View style={styles.logoContainer}>
                <Icon name="inventory-2" size={24} color="#4F46E5" />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.appName}>Stock Manager</Text>
                <Text style={styles.welcomeText}>Welcome, {currentUserData?.name || currentUserData?.email?.split('@')[0] || 'User'}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Icon name="logout" size={20} color="#8E92BC" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsCard}>
            <LinearGradient
              colors={['#4F46E5', '#7C3AED']}
              style={styles.statsCardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Icon name="category" size={24} color="#fff" />
              <View style={styles.statsContent}>
                <Text style={styles.statsNumber}>{productGroups.length}</Text>
                <Text style={styles.statsLabel}>Categories</Text>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Product Categories</Text>
            <Text style={styles.sectionSubtitle}>Manage your inventory by category</Text>
          </View>

          {productGroups.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyCard}>
                <View style={styles.emptyIconContainer}>
                  <Icon name="inventory" size={48} color="#8E92BC" />
                </View>
                <Text style={styles.emptyTitle}>No Categories Yet</Text>
                <Text style={styles.emptyDescription}>
                  Start by creating your first product category to organize your inventory
                </Text>
                {isAdminUser && (
                  <TouchableOpacity
                    style={styles.createButton}
                    onPress={() => navigation.navigate('ProductGroup')}
                  >
                    <LinearGradient
                      colors={['#4F46E5', '#7C3AED']}
                      style={styles.createButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Icon name="add" size={18} color="#fff" />
                      <Text style={styles.createButtonText}>Create Category</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ) : (
            <FlatList
              data={productGroups}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              numColumns={2}
              contentContainerStyle={styles.categoriesGrid}
              showsVerticalScrollIndicator={false}
              columnWrapperStyle={styles.categoriesRow}
            />
          )}

          {/* Floating Action Button */}
          {isAdminUser && (
            <TouchableOpacity
              style={styles.fab}
              onPress={() => navigation.navigate('ProductGroup')}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#4F46E5', '#7C3AED']}
                style={styles.fabGradient}
              >
                <Icon name="add" size={24} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  appName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E3A59',
  },
  welcomeText: {
    fontSize: 14,
    color: '#8E92BC',
    marginTop: 2,
  },
  logoutButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    color: '#8E92BC',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  statsCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  statsContent: {
    marginLeft: 16,
  },
  statsNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  statsLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2E3A59',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#8E92BC',
    marginTop: 4,
  },
  categoriesGrid: {
    paddingBottom: 100,
  },
  categoriesRow: {
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: (width - 50) / 2,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryCardGradient: {
    padding: 20,
    height: 140,
    justifyContent: 'space-between',
  },
  categoryIconContainer: {
    alignSelf: 'flex-start',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginTop: 8,
  },
  categoryDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  categoryArrow: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2E3A59',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#8E92BC',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  createButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 0, // Adjusted to be on the right side
    width: 56,
    height: 56,
    borderRadius: 28,
    elevation: 6,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Styles for the new menu-based UI
  welcomeSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  userInfo: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E3A59',
    marginTop: 8,
  },
  roleContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  roleTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  adminRole: {
    backgroundColor: '#F59E0B', // Admin color
  },
  userRole: {
    backgroundColor: '#4F46E5', // User color
  },
  menuContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  menuCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  menuGradient: {
    padding: 16,
  },
  menuContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    flex: 1,
    marginLeft: 16,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E3A59',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#8E92BC',
    marginTop: 2,
  },
});

export default HomeScreen;