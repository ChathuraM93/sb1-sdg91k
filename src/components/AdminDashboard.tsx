import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Order, Coupon } from '../types';
import { utils, writeFile } from 'xlsx';
import Header from './Header';

const AdminDashboard: React.FC = () => {
  const { currentUser, isOnline } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [usedCoupons, setUsedCoupons] = useState<Coupon[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (isOnline) {
      fetchOrders();
      fetchUsedCoupons();
    }
  }, [isOnline]);

  const fetchOrders = async () => {
    const ordersCollection = collection(db, 'orders');
    const ordersSnapshot = await getDocs(query(ordersCollection));
    const ordersList = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
    setOrders(ordersList);
  };

  const fetchUsedCoupons = async () => {
    const couponsCollection = collection(db, 'coupons');
    const usedCouponsQuery = query(couponsCollection, where('isUsed', '==', true));
    const usedCouponsSnapshot = await getDocs(usedCouponsQuery);
    const usedCouponsList = usedCouponsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Coupon));
    setUsedCoupons(usedCouponsList);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const downloadExcel = (data: any[], filename: string) => {
    const worksheet = utils.json_to_sheet(data);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'Data');
    writeFile(workbook, filename);
  };

  const handleDownloadFilteredOrders = () => {
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.date);
      return (!startDate || orderDate >= new Date(startDate)) &&
             (!endDate || orderDate <= new Date(endDate));
    });
    downloadExcel(filteredOrders, 'filtered_orders.xlsx');
  };

  const handleDownloadAllOrders = () => {
    downloadExcel(orders, 'all_orders.xlsx');
  };

  const handleDownloadUsedCoupons = () => {
    downloadExcel(usedCoupons, 'used_coupons.xlsx');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header onLogout={handleLogout} />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 className="text-xl font-bold mb-4">Download Orders</h2>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startDate">
              Start Date
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="endDate">
              End Date
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
              onClick={handleDownloadFilteredOrders}
              disabled={!isOnline}
            >
              Download Filtered Orders
            </button>
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
              onClick={handleDownloadAllOrders}
              disabled={!isOnline}
            >
              Download All Orders
            </button>
          </div>
        </div>

        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 className="text-xl font-bold mb-4">Used Coupons</h2>
          <button
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="button"
            onClick={handleDownloadUsedCoupons}
            disabled={!isOnline}
          >
            Download Used Coupons
          </button>
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Recently Used Coupons</h3>
            <ul className="list-disc pl-5">
              {usedCoupons.slice(0, 5).map((coupon) => (
                <li key={coupon.id}>
                  {coupon.code} - Used on {new Date(coupon.usedAt || '').toLocaleDateString()}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;