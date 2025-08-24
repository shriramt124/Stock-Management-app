
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { updateProductStock, subscribeToProductById } from '../services/firebaseService';
import { useAuth } from '../context/AuthContext';

const StockUpdateScreen = ({ route, navigation }) => {
  const { productId, productName } = route.params;
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [cartons, setCartons] = useState('');
  const [reason, setReason] = useState('');
  const [operation, setOperation] = useState('add');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    navigation.setOptions({
      title: `Update Stock`,
      headerStyle: {
        backgroundColor: operation === 'add' ? '#2ed573' : '#ff4757',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    });
    
    const unsubscribe = subscribeToProductById(productId, (productData) => {
      setProduct(productData);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [productId, operation]);

  const handleUpdateStock = async () => {
    if (!quantity || quantity.trim() === '') {
      Alert.alert('Error', 'Please enter quantity');
      return;
    }

    const quantityValue = parseInt(quantity, 10);
    if (isNaN(quantityValue) || quantityValue <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    let cartonsValue = 0;
    if (cartons && cartons.trim() !== '') {
      cartonsValue = parseInt(cartons, 10);
      if (isNaN(cartonsValue)) {
        Alert.alert('Error', 'Please enter a valid number of cartons');
        return;
      }
    }

    if (operation === 'remove' && quantityValue > product.stock) {
      Alert.alert('Error', 'Not enough stock available');
      return;
    }

    if (operation === 'remove' && cartonsValue > (product.cartons || 0)) {
      Alert.alert('Error', 'Not enough cartons available');
      return;
    }

    setUpdating(true);
    try {
      const newStock = operation === 'add' 
        ? product.stock + quantityValue 
        : product.stock - quantityValue;
      
      const newCartons = operation === 'add' 
        ? (product.cartons || 0) + cartonsValue 
        : (product.cartons || 0) - cartonsValue;
      
      const changeReason = reason.trim() || 
        `${operation === 'add' ? 'Added' : 'Removed'} ${quantityValue} units${cartonsValue > 0 ? ` and ${cartonsValue} cartons` : ''}`;
      
      const result = await updateProductStock(
        productId, 
        newStock, 
        newCartons, 
        currentUser.uid,
        changeReason
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update stock');
      }
      
      Alert.alert(
        'Success', 
        `Stock ${operation === 'add' ? 'added' : 'removed'} successfully`, 
        [{
          text: 'OK',
          onPress: () => navigation.goBack(),
        }]
      );
    } catch (error) {
      console.error('Error updating stock:', error);
      Alert.alert('Error', 'Failed to update stock');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading product...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient 
      colors={operation === 'add' ? ['#2ed573', '#17c0eb'] : ['#ff4757', '#ff3838']} 
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.headerSubtitle}>Update your inventory</Text>
          </View>

          <View style={styles.formContainer}>
            <LinearGradient
              colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.9)']}
              style={styles.currentStockCard}
            >
              <View style={styles.stockRow}>
                <View style={styles.stockItem}>
                  <Icon name="inventory-2" size={24} color="#667eea" />
                  <View style={styles.stockDetails}>
                    <Text style={styles.stockLabel}>Current Stock</Text>
                    <Text style={styles.stockValue}>{product.stock} {product.unit}</Text>
                  </View>
                </View>
                <View style={styles.stockItem}>
                  <Icon name="inbox" size={24} color="#667eea" />
                  <View style={styles.stockDetails}>
                    <Text style={styles.stockLabel}>Cartons</Text>
                    <Text style={styles.stockValue}>{product.cartons || 0}</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
            
            <View style={styles.operationToggle}>
              <TouchableOpacity 
                style={[styles.toggleButton, operation === 'add' && styles.toggleButtonActive]}
                onPress={() => setOperation('add')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={operation === 'add' ? ['#2ed573', '#17c0eb'] : ['transparent', 'transparent']}
                  style={styles.toggleGradient}
                >
                  <Icon name="add" size={20} color={operation === 'add' ? '#fff' : '#666'} />
                  <Text style={[styles.toggleText, operation === 'add' && styles.toggleTextActive]}>
                    Add Stock
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.toggleButton, operation === 'remove' && styles.toggleButtonActive]}
                onPress={() => setOperation('remove')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={operation === 'remove' ? ['#ff4757', '#ff3838'] : ['transparent', 'transparent']}
                  style={styles.toggleGradient}
                >
                  <Icon name="remove" size={20} color={operation === 'remove' ? '#fff' : '#666'} />
                  <Text style={[styles.toggleText, operation === 'remove' && styles.toggleTextActive]}>
                    Remove Stock
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                <Icon name="inventory-2" size={16} color="#333" /> Quantity ({product.unit})
              </Text>
              <TextInput
                style={styles.input}
                placeholder={`Enter quantity in ${product.unit}`}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                <Icon name="inbox" size={16} color="#333" /> Cartons (Optional)
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter number of cartons"
                value={cartons}
                onChangeText={setCartons}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                <Icon name="note" size={16} color="#333" /> Reason (Optional)
              </Text>
              <TextInput
                style={[styles.input, styles.reasonInput]}
                placeholder="Reason for stock change"
                value={reason}
                onChangeText={setReason}
                multiline
                numberOfLines={3}
                placeholderTextColor="#999"
              />
            </View>
            
            <TouchableOpacity 
              style={styles.updateButton}
              onPress={handleUpdateStock}
              disabled={updating}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={operation === 'add' ? ['#2ed573', '#17c0eb'] : ['#ff4757', '#ff3838']}
                style={styles.updateButtonGradient}
              >
                {updating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Icon 
                      name={operation === 'add' ? 'add' : 'remove'} 
                      size={24} 
                      color="#fff" 
                    />
                    <Text style={styles.updateButtonText}>
                      {operation === 'add' ? 'Add to Stock' : 'Remove from Stock'}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    marginTop: 20,
  },
  currentStockCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
  },
  stockRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stockItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockDetails: {
    marginLeft: 10,
  },
  stockLabel: {
    fontSize: 12,
    color: '#666',
  },
  stockValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  operationToggle: {
    flexDirection: 'row',
    marginBottom: 25,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#e9ecef',
  },
  toggleButton: {
    flex: 1,
  },
  toggleGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  toggleText: {
    marginLeft: 8,
    fontWeight: 'bold',
    color: '#666',
  },
  toggleTextActive: {
    color: '#fff',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
    color: '#333',
    fontSize: 16,
  },
  reasonInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  updateButton: {
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  updateButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
  },
  updateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 10,
  },
});

export default StockUpdateScreen;
