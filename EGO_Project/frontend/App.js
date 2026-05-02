import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Screen Imports
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProductListScreen from './src/screens/ProductListScreen';
import OrderHistoryScreen from './src/screens/OrderHistoryScreen';
import CustomizationScreen from './src/screens/CustomizationScreen';
import PromoScreen from './src/screens/PromoScreen';
import ReviewScreen from './src/screens/ReviewScreen';
import MediaScreen from './src/screens/MediaScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import AdminScreen from './src/screens/AdminScreen';

const API_URL = 'https://wmt-e-commerce.onrender.com';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Login');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [params, setParams] = useState({});
  const [cart, setCart] = useState([]);

  const navigate = (screenName, screenParams = {}) => {
    if (screenParams && screenParams.product) setSelectedProduct(screenParams.product);
    setParams(screenParams || {});
    setCurrentScreen(screenName);
  };

  const addToCart = (product) => {
    setCart([...cart, { ...product, cartId: Date.now() + Math.random() }]);
  };

  const removeFromCart = (cartId) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  const clearCart = () => setCart([]);

  const renderScreen = () => {
    const route = { params };
    switch (currentScreen) {
      case 'Login': return <LoginScreen navigate={navigate} route={route} apiUrl={API_URL} />;
      case 'Register': return <RegisterScreen navigate={navigate} route={route} apiUrl={API_URL} />;
      case 'Home': return <HomeScreen navigate={navigate} route={route} apiUrl={API_URL} />;
      case 'Products': return <ProductListScreen navigate={navigate} route={route} cartCount={cart.length} addToCart={addToCart} apiUrl={API_URL} />;
      case 'Orders': return <OrderHistoryScreen navigate={navigate} route={route} apiUrl={API_URL} />;
      case 'Customs': return <CustomizationScreen navigate={navigate} route={route} selectedProduct={selectedProduct} apiUrl={API_URL} />;
      case 'Checkout': return <CheckoutScreen navigate={navigate} route={route} selectedProduct={selectedProduct} cart={cart} removeFromCart={removeFromCart} clearCart={clearCart} apiUrl={API_URL} />;
      case 'Promos': return <PromoScreen navigate={navigate} route={route} apiUrl={API_URL} />;
      case 'Reviews': return <ReviewScreen navigate={navigate} route={route} selectedProduct={selectedProduct} apiUrl={API_URL} />;
      case 'Review': return <ReviewScreen navigate={navigate} route={route} selectedProduct={selectedProduct} />;
      case 'Media': return <MediaScreen navigate={navigate} route={route} apiUrl={API_URL} />;
      case 'Admin': return <AdminScreen navigate={navigate} route={route} apiUrl={API_URL} />;
      default: return <LoginScreen navigate={navigate} route={route} apiUrl={API_URL} />;
    }
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar style="auto" />
      
      {/* Header with Cart Icon */}
      {currentScreen !== 'Login' && currentScreen !== 'Register' && (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigate('Home')}>
                <Text style={styles.backBtn}>{currentScreen === 'Home' ? '🏠 EGO' : '← Back'}</Text>
            </TouchableOpacity>
            
            <View style={{ flex: 1 }} />

            {(currentScreen === 'Products' || currentScreen === 'Home') && global.userRole !== 'admin' && (
                <TouchableOpacity style={styles.cartIcon} onPress={() => navigate('Checkout')}>
                    <Text style={styles.cartText}>🛒 {cart.length}</Text>
                </TouchableOpacity>
            )}
        </View>
      )}

      {renderScreen()}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { 
    height: 100, 
    backgroundColor: '#6200ee', 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingTop: 50, 
    paddingHorizontal: 20 
  },
  backBtn: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  cartIcon: { backgroundColor: '#03dac6', padding: 8, borderRadius: 10 },
  cartText: { fontWeight: 'bold', color: '#000' }
});
