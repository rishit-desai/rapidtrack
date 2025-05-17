'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Save, X, AlertCircle, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Order } from '@/types/order'; // Adjust the import path as necessary
import { cusResponse } from '@/types/api';

// Animation variants
const listItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: 10, transition: { duration: 0.2 } }
};

const OrdersPage = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form states for creating/editing
    const [orderNumber, setOrderNumber] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [area, setArea] = useState('');
    const [items, setItems] = useState<{ name: string; quantity: number; price: number; }[]>([]);
    const [status, setStatus] = useState<'pending' | 'assigned' | 'picked' | 'delivered'>('pending');
    const [scheduledFor, setScheduledFor] = useState('');
    const [assignedTo, setAssignedTo] = useState<string | undefined>('');
    const [totalAmount, setTotalAmount] = useState(0);

    // Mock API functions (replace with your actual API calls)
    const mockFetchOrders = async (): Promise<{ sucess: boolean, orders?: Order[] }> => {
        // api call to fetch orders
        const res: Response = await fetch('/api/orders');
        const data: cusResponse = await res.json();
        if (data.status !== 200) {
            return { sucess: false, orders: undefined };
        }
        return { sucess: true, orders: data.data as Order[] };
    };

    const mockCreateOrder = async (newOrder: Omit<Order, '_id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean, order?: Order }> => {

        //api call to create order
        const res: Response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newOrder),
        });
        const data: cusResponse = await res.json();
        if (data.status !== 200) {
            return { success: false, order: undefined };
        }
        return { success: true, order: data.data as Order };
    };

    const mockUpdateOrder = async (id: string, updatedOrder: Omit<Order, '_id' | 'createdAt' | 'updatedAt'>): Promise<{ sucess: boolean, order?: Order }> => {
        //api call to update order
        const res: Response = await fetch(`/api/orders/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedOrder),
        });
        const data: cusResponse = await res.json();
        if (data.status !== 200) {
            return { sucess: false, order: undefined };
        }
        return { sucess: true, order: data.data as Order };
    };

    const mockDeleteOrder = async (id: string): Promise<boolean> => {
        //api call to delete order
        const res: Response = await fetch(`/api/orders/${id}`, {
            method: 'DELETE',
        });
        const data: cusResponse = await res.json();
        return data.data as boolean;
    };

    // Fetch orders on component mount
    useEffect(() => {
        const fetchData = async () => {
            const data = await mockFetchOrders();
            if (data.sucess)
                setOrders(data.orders || []);
            else
                setError('Failed to fetch data');
            
            setLoading(false);
        };
        fetchData();
    }, []);

    // Function to handle creating/saving an order
    const handleSaveOrder = useCallback(async () => {
        if (!orderNumber || !customerName || !customerPhone || !customerAddress || !area || !scheduledFor) {
            setError('Please fill in all required fields.');
            return; // Don't proceed if required fields are missing
        }
        setError(null);

        const newOrderData: Omit<Order, '_id' | 'createdAt' | 'updatedAt'> = {
            orderNumber,
            customer: { name: customerName, phone: customerPhone, address: customerAddress },
            area,
            items,
            status,
            scheduledFor,
            assignedTo,
            totalAmount,
        };

        if (editingId) {
            // Update existing order
            const updatedOrder = await mockUpdateOrder(editingId, newOrderData);
            if (updatedOrder.sucess) {
                setOrders(orders.map(o => o._id === editingId ? { ...o, ...updatedOrder } : o));
                setEditingId(null);
                setIsCreating(false);
                resetForm();
            }
            else {
                setError('Failed to update order');
            }
        } else {
            // Create new order
            const newOrder = await mockCreateOrder(newOrderData);
            if (newOrder.success) {
                setOrders([...orders, newOrder.order!]);
                setIsCreating(false);
                resetForm();
            }
            else {
                setError('Failed to create order');
            }
        }
    }, [orderNumber, customerName, customerPhone, customerAddress, area, items, status, scheduledFor, assignedTo, totalAmount, editingId, orders]);

    // Function to handle deleting an order
    const handleDeleteOrder = async (id: string) => {
        const isDeleted: boolean = await mockDeleteOrder(id);
        if (!isDeleted) {
            setError('Failed to delete order');
            return;
        }
        setOrders(orders.filter(o => o._id !== id));
        if (editingId === id) {
            setEditingId(null);
        }
    };

    // Function to handle editing an order
    const handleEditOrder = (order: Order) => {
        setEditingId(order._id);
        setIsCreating(false);
        setOrderNumber(order.orderNumber);
        setCustomerName(order.customer.name);
        setCustomerPhone(order.customer.phone);
        setCustomerAddress(order.customer.address);
        setArea(order.area);
        setItems(order.items);
        setStatus(order.status);
        setScheduledFor(order.scheduledFor);
        setAssignedTo(order.assignedTo);
        setTotalAmount(order.totalAmount);
    };

    // Function to reset the form
    const resetForm = () => {
        setOrderNumber('');
        setCustomerName('');
        setCustomerPhone('');
        setCustomerAddress('');
        setArea('');
        setItems([]);
        setStatus('pending');
        setScheduledFor('');
        setAssignedTo(undefined);
        setTotalAmount(0);
        setEditingId(null);
    };

    // Function to add item
    const handleAddItem = () => {
        if (items.length < 5) {
            setItems([...items, { name: '', quantity: 1, price: 0 }]); // added default quantity of 1
        }
    };

    // Function to update item
    const handleUpdateItem = (index: number, field: 'name' | 'quantity' | 'price', value: string) => {
        const updatedItems = [...items];
        const parsedValue = field === 'quantity' || field === 'price' ? Number(value) : value;

        if (!isNaN(parsedValue as number)) { // Check if it is a number
            updatedItems[index] = {
                ...updatedItems[index],
                [field]: parsedValue,
            };
            setItems(updatedItems);

            // Recalculate totalAmount whenever item changes
            if (field === 'quantity' || field === 'price') {
                const newTotal = updatedItems.reduce((acc, item) => acc + (item.quantity * item.price), 0);
                setTotalAmount(newTotal);
            }
        }
    };

    // Function to remove item
    const handleRemoveItem = (index: number) => {
        const updatedItems = items.filter((_, i) => i !== index);
        setItems(updatedItems);
        // Recalculate totalAmount after removing item
        const newTotal = updatedItems.reduce((acc, item) => acc + (item.quantity * item.price), 0);
        setTotalAmount(newTotal);
    };

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-gray-800">Orders</h1>

            {/* Toolbar */}
            <div className="flex justify-between items-center mb-4 md:mb-6">
                <button
                    onClick={() => {
                        setIsCreating(true);
                        setEditingId(null);
                        resetForm();
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded flex items-center"
                >
                    <Plus className="mr-2" />
                    Add Order
                </button>
            </div>

            {/* Loading and Error states */}
            {loading && (
                <div className="text-gray-600">Loading orders...</div>
            )}
            {error && (
                <div className="text-red-500 flex items-center">
                    <AlertCircle className="mr-2" />
                    {error}
                </div>
            )}

            {/* Create/Edit Form */}
            <AnimatePresence>
                {(isCreating || editingId) && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white p-4 md:p-6 rounded-lg shadow-md mb-6"
                    >
                        <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-800">
                            {editingId ? 'Edit Order' : 'Add New Order'}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            {/* Order Number */}
                            <div>
                                <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700">Order Number <span className="text-red-500">*</span></label>
                                <input
                                    id="orderNumber"
                                    value={orderNumber}
                                    onChange={(e) => setOrderNumber(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:border-blue-500 sm:text-sm"
                                    placeholder="Enter order number"
                                    required
                                />
                            </div>

                            {/* Customer Name */}
                            <div>
                                <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">Customer Name <span className="text-red-500">*</span></label>
                                <input
                                    id="customerName"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:border-blue-500 sm:text-sm"
                                    placeholder="Enter customer name"
                                    required
                                />
                            </div>

                            {/* Customer Phone */}
                            <div>
                                <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700">Customer Phone <span className="text-red-500">*</span></label>
                                <input
                                    id="customerPhone"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:border-blue-500 sm:text-sm"
                                    placeholder="Enter customer phone"
                                    required
                                />
                            </div>

                            {/* Customer Address */}
                            <div>
                                <label htmlFor="customerAddress" className="block text-sm font-medium text-gray-700">Customer Address <span className="text-red-500">*</span></label>
                                <input
                                    id="customerAddress"
                                    value={customerAddress}
                                    onChange={(e) => setCustomerAddress(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:border-blue-500 sm:text-sm"
                                    placeholder="Enter customer address"
                                    required
                                />
                            </div>

                            {/* Area */}
                            <div>
                                <label htmlFor="area" className="block text-sm font-medium text-gray-700">Area <span className="text-red-500">*</span></label>
                                <input
                                    id="area"
                                    value={area}
                                    onChange={(e) => setArea(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:border-blue-500 sm:text-sm"
                                    placeholder="Enter area"
                                    required
                                />
                            </div>

                            {/* Items */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Items <span className="text-red-500">*</span></label>
                                {items.map((item, index) => (
                                    <div key={index} className="mt-1 flex items-center gap-2">
                                        <input
                                            value={item.name}
                                            onChange={(e) => handleUpdateItem(index, 'name', e.target.value)}
                                            placeholder={`Item ${index + 1} Name`}
                                            className="flex-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:border-blue-500 sm:text-sm"
                                            required
                                        />
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => handleUpdateItem(index, 'quantity', e.target.value)}
                                            placeholder="Qty"
                                            className="flex-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:border-blue-500 sm:text-sm"
                                            min="1"
                                            required
                                        />
                                        <input
                                            type="number"
                                            value={item.price}
                                            onChange={(e) => handleUpdateItem(index, 'price', e.target.value)}
                                            placeholder="Price"
                                            className="flex-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:border-blue-500 sm:text-sm"
                                            min="0"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveItem(index)}
                                            className="bg-red-500/20 text-red-500 hover:bg-red-500/30 hover:text-red-400 rounded-md p-1"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                                {items.length < 5 && (
                                    <button
                                        type="button"
                                        onClick={handleAddItem}
                                        className="mt-2 bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 hover:text-blue-400 rounded-md py-2 px-3"
                                    >
                                        <Plus className="mr-1 h-4 w-4" /> Add Item
                                    </button>
                                )}
                            </div>

                            {/* Status */}
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status <span className="text-red-500">*</span></label>
                                <select
                                    id="status"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as 'pending' | 'assigned' | 'picked' | 'delivered')}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:border-blue-500 sm:text-sm"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="assigned">Assigned</option>
                                    <option value="picked">Picked</option>
                                    <option value="delivered">Delivered</option>
                                </select>
                            </div>

                            {/* Scheduled For */}
                            <div>
                                <label htmlFor="scheduledFor" className="block text-sm font-medium text-gray-700">Scheduled For <span className="text-red-500">*</span> (HH:MM)</label>
                                <input
                                    id="scheduledFor"
                                    value={scheduledFor}
                                    onChange={(e) => setScheduledFor(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:border-blue-500 sm:text-sm"
                                    placeholder="HH:MM"
                                    required
                                />
                            </div>

                            {/* Assigned To */}
                            <div>
                                <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">Assigned To (Partner ID)</label>
                                <input
                                    id="assignedTo"
                                    value={assignedTo || ''}
                                    onChange={(e) => setAssignedTo(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:border-blue-500 sm:text-sm"
                                    placeholder="Enter partner ID"
                                />
                            </div>

                            {/* Total Amount (Read-only, calculated from items) */}
                            <div>
                                <label htmlFor="totalAmount" className="block text-sm font-medium text-gray-700">Total Amount</label>
                                <input
                                    id="totalAmount"
                                    type="number"
                                    value={totalAmount}
                                    readOnly
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100 text-gray-500 sm:text-sm"
                                    placeholder="Total amount"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsCreating(false);
                                    setEditingId(null);
                                    resetForm();
                                }}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-4 py-2 rounded"
                            >
                                <X className="mr-2" />
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveOrder}
                                className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded flex items-center"
                            >
                                <Save className="mr-2" />
                                {editingId ? 'Update' : 'Save'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Data List */}
            {!loading && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Area</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>

                            <AnimatePresence>
                                {orders.map((order) => (
                                    <motion.tr
                                        key={order._id}
                                        variants={listItemVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.orderNumber}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div>{order.customer.name}</div>
                                            <div>{order.customer.phone}</div>
                                            <div>{order.customer.address}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.area}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {order.items.map((item) => (
                                                <div key={item.name}>
                                                    {item.name} ({item.quantity} x ${item.price})
                                                </div>
                                            ))}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <span
                                                className={(
                                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded' :
                                                        order.status === 'assigned' ? 'bg-blue-100 text-blue-800 px-2 py-1 rounded' :
                                                            order.status === 'picked' ? 'bg-purple-100 text-purple-800 px-2 py-1 rounded' :
                                                                'bg-green-100 text-green-800 px-2 py-1 rounded'
                                                )}
                                            >
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.scheduledFor}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.assignedTo || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${order.totalAmount.toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            {order.status === 'pending' && (
                                                <button
                                                    onClick={() => handleEditOrder(order)}
                                                    className="bg-green-500/20 text-green-500 hover:bg-green-500/30 hover:text-green-400 rounded-md px-2 py-1"
                                                >
                                                    <p className="w-full h-full">Assign</p>
                                                </button>
                                            )}

                                            <button
                                                onClick={() => handleEditOrder(order)}
                                                className="bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 hover:text-blue-400 rounded-md px-2 py-1"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteOrder(order._id)}
                                                className="bg-red-500/20 text-red-500 hover:bg-red-500/30 hover:text-red-400 rounded-md px-2 py-1"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </table>
                    </div>
                    {orders.length === 0 && (
                        <div className="p-4 text-center text-gray-500">
                            <ShoppingCart className="h-6 w-6 mx-auto mb-2" />
                            No orders found.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default OrdersPage;
