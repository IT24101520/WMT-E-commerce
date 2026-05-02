import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    Alert, ActivityIndicator, FlatList, ScrollView, Image, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';

const BASE_URL = 'https://wmt-e-commerce.onrender.com';

const AdminScreen = ({ navigate, route }) => {
    // Determine initial tab from route params (if navigated from HomeScreen portals)
    const initialTab = route?.params?.tab || 'Products';
    
    const [activeTab, setActiveTab] = useState(initialTab);
    const [subTab, setSubTab] = useState('Add'); // 'Add' or 'Current'
    const [loading, setLoading] = useState(false);

    // Form
    const [prodName, setProdName] = useState('');
    const [prodPrice, setProdPrice] = useState('');
    const [prodStock, setProdStock] = useState('');
    const [prodDesc, setProdDesc] = useState('');
    const [prodCategory, setProdCategory] = useState('Specialty');
    const [prodImage, setProdImage] = useState(null);
    const [productList, setProductList] = useState([]);

    // Data
    const [orders, setOrders] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [users, setUsers] = useState([]);
    
    // Promos
    const [promoCode, setPromoCode] = useState('');
    const [promoDiscount, setPromoDiscount] = useState('');

    // Admin Creation
    const [adminName, setAdminName] = useState('');
    const [adminEmail, setAdminEmail] = useState('');
    const [adminPassword, setAdminPassword] = useState('');

    const TABS = [
        { id: 'Products', icon: '📦', label: 'Products' },
        { id: 'Orders', icon: '🚚', label: 'Orders' },
        { id: 'Reviews', icon: '⭐', label: 'Pending Reviews' },
        { id: 'Promos', icon: '🎟️', label: 'Promos' },
        { id: 'Users', icon: '👥', label: 'Users' },
        { id: 'Admins', icon: '👨‍💼', label: 'Admins' },
    ];

    useEffect(() => { loadTabData(activeTab); }, [activeTab]);
    
    // Listen for tab parameter changes if user navigates back and selects a different portal card
    useEffect(() => {
        if (route?.params?.tab) setActiveTab(route.params.tab);
    }, [route?.params?.tab]);

    const loadTabData = (tab) => {
        if (tab === 'Products') fetchProducts();
        if (tab === 'Orders') fetchOrders();
        if (tab === 'Reviews') fetchReviews();
        if (tab === 'Users') fetchUsers();
    };

    // ─── API ────────────────────────────────────────────────────────
    const fetchProducts = async () => {
        setLoading(true);
        try { const res = await api.get('/products'); setProductList(res.data || []); }
        catch (e) {} finally { setLoading(false); }
    };
    const fetchOrders = async () => {
        setLoading(true);
        try { const res = await api.get('/orders/all'); setOrders(res.data || []); }
        catch (e) {} finally { setLoading(false); }
    };
    const fetchReviews = async () => {
        setLoading(true);
        try { const res = await api.get('/reviews/all'); setReviews(res.data || []); }
        catch (e) {} finally { setLoading(false); }
    };
    const fetchUsers = async () => {
        setLoading(true);
        try { const res = await api.get('/auth/users'); setUsers(res.data || []); }
        catch (e) {} finally { setLoading(false); }
    };

    const handleAddProduct = async () => {
        if (!prodName.trim() || !prodPrice.trim() || !prodStock.trim()) {
            return Alert.alert('Missing Info', 'Details required.');
        }
        setLoading(true);
        const formData = new FormData();
        formData.append('name', prodName.trim());
        formData.append('description', prodDesc.trim() || 'Premium item.');
        formData.append('price', prodPrice.trim());
        formData.append('stock', prodStock.trim());
        formData.append('category', prodCategory);
        if (prodImage) formData.append('image', { uri: prodImage, name: 'product.jpg', type: 'image/jpeg' });

        try {
            await api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            Alert.alert('✅ Success!', `"${prodName}" added.`);
            setProdName(''); setProdPrice(''); setProdStock(''); setProdDesc(''); setProdImage(null);
            fetchProducts();
            setSubTab('Current');
        } catch (e) {
            Alert.alert('Error', 'Failed to add product.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePromo = async () => {
        if (!promoCode.trim() || !promoDiscount.trim()) return Alert.alert('Info', 'Fields required');
        setLoading(true);
        try {
            const expiryDate = new Date(); expiryDate.setDate(expiryDate.getDate() + 30);
            await api.post('/promos', {
                code: promoCode.trim().toUpperCase(),
                discountPercentage: parseInt(promoDiscount, 10),
                minOrderAmount: 0,
                expiryDate: expiryDate.toISOString(),
            });
            Alert.alert('✅ Promo Live', `${promoCode.toUpperCase()} is active now!`);
            setPromoCode(''); setPromoDiscount('');
        } catch (e) { Alert.alert('Error', 'Failed to launch code.'); } finally { setLoading(false); }
    };

    const handleUpdateOrder = async (id, status) => {
        try { await api.put(`/orders/${id}/status`, { status }); fetchOrders(); } 
        catch (e) { Alert.alert('Error'); }
    };

    const handleApproveReview = async (id) => {
        try { await api.put(`/reviews/approve/${id}`); fetchReviews(); } 
        catch (e) { Alert.alert('Error'); }
    };

    const handleRegisterAdmin = async () => {
        if (!adminName.trim() || !adminEmail.trim() || !adminPassword.trim()) {
            return Alert.alert('Missing Info', 'Please fill all fields');
        }
        setLoading(true);
        try {
            await api.post('/auth/admin', { name: adminName.trim(), email: adminEmail.trim(), password: adminPassword });
            Alert.alert('✅ Admin Created!', `${adminName} now has Master Access.`);
            setAdminName(''); setAdminEmail(''); setAdminPassword('');
        } catch (e) {
            Alert.alert('Error', e.response?.data?.message || 'Failed to create admin');
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        const res = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1,1], quality: 0.7 });
        if (!res.canceled) setProdImage(res.assets[0].uri);
    };

    // ─── Renders ──────────────────────────────────────────────────
    const renderProducts = () => (
        <View style={{ flex: 1 }}>
            {/* Sub Nav */}
            <View style={styles.subTabBar}>
                <TouchableOpacity style={[styles.subTab, subTab === 'Add' && styles.subTabActive]} onPress={() => setSubTab('Add')}>
                    <Text style={[styles.subTabText, subTab === 'Add' && styles.subTabTextActive]}>➕ Add New Item</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.subTab, subTab === 'Current' && styles.subTabActive]} onPress={() => setSubTab('Current')}>
                    <Text style={[styles.subTabText, subTab === 'Current' && styles.subTabTextActive]}>📋 Current Items ({productList.length})</Text>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
                {subTab === 'Add' ? (
                    <View style={styles.glassCard}>
                        <Text style={styles.cardHeader}>Add to Inventory</Text>
                        <TextInput style={styles.input} placeholder="Product Name *" placeholderTextColor="rgba(255,255,255,0.3)" value={prodName} onChangeText={setProdName} />
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Price ($) *" placeholderTextColor="rgba(255,255,255,0.3)" keyboardType="numeric" value={prodPrice} onChangeText={setProdPrice} />
                            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Stock *" placeholderTextColor="rgba(255,255,255,0.3)" keyboardType="numeric" value={prodStock} onChangeText={setProdStock} />
                        </View>
                        <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} placeholder="Description" placeholderTextColor="rgba(255,255,255,0.3)" multiline value={prodDesc} onChangeText={setProdDesc} />
                        
                        <TouchableOpacity style={styles.uploadArea} onPress={pickImage}>
                            {prodImage ? <Image source={{ uri: prodImage }} style={styles.previewImg} /> : <Text style={styles.uploadText}>📸 Tap to Upload Image</Text>}
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.actionBtn, loading && {opacity: 0.7}]} onPress={handleAddProduct} disabled={loading}>
                            <Text style={styles.actionBtnText}>{loading ? 'Processing...' : 'Add Product'}</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.glassCardList}>
                        {productList.length === 0 ? <Text style={styles.emptyText}>No items found.</Text> :
                            productList.map(p => (
                                <View key={p._id} style={styles.rowItem}>
                                    {p.imageUrl ? <Image source={{ uri: `${BASE_URL}${p.imageUrl}` }} style={styles.rowImg} /> : <View style={styles.rowImgFallback}><Text>🎁</Text></View>}
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                        <Text style={styles.rowTitle}>{p.name}</Text>
                                        <Text style={styles.rowSub}>${p.price?.toFixed(2)}  ·  Stock: {p.stock}</Text>
                                    </View>
                                </View>
                            ))
                        }
                    </View>
                )}
            </ScrollView>
        </View>
    );

    const renderOrders = () => (
        <FlatList data={orders} keyExtractor={i => i._id} contentContainerStyle={styles.tabContent}
            ListEmptyComponent={<Text style={styles.emptyText}>No orders received yet.</Text>}
            renderItem={({ item }) => (
                <View style={styles.glassCard}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.rowTitle}>Order #{item._id?.slice(-6).toUpperCase()}</Text>
                        <Text style={styles.rowMoney}>${item.totalAmount?.toFixed(2)}</Text>
                    </View>
                    <Text style={styles.rowSub}>User: {item.user?.name}</Text>
                    <View style={styles.statusChip}><Text style={styles.statusChipText}>{item.status || 'Pending'}</Text></View>

                    {item.status !== 'Delivered' && (
                        <View style={styles.btnRow}>
                            {item.status !== 'Shipped' && (
                                <TouchableOpacity style={[styles.smBtn, { backgroundColor: '#3b82f6' }]} onPress={() => handleUpdateOrder(item._id, 'Shipped')}>
                                    <Text style={styles.smBtnText}>Mark Shipped</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity style={[styles.smBtn, { backgroundColor: '#10b981' }]} onPress={() => handleUpdateOrder(item._id, 'Delivered')}>
                                <Text style={styles.smBtnText}>Mark Delivered</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}
        />
    );

    const pendingReviews = reviews.filter(r => !r.isApproved);
    const renderReviews = () => (
        <FlatList data={pendingReviews} keyExtractor={i => i._id} contentContainerStyle={styles.tabContent}
            ListEmptyComponent={<Text style={styles.emptyText}>No pending reviews to approve! 🎉</Text>}
            renderItem={({ item }) => (
                <View style={styles.glassCard}>
                    <Text style={styles.rowTitle}>{item.user?.name}</Text>
                    <Text style={{ color: '#FFD700', marginVertical: 4 }}>{'★'.repeat(item.rating || 0)}</Text>
                    <Text style={[styles.rowSub, { fontStyle: 'italic', marginBottom: 12 }]}>"{item.comment}"</Text>
                    <TouchableOpacity style={[styles.smBtn, { backgroundColor: '#03dac6' }]} onPress={() => handleApproveReview(item._id)}>
                        <Text style={[styles.smBtnText, { color: '#000' }]}>✅ Approve & Publish</Text>
                    </TouchableOpacity>
                </View>
            )}
        />
    );

    const renderPromos = () => (
        <View style={styles.tabContent}>
            <View style={styles.glassCard}>
                <Text style={styles.cardHeader}>🎟️ Launch a Promo Sale</Text>
                <TextInput style={styles.input} placeholder="Code (e.g. SUMMER20)" placeholderTextColor="rgba(255,255,255,0.3)" autoCapitalize="characters" value={promoCode} onChangeText={setPromoCode} />
                <TextInput style={styles.input} placeholder="Discount % (e.g. 20)" placeholderTextColor="rgba(255,255,255,0.3)" keyboardType="numeric" value={promoDiscount} onChangeText={setPromoDiscount} />
                <TouchableOpacity style={[styles.actionBtn, {marginTop: 10}]} onPress={handleCreatePromo} disabled={loading}>
                    <Text style={styles.actionBtnText}>{loading ? 'Creating...' : 'Launch Promo'}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderUsers = () => {
        const admins = users.filter(u => u.role === 'admin');
        const standardUsers = users.filter(u => u.role !== 'admin');

        return (
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                <View style={{ padding: 16 }}>
                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Platform Members ({users.length})</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 4 }}>Manage all registered users and master accounts.</Text>
                </View>

                {/* Admins Section */}
                <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
                    <Text style={{ color: '#ef4444', fontSize: 13, fontWeight: '900', marginBottom: 10, letterSpacing: 1 }}>🛡️ SYSTEM ADMINISTRATORS ({admins.length})</Text>
                </View>
                <View style={{ paddingHorizontal: 16 }}>
                    {admins.length === 0 ? <Text style={styles.emptyText}>No admins found.</Text> :
                        admins.map(item => (
                            <View key={item._id} style={[styles.glassCard, { borderColor: 'rgba(239,68,68,0.2)' }]}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={[styles.userAvatar, { borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)' }]}>
                                        <Text style={[styles.userAvatarText, { color: '#ef4444' }]}>{item.name ? item.name[0].toUpperCase() : 'A'}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.rowTitle}>{item.name}</Text>
                                        <Text style={styles.rowSub}>{item.email}</Text>
                                    </View>
                                    <View style={[styles.badgePill, { backgroundColor: '#ef4444' }]}>
                                        <Text style={styles.badgePillText}>MASTER</Text>
                                    </View>
                                </View>
                            </View>
                        ))
                    }
                </View>

                {/* Users Section */}
                <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
                    <Text style={{ color: '#03dac6', fontSize: 13, fontWeight: '900', marginBottom: 10, letterSpacing: 1 }}>👥 STANDARD USERS ({standardUsers.length})</Text>
                </View>
                <View style={{ paddingHorizontal: 16 }}>
                    {standardUsers.length === 0 ? <Text style={styles.emptyText}>No standard users found.</Text> :
                        standardUsers.map(item => (
                            <View key={item._id} style={styles.glassCard}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={styles.userAvatar}>
                                        <Text style={styles.userAvatarText}>{item.name ? item.name[0].toUpperCase() : 'U'}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.rowTitle}>{item.name}</Text>
                                        <Text style={styles.rowSub}>{item.email}</Text>
                                    </View>
                                    <View style={styles.badgePill}>
                                        <Text style={styles.badgePillText}>MEMBER</Text>
                                    </View>
                                </View>
                            </View>
                        ))
                    }
                </View>
            </ScrollView>
        );
    };

    const renderAdmins = () => (
        <ScrollView contentContainerStyle={styles.tabContent} showsVerticalScrollIndicator={false}>
            <View style={styles.glassCard}>
                <Text style={styles.cardHeader}>👨‍💼 Grant Master Access</Text>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 16 }}>
                    Create a new administrator account. Admins have full access to inventory, orders, and system settings.
                </Text>
                <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="rgba(255,255,255,0.3)" value={adminName} onChangeText={setAdminName} />
                <TextInput style={styles.input} placeholder="Email Address" placeholderTextColor="rgba(255,255,255,0.3)" keyboardType="email-address" autoCapitalize="none" value={adminEmail} onChangeText={setAdminEmail} />
                <TextInput style={styles.input} placeholder="Password" placeholderTextColor="rgba(255,255,255,0.3)" secureTextEntry value={adminPassword} onChangeText={setAdminPassword} />
                <TouchableOpacity style={[styles.actionBtn, {marginTop: 10, backgroundColor: '#0288d1'}]} onPress={handleRegisterAdmin} disabled={loading}>
                    <Text style={styles.actionBtnText}>{loading ? 'Creating...' : 'Create Admin Account'}</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0a0015" />
            
            <View style={styles.header}>
                <Text style={styles.headerTitle}>🛡️ Admin Center</Text>
            </View>

            {/* Main Navigation Nav Bar */}
            <View style={styles.navBarWrap}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.navBar}>
                    {TABS.map(tab => {
                        const isActive = activeTab === tab.id;
                        return (
                            <TouchableOpacity key={tab.id} style={[styles.navBtn, isActive && styles.navBtnActive]} onPress={() => setActiveTab(tab.id)}>
                                <Text style={isActive ? styles.navIconActive : styles.navIcon}>{tab.icon}</Text>
                                <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{tab.label}</Text>
                                {/* Notification dot for pending reviews */}
                                {tab.id === 'Reviews' && pendingReviews.length > 0 && <View style={styles.badge} />}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Content Area */}
            <View style={styles.mainCanvas}>
                {loading && activeTab !== 'Products' && activeTab !== 'Users' && activeTab !== 'Admins' ? <ActivityIndicator size="large" color="#03dac6" style={{marginTop: 50}} /> :
                    activeTab === 'Products' ? renderProducts() :
                    activeTab === 'Orders' ? renderOrders() :
                    activeTab === 'Reviews' ? renderReviews() :
                    activeTab === 'Promos' ? renderPromos() :
                    activeTab === 'Users' ? renderUsers() :
                    activeTab === 'Admins' ? renderAdmins() : null
                }
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#05000a' },

    header: { padding: 20, paddingTop: 10 },
    headerTitle: { fontSize: 24, fontWeight: '900', color: '#fff', letterSpacing: 1 },

    // Top Navigation Bar
    navBarWrap: { paddingHorizontal: 10, paddingBottom: 15 },
    navBar: { gap: 10, paddingHorizontal: 10 },
    navBtn: { 
        flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', 
        paddingHorizontal: 18, paddingVertical: 12, borderRadius: 20,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
    },
    navBtnActive: { backgroundColor: 'rgba(3,218,198,0.15)', borderColor: '#03dac6' },
    navIcon: { fontSize: 16, marginRight: 8, opacity: 0.5 },
    navIconActive: { fontSize: 16, marginRight: 8, opacity: 1 },
    navLabel: { color: 'rgba(255,255,255,0.5)', fontWeight: 'bold', fontSize: 14 },
    navLabelActive: { color: '#03dac6', fontWeight: '900' },
    badge: { position: 'absolute', top: 5, right: 5, width: 8, height: 8, borderRadius: 4, backgroundColor: '#ff4444' },

    mainCanvas: { flex: 1 },
    tabContent: { padding: 16, paddingBottom: 100 },

    // Sub Navigation (For Inventory)
    subTabBar: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 10, gap: 10 },
    subTab: { flex: 1, alignItems: 'center', paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
    subTabActive: { borderBottomColor: '#6200ee' },
    subTabText: { color: 'rgba(255,255,255,0.4)', fontWeight: 'bold' },
    subTabTextActive: { color: '#fff' },

    // Glass Cards
    glassCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 20, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
    glassCardList: { backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    cardHeader: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
    
    // Form
    input: { backgroundColor: 'rgba(0,0,0,0.3)', color: '#fff', padding: 15, borderRadius: 12, marginBottom: 12, fontSize: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    uploadArea: { height: 120, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.2)' },
    uploadText: { color: 'rgba(255,255,255,0.5)', fontWeight: 'bold' },
    previewImg: { width: '100%', height: '100%', borderRadius: 12 },
    
    actionBtn: { backgroundColor: '#6200ee', padding: 18, borderRadius: 12, alignItems: 'center' },
    actionBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

    // Rows
    rowItem: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', alignItems: 'center' },
    rowImg: { width: 50, height: 50, borderRadius: 10 },
    rowImgFallback: { width: 50, height: 50, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
    rowTitle: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
    rowSub: { color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 4 },
    rowMoney: { color: '#03dac6', fontWeight: 'bold', fontSize: 18 },

    statusChip: { backgroundColor: 'rgba(255,255,255,0.1)', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10, marginTop: 8 },
    statusChipText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

    btnRow: { flexDirection: 'row', gap: 10, marginTop: 15 },
    smBtn: { padding: 12, borderRadius: 10, alignItems: 'center', flex: 1 },
    smBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },

    // Users
    userAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(98,0,238,0.3)', justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 1, borderColor: '#6200ee' },
    userAvatarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
    badgePill: { backgroundColor: '#6200ee', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    badgePillText: { color: '#fff', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },

    emptyText: { color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: 30, fontSize: 14 }
});

export default AdminScreen;
