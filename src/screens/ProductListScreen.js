import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { subscribeToProducts } from '../services/firebaseService';
import { useAuth } from '../context/AuthContext';

const ProductListScreen = ({ route, navigation }) => {
  const { groupId, groupName } = route.params;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const canModifyStock = () => {
    // Assuming user object has a 'role' property, 'admin' or 'user'
    return user && user.role === 'admin';
  };

  useEffect(() => {
    const unsubscribe = subscribeToProducts(groupId, (productList) => {
      setProducts(productList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [groupId]);

  const getStockStatus = (stock) => {
    if (stock === 0) return { color: '#EF4444', text: 'Out of Stock', icon: 'error', bgColor: '#FEF2F2' };
    if (stock < 10) return { color: '#F59E0B', text: 'Low Stock', icon: 'warning', bgColor: '#FFFBEB' };
    return { color: '#10B981', text: 'In Stock', icon: 'check-circle', bgColor: '#ECFDF5' };
  };

  const getProductImage = (productName) => {
    const name = productName.toLowerCase();
    if (name.includes('bottle') || name.includes('water')) return require('../assets/bottle.png');
    if (name.includes('pot') || name.includes('cooker')) return require('../assets/pot.png');
    if (name.includes('pan') || name.includes('fry')) return require('../assets/pan.png');
    return null;
  };

  const renderItem = ({ item }) => {
    const stockStatus = getStockStatus(item.stock);
    const productImage = getProductImage(item.name);

    return (
      <TouchableOpacity 
        style={styles.productCard}
        onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
        activeOpacity={0.9}
      >
        <View style={styles.productCardContent}>

          {/* Product Image and Status */}
          <View style={styles.productHeader}>
            <View style={styles.productImageContainer}>
              {item.imageUri ? (
                <Image source={{ uri: item.imageUri }} style={styles.productImage} />
              ) : productImage ? (
                <Image source={productImage} style={styles.productImage} />
              ) : (
                <View style={styles.productIconContainer}>
                  <Icon name="inventory" size={24} color="#8E92BC" />
                </View>
              )}
            </View>

            <View style={[styles.stockBadge, { backgroundColor: stockStatus.bgColor }]}>
              <Icon name={stockStatus.icon} size={12} color={stockStatus.color} />
              <Text style={[styles.stockBadgeText, { color: stockStatus.color }]}>
                {stockStatus.text}
              </Text>
            </View>
          </View>

          {/* Product Information */}
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
            <Text style={styles.productPrice}>₹{item.mrp.toLocaleString()}</Text>

            <View style={styles.productDetails}>
              <View style={styles.detailItem}>
                <Icon name="inventory-2" size={14} color="#8E92BC" />
                <Text style={styles.detailText}>{item.stock} {item.unit}</Text>
              </View>
              <View style={styles.detailItem}>
                <Icon name="inbox" size={14} color="#8E92BC" />
                <Text style={styles.detailText}>{item.cartons || 0} cartons</Text>
              </View>
            </View>
          </View>

          {/* Action Button */}
          {canModifyStock() && (
            <TouchableOpacity 
              style={styles.updateButton}
              onPress={() => navigation.navigate('StockUpdate', { productId: item.id, productName: item.name })}
            >
              <LinearGradient
                colors={['#4F46E5', '#7C3AED']}
                style={styles.updateButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Icon name="edit" size={14} color="#fff" />
                <Text style={styles.updateButtonText}>Update</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>

        {/* Professional Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#2E3A59" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{groupName}</Text>
            <Text style={styles.headerSubtitle}>{products.length} products</Text>
          </View>
          <View style={styles.headerSpacer} />
          {/* Conditionally show add product button for admins only */}
          {canModifyStock() && (
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => navigation.navigate('AddProduct', { groupId, groupName })}
            >
              <Icon name="add" size={24} color="#4a80f5" />
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4F46E5" />
              <Text style={styles.loadingText}>Loading products...</Text>
            </View>
          ) : products.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyCard}>
                <View style={styles.emptyIconContainer}>
                  <Icon name="inventory" size={48} color="#8E92BC" />
                </View>
                <Text style={styles.emptyTitle}>No Products Found</Text>
                <Text style={styles.emptyDescription}>
                  Add your first product to get started with inventory management
                </Text>
                {canModifyStock() && (
                  <TouchableOpacity 
                    style={styles.addFirstButton}
                    onPress={() => navigation.navigate('AddProduct', { groupId, groupName })}
                  >
                    <LinearGradient
                      colors={['#4F46E5', '#7C3AED']}
                      style={styles.addFirstButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Icon name="add" size={18} color="#fff" />
                      <Text style={styles.addFirstButtonText}>Add Product</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ) : (
            <FlatList
              data={products}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.productsList}
              showsVerticalScrollIndicator={false}
            />
          )}

          {/* Floating Action Button */}
          {canModifyStock() && (
            <TouchableOpacity 
              style={styles.fab}
              onPress={() => navigation.navigate('AddProduct', { groupId, groupName })}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  headerContent: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E3A59',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8E92BC',
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
  },
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#8E92BC',
  },
  productsList: {
    padding: 16,
    paddingBottom: 100,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productCardContent: {
    padding: 16,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  productImageContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stockBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  productInfo: {
    marginBottom: 16,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E3A59',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 12,
  },
  productDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    color: '#8E92BC',
    marginLeft: 4,
  },
  updateButton: {
    alignSelf: 'flex-end',
    borderRadius: 12,
    overflow: 'hidden',
  },
  updateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
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
  addFirstButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  addFirstButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  addFirstButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
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
});

export default ProductListScreen;