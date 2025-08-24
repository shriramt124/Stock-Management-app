
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

const AddProductScreen = ({ route, navigation }) => {
  const { groupId, groupName } = route.params;
  const [name, setName] = useState('');
  const [mrp, setMrp] = useState('');
  const [stock, setStock] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [cartons, setCartons] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddProduct = async () => {
    if (name.trim() === '') {
      Alert.alert('Error', 'Please enter a product name');
      return;
    }

    if (mrp.trim() === '') {
      Alert.alert('Error', 'Please enter product MRP');
      return;
    }

    if (stock.trim() === '') {
      Alert.alert('Error', 'Please enter initial stock');
      return;
    }

    setLoading(true);
    try {
      await firestore().collection('products').add({
        groupId,
        name: name.trim(),
        mrp: parseFloat(mrp),
        stock: parseInt(stock, 10),
        unit: unit.trim(),
        cartons: cartons.trim() ? parseInt(cartons, 10) : 0,
        description: description.trim(),
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      });
      
      Alert.alert('Success', 'Product added successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Error adding product:', error);
      Alert.alert('Error', 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  const unitOptions = ['pcs', 'kg', 'grams', 'liters', 'ml', 'boxes', 'sets'];

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Add New Product</Text>
          <Text style={styles.headerSubtitle}>to {groupName}</Text>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.formContainer}>
            <View style={styles.imageContainer}>
              <View style={styles.imagePlaceholder}>
                <Icon name="add-a-photo" size={32} color="#666" />
                <Text style={styles.imagePlaceholderText}>Add Product Image</Text>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                <Icon name="inventory" size={16} color="#333" /> Product Name
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter product name (e.g., Steel Bottle)"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#999"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                <Icon name="currency-rupee" size={16} color="#333" /> MRP (₹)
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter maximum retail price"
                value={mrp}
                onChangeText={setMrp}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>
            
            <View style={styles.rowContainer}>
              <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>
                  <Icon name="inventory-2" size={16} color="#333" /> Initial Stock
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Quantity"
                  value={stock}
                  onChangeText={setStock}
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>
              
              <View style={[styles.inputContainer, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.label}>
                  <Icon name="straighten" size={16} color="#333" /> Unit
                </Text>
                <View style={styles.unitSelector}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {unitOptions.map((unitOption) => (
                      <TouchableOpacity
                        key={unitOption}
                        style={[
                          styles.unitOption,
                          unit === unitOption && styles.unitOptionSelected
                        ]}
                        onPress={() => setUnit(unitOption)}
                      >
                        <Text style={[
                          styles.unitOptionText,
                          unit === unitOption && styles.unitOptionTextSelected
                        ]}>
                          {unitOption}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
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
                <Icon name="description" size={16} color="#333" /> Description (Optional)
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter product description"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                placeholderTextColor="#999"
              />
            </View>
            
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddProduct}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#2ed573', '#17c0eb']}
                style={styles.addButtonGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Icon name="add" size={24} color="#fff" />
                    <Text style={styles.addButtonText}>Add Product</Text>
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
  header: {
    padding: 20,
    alignItems: 'center',
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
  },
  formContainer: {
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    minHeight: '100%',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#dee2e6',
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  rowContainer: {
    flexDirection: 'row',
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
  unitSelector: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    padding: 5,
  },
  unitOption: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  unitOptionSelected: {
    backgroundColor: '#667eea',
  },
  unitOptionText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  unitOptionTextSelected: {
    color: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  addButton: {
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  addButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 10,
  },
});

export default AddProductScreen;
