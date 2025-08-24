import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { updateProductStock, subscribeToProductById } from '../services/firebaseService';
import { useAuth } from '../context/AuthContext';

const StockUpdateScreen = ({ route, navigation }) => {
  const { productId, productName } = route.params;
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [cartons, setCartons] = useState('');
  const [reason, setReason] = useState('');
  const [operation, setOperation] = useState('add'); // 'add' or 'remove'
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    navigation.setOptions({
      title: `Update Stock: ${productName}`,
    });
    
    // Set up real-time listener for product details
    const unsubscribe = subscribeToProductById(productId, (productData) => {
      setProduct(productData);
      setLoading(false);
    });
    
    // Clean up listener on component unmount
    return () => unsubscribe();
  }, [productId, productName]);



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

    // For stock removal, check if there's enough stock
    if (operation === 'remove' && quantityValue > product.stock) {
      Alert.alert('Error', 'Not enough stock available');
      return;
    }

    // For carton removal, check if there are enough cartons
    if (operation === 'remove' && cartonsValue > (product.cartons || 0)) {
      Alert.alert('Error', 'Not enough cartons available');
      return;
    }

    setUpdating(true);
    try {
      // Calculate new stock and cartons values
      const newStock = operation === 'add' 
        ? product.stock + quantityValue 
        : product.stock - quantityValue;
      
      const newCartons = operation === 'add' 
        ? (product.cartons || 0) + cartonsValue 
        : (product.cartons || 0) - cartonsValue;
      
      // Create change reason with operation type if no reason provided
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a80f5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.currentStock}>Current Stock: {product.stock} {product.unit}</Text>
            <Text style={styles.currentStock}>Current Cartons: {product.cartons || 0}</Text>
          </View>
          
          <View style={styles.operationToggle}>
            <TouchableOpacity 
              style={[styles.toggleButton, operation === 'add' && styles.toggleButtonActive]}
              onPress={() => setOperation('add')}
            >
              <Icon name="add" size={20} color={operation === 'add' ? '#fff' : '#4a80f5'} />
              <Text style={[styles.toggleText, operation === 'add' && styles.toggleTextActive]}>Add Stock</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.toggleButton, operation === 'remove' && styles.toggleButtonActive]}
              onPress={() => setOperation('remove')}
            >
              <Icon name="remove" size={20} color={operation === 'remove' ? '#fff' : '#4a80f5'} />
              <Text style={[styles.toggleText, operation === 'remove' && styles.toggleTextActive]}>Remove Stock</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.label}>Quantity ({product.unit})</Text>
          <TextInput
            style={styles.input}
            placeholder={`Enter quantity in ${product.unit}`}
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
          />
          
          <Text style={styles.label}>Cartons (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter number of cartons"
            value={cartons}
            onChangeText={setCartons}
            keyboardType="numeric"
          />
          
          <Text style={styles.label}>Reason (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Reason for stock change"
            value={reason}
            onChangeText={setReason}
          />
          
          <TouchableOpacity 
            style={[styles.button, operation === 'add' ? styles.addButton : styles.removeButton]}
            onPress={handleUpdateStock}
            disabled={updating}
          >
            {updating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon 
                  name={operation === 'add' ? 'add' : 'remove'} 
                  size={20} 
                  color="#fff" 
                  style={styles.buttonIcon} 
                />
                <Text style={styles.buttonText}>
                  {operation === 'add' ? 'Add to Stock' : 'Remove from Stock'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  productInfo: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  currentStock: {
    fontSize: 14,
    color: '#666',
  },
  operationToggle: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#4a80f5',
  },
  toggleButtonActive: {
    backgroundColor: '#4a80f5',
  },
  toggleText: {
    marginLeft: 5,
    color: '#4a80f5',
    fontWeight: 'bold',
  },
  toggleTextActive: {
    color: '#fff',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#333',
  },
  button: {
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  addButton: {
    backgroundColor: '#4a80f5',
  },
  removeButton: {
    backgroundColor: '#f55e4a',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default StockUpdateScreen;