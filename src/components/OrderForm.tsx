import React, { useState } from 'react';
import { Product, Order, Coupon } from '../types';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

interface OrderFormProps {
  products: Product[];
  onSubmit: (order: Omit<Order, 'id' | 'date'>) => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ products, onSubmit }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerMobile1, setCustomerMobile1] = useState('');
  const [customerMobile2, setCustomerMobile2] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<{ productId: string; quantity: number }[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  const handleAddProduct = () => {
    setSelectedProducts([...selectedProducts, { productId: '', quantity: 1 }]);
  };

  const handleProductChange = (index: number, productId: string) => {
    const updatedProducts = [...selectedProducts];
    updatedProducts[index].productId = productId;
    setSelectedProducts(updatedProducts);
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const updatedProducts = [...selectedProducts];
    updatedProducts[index].quantity = quantity;
    setSelectedProducts(updatedProducts);
  };

  const handleRemoveProduct = (index: number) => {
    const updatedProducts = selectedProducts.filter((_, i) => i !== index);
    setSelectedProducts(updatedProducts);
  };

  const validateCoupon = async () => {
    setCouponError('');
    setAppliedCoupon(null);

    if (!couponCode) {
      setCouponError('Please enter a coupon code');
      return;
    }

    try {
      const couponsRef = collection(db, 'coupons');
      const q = query(couponsRef, where('code', '==', couponCode), where('isUsed', '==', false));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setCouponError('Invalid or already used coupon');
        return;
      }

      const couponDoc = querySnapshot.docs[0];
      const coupon = { id: couponDoc.id, ...couponDoc.data() } as Coupon;
      setAppliedCoupon(coupon);
    } catch (error) {
      console.error('Error validating coupon:', error);
      setCouponError('Error validating coupon. Please try again.');
    }
  };

  const calculateTotalAmount = () => {
    const subtotal = selectedProducts.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      return total + (product?.price || 0) * item.quantity;
    }, 0);

    if (appliedCoupon) {
      const discountAmount = subtotal * (appliedCoupon.discountPercentage / 100);
      return subtotal - discountAmount;
    }

    return subtotal;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalAmount = calculateTotalAmount();

    onSubmit({
      customerName,
      customerAddress,
      customerMobile1,
      customerMobile2,
      products: selectedProducts,
      totalAmount,
      agentId: 'current-agent-id', // This should be dynamically set based on the logged-in agent
      couponCode: appliedCoupon?.code,
      discountAmount: appliedCoupon ? totalAmount * (appliedCoupon.discountPercentage / 100) : 0,
    });

    // Reset form
    setCustomerName('');
    setCustomerAddress('');
    setCustomerMobile1('');
    setCustomerMobile2('');
    setSelectedProducts([]);
    setCouponCode('');
    setAppliedCoupon(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">Customer Name</label>
        <input
          type="text"
          id="customerName"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        />
      </div>

      <div>
        <label htmlFor="customerAddress" className="block text-sm font-medium text-gray-700">Customer Address</label>
        <textarea
          id="customerAddress"
          value={customerAddress}
          onChange={(e) => setCustomerAddress(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="customerMobile1" className="block text-sm font-medium text-gray-700">Mobile Number 1</label>
          <input
            type="tel"
            id="customerMobile1"
            value={customerMobile1}
            onChange={(e) => setCustomerMobile1(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label htmlFor="customerMobile2" className="block text-sm font-medium text-gray-700">Mobile Number 2</label>
          <input
            type="tel"
            id="customerMobile2"
            value={customerMobile2}
            onChange={(e) => setCustomerMobile2(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Products</label>
        {selectedProducts.map((item, index) => (
          <div key={index} className="flex items-center space-x-2 mt-2">
            <select
              value={item.productId}
              onChange={(e) => handleProductChange(index, e.target.value)}
              required
              className="flex-grow rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            >
              <option value="">Select a product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>{product.name} - ${product.price}</option>
              ))}
            </select>
            <input
              type="number"
              value={item.quantity}
              onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
              min="1"
              required
              className="w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <button
              type="button"
              onClick={() => handleRemoveProduct(index)}
              className="text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddProduct}
          className="mt-2 bg-green-500 text-white py-1 px-3 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
        >
          Add Product
        </button>
      </div>

      <div>
        <label htmlFor="couponCode" className="block text-sm font-medium text-gray-700">Coupon Code</label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            type="text"
            id="couponCode"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300"
            placeholder="Enter coupon code"
          />
          <button
            type="button"
            onClick={validateCoupon}
            className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm"
          >
            Apply
          </button>
        </div>
        {couponError && <p className="mt-2 text-sm text-red-600">{couponError}</p>}
        {appliedCoupon && (
          <p className="mt-2 text-sm text-green-600">
            Coupon applied: {appliedCoupon.discountPercentage}% discount
          </p>
        )}
      </div>

      <div>
        <p className="text-lg font-semibold">Total Amount: ${calculateTotalAmount().toFixed(2)}</p>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        Submit Order
      </button>
    </form>
  );
};

export default OrderForm;