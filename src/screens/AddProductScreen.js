import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.formContainer}>
          <Text style={styles.groupName}>Group: {groupName}</Text>
          
          <Text style={styles.label}>Product Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter product name (e.g., Bottle)"
            value={name}
            onChangeText={setName}
          />
          
          <Text style={styles.label}>MRP (₹)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter MRP"
            value={mrp}
            onChangeText={setMrp}
            keyboardType="numeric"
          />
          
          <Text style={styles.label}>Initial Stock</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter initial stock quantity"
            value={stock}
            onChangeText={setStock}
            keyboardType="numeric"
          />
          
          <Text style={styles.label}>Unit</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter unit (e.g., pcs, kg, etc.)"
            value={unit}
            onChangeText={setUnit}
          />
          
          <Text style={styles.label}>Cartons (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter number of cartons"
            value={cartons}
            onChangeText={setCartons}
            keyboardType="numeric"
          />
          
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter product description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
          
          <TouchableOpacity 
            style={styles.button}
            onPress={handleAddProduct}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon name="add" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Add Product</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 20,
  },
  groupName: {
    fontSize: 16,
    color: '#4a80f5',
    fontWeight: 'bold',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#4a80f5',
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
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

export default AddProductScreen;