import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { collection, query, getDocs, addDoc, updateDoc, doc, where } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import OrderForm from './OrderForm';
import OrderList from './OrderList';
import SearchOrders from './SearchOrders';
import { Order, Product, Coupon } from '../types';

const Dashboard: React.FC = () => {
  const { currentUser, isOnline } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [offlineOrders, setOfflineOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (isOnline) {
      fetchOrders();
      fetchProducts();
    }
  }, [isOnline]);

  useEffect(() => {
    if (isOnline && offlineOrders.length > 0) {
      syncOfflineOrders();
    }
  }, [isOnline]);

  const fetchOrders = async () => {
    if (isOnline) {
      try {
        const ordersCollection = collection(db, 'orders');
        const ordersSnapshot = await getDocs(query(ordersCollection));
        const ordersList = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        setOrders(ordersList);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    } else {
      // Load orders from local storage when offline
      const localOrders = localStorage.getItem('offlineOrders');
      if (localOrders) {
        setOfflineOrders(JSON.parse(localOrders));
      }
    }
  };

  const fetchProducts = async () => {
    if (isOnline) {
      try {
        const productsCollection = collection(db, 'products');
        const productsSnapshot = await getDocs(query(productsCollection));
        const productsList = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(productsList);
        localStorage.setItem('products', JSON.stringify(productsList));
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    } else {
      // Load products from local storage when offline
      const localProducts = localStorage.getItem('products');
      if (localProducts) {
        setProducts(JSON.parse(localProducts));
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const handleOrderSubmit = async (order: Omit<Order, 'id' | 'date'>) => {
    const newOrder = {
      ...order,
      date: new Date().toISOString(),
      agentId: currentUser?.uid || '',
    };

    if (isOnline) {
      try {
        const docRef = await addDoc(collection(db, 'orders'), newOrder);
        setOrders([...orders, { ...newOrder, id: docRef.id }]);

        // Update coupon if used
        if (newOrder.couponCode) {
          const couponsRef = collection(db, 'coupons');
          const q = query(couponsRef, where('code', '==', newOrder.couponCode));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const couponDoc = querySnapshot.docs[0];
            await updateDoc(doc(db, 'coupons', couponDoc.id), {
              isUsed: true,
              usedBy: currentUser?.uid,
              usedAt: new Date().toISOString(),
            });
          }
        }
      } catch (error) {
        console.error('Error adding document: ', error);
        // Store order locally if online submission fails
        storeOrderLocally(newOrder);
      }
    } else {
      storeOrderLocally(newOrder);
    }
  };

  const storeOrderLocally = (order: Omit<Order, 'id'>) => {
    const updatedOfflineOrders = [...offlineOrders, { ...order, id: `offline-${Date.now()}` }];
    setOfflineOrders(updatedOfflineOrders);
    localStorage.setItem('offlineOrders', JSON.stringify(updatedOfflineOrders));
  };

  const syncOfflineOrders = async () => {
    for (const order of offlineOrders) {
      try {
        await addDoc(collection(db, 'orders'), order);
      } catch (error) {
        console.error('Error syncing offline order: ', error);
      }
    }
    setOfflineOrders([]);
    localStorage.removeItem('offlineOrders');
    fetchOrders();
  };

  const handleSearch = (query: string) => {
    // Implement search functionality
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header onLogout={handleLogout} />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">New Order</h2>
            <OrderForm products={products} onSubmit={handleOrderSubmit} />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Recent Orders</h2>
            <SearchOrders onSearch={handleSearch} />
            <OrderList orders={isOnline ? orders : offlineOrders} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;