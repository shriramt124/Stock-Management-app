
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { subscribeToProducts } from '../services/firebaseService';

const ProductListScreen = ({ route, navigation }) => {
  const { groupId, groupName } = route.params;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigation.setOptions({
      title: groupName,
      headerStyle: {
        backgroundColor: '#667eea',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    });
    
    const unsubscribe = subscribeToProducts(groupId, (productList) => {
      setProducts(productList);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [groupId]);

  const getStockStatus = (stock) => {
    if (stock === 0) return { color: '#ff4757', text: 'Out of Stock', icon: 'error' };
    if (stock < 10) return { color: '#ffa502', text: 'Low Stock', icon: 'warning' };
    return { color: '#2ed573', text: 'In Stock', icon: 'check-circle' };
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
        style={styles.card}
        onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#ffffff', '#f8f9fa']}
          style={styles.cardContent}
        >
          <View style={styles.cardHeader}>
            <View style={styles.productImageContainer}>
              {productImage ? (
                <Image source={productImage} style={styles.productImage} />
              ) : (
                <View style={styles.productIconContainer}>
                  <Icon name="inventory" size={32} color="#667eea" />
                </View>
              )}
            </View>
            <View style={styles.stockBadge}>
              <Icon name={stockStatus.icon} size={12} color={stockStatus.color} />
              <Text style={[styles.stockBadgeText, { color: stockStatus.color }]}>
                {stockStatus.text}
              </Text>
            </View>
          </View>

          <View style={styles.productInfo}>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productMrp}>₹{item.mrp}</Text>
            
            <View style={styles.stockDetails}>
              <View style={styles.stockItem}>
                <Icon name="inventory-2" size={16} color="#666" />
                <Text style={styles.stockText}>{item.stock} {item.unit}</Text>
              </View>
              <View style={styles.stockItem}>
                <Icon name="inbox" size={16} color="#666" />
                <Text style={styles.stockText}>{item.cartons || 0} cartons</Text>
              </View>
            </View>
          </View>

          <View style={styles.cardActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('StockUpdate', { productId: item.id, productName: item.name })}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.actionButtonGradient}
              >
                <Icon name="edit" size={16} color="#fff" />
                <Text style={styles.actionButtonText}>Update</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Products in {groupName}</Text>
          <Text style={styles.headerSubtitle}>{products.length} items</Text>
        </View>

        <View style={styles.content}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loadingText}>Loading products...</Text>
            </View>
          ) : products.length === 0 ? (
            <View style={styles.emptyContainer}>
              <LinearGradient
                colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
                style={styles.emptyCard}
              >
                <Icon name="inventory" size={64} color="#666" />
                <Text style={styles.emptyText}>No Products Found</Text>
                <Text style={styles.emptySubtext}>Add your first product to get started</Text>
                <TouchableOpacity 
                  style={styles.addFirstButton}
                  onPress={() => navigation.navigate('AddProduct', { groupId, groupName })}
                >
                  <Icon name="add" size={20} color="#fff" />
                  <Text style={styles.addFirstButtonText}>Add Product</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          ) : (
            <FlatList
              data={products}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
            />
          )}

          <TouchableOpacity 
            style={styles.fabButton}
            onPress={() => navigation.navigate('AddProduct', { groupId, groupName })}
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
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  content: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  list: {
    padding: 15,
    paddingBottom: 100,
  },
  card: {
    marginBottom: 15,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  productImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#f0f2f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  productIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stockBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  productInfo: {
    marginBottom: 15,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  productMrp: {
    fontSize: 16,
    color: '#e74c3c',
    fontWeight: '600',
    marginBottom: 10,
  },
  stockDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stockItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  cardActions: {
    alignItems: 'flex-end',
  },
  actionButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  addFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  addFirstButtonText: {
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

export default ProductListScreen;
