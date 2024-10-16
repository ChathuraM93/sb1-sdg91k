import React from 'react';
import { Order } from '../types';

interface OrderListProps {
  orders: Order[];
}

const OrderList: React.FC<OrderListProps> = ({ orders }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 text-left">Order ID</th>
            <th className="py-2 px-4 text-left">Customer Name</th>
            <th className="py-2 px-4 text-left">Mobile</th>
            <th className="py-2 px-4 text-left">Total Amount</th>
            <th className="py-2 px-4 text-left">Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b">
              <td className="py-2 px-4">{order.id}</td>
              <td className="py-2 px-4">{order.customerName}</td>
              <td className="py-2 px-4">{order.customerMobile1}</td>
              <td className="py-2 px-4">${order.totalAmount.toFixed(2)}</td>
              <td className="py-2 px-4">{new Date(order.date).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderList;