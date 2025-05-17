'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Save, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cusResponse } from '@/types/api';
import { DeliveryPartner } from '@/types/partner';

// Animation variants
const listItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: 10, transition: { duration: 0.2 } }
};


const DeliveryPartnersPage = () => {
    const [partners, setPartners] = useState<DeliveryPartner[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form states for creating/editing
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [status, setStatus] = useState<'active' | 'inactive'>('active');
    const [currentLoad, setCurrentLoad] = useState<number>(0);
    const [areas, setAreas] = useState<string[]>([]);
    const [shiftStart, setShiftStart] = useState('');
    const [shiftEnd, setShiftEnd] = useState('');
    const [rating, setRating] = useState<number>(0);
    const [completedOrders, setCompletedOrders] = useState<number>(0);
    const [cancelledOrders, setCancelledOrders] = useState<number>(0);
    const [metrics, setMetrics] = useState({
        totalActive: 0,
        avgRating: 0,
        topAreas: [] as string[],
    });

    // Mock API functions (replace with your actual API calls)
    const mockFetchPartners = async (): Promise<{ success: boolean, partners?: DeliveryPartner[] }> => {

        // get request to api
        const res: Response = await fetch('/api/partners');
        const data: cusResponse = await res.json();
        if (res.status !== 200) {
            return { success: false, partners: undefined };
        }
        // calculate metrics
        const activePartners: number = (data.data as DeliveryPartner[]).filter((partner: DeliveryPartner) => partner.status === 'active').length;
        const avgRating: number = (data.data as DeliveryPartner[]).reduce((acc: number, partner: DeliveryPartner) => acc + partner.metrics.rating, 0) / (data.data as DeliveryPartner[]).length;
        const topAreas: string[] = (data.data as DeliveryPartner[]).reduce((acc: string[], partner: DeliveryPartner) => {
            partner.areas.forEach((area: string) => {
                if (!acc.includes(area)) {
                    acc.push(area);
                }
            });
            return acc;
        }, []);
        setMetrics({ totalActive: activePartners, avgRating, topAreas });
        return { success: true, partners: data.data as DeliveryPartner[] };

    };

    const mockCreatePartner = async (newPartner: Omit<DeliveryPartner, '_id'>): Promise<{ success: boolean, partner?: DeliveryPartner }> => {

        // post request to api
        const res: Response = await fetch('/api/partners', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newPartner),
        });

        const data: cusResponse = await res.json();
        if (res.status !== 201) {
            return { success: false, partner: undefined };
        }
        return { success: true, partner: data.data as DeliveryPartner };
    };

    const mockUpdatePartner = async (id: string, updatedPartner: Omit<DeliveryPartner, '_id'>): Promise<{ success: boolean, partner?: DeliveryPartner }> => {

        // put request to api
        const res: Response = await fetch(`/api/partners/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedPartner),
        });
        const data: cusResponse = await res.json();
        if (res.status !== 200) {
            return { success: false, partner: undefined };
        }
        return { success: true, partner: data.data as DeliveryPartner };
    };

    const mockDeletePartner = async (id: string): Promise<{ success: boolean }> => {

        // delete request to api
        const res: Response = await fetch(`/api/partners/${id}`, {
            method: 'DELETE',
        });
        const data: cusResponse = await res.json();
        if (data.status !== 200) {
            return { success: false };
        }
        return { success: true };

    };

    // Fetch partners on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await mockFetchPartners();
                setPartners(data.partners || []);
            } catch (err: unknown) {
                setError('Failed to fetch data' + err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Function to handle creating/saving a partner
    const handleSavePartner = useCallback(async () => {
        if (!name || !email || !phone || !shiftStart || !shiftEnd) {
            setError('Please fill in all required fields.');
            return; // Don't proceed if required fields are missing
        }
        setError(null); // Clear any previous error

        const newPartnerData: Omit<DeliveryPartner, '_id'> = {
            name,
            email,
            phone,
            status,
            currentLoad,
            areas,
            shift: { start: shiftStart, end: shiftEnd },
            metrics: { rating, completedOrders, cancelledOrders },
        };

        if (editingId) {
            // Update existing partner
            const updatedPartner = await mockUpdatePartner(editingId, newPartnerData);
            setPartners(partners.map(p => p._id === editingId && updatedPartner.success ? { ...p, ...updatedPartner.partner } : p));
            setEditingId(null); // Exit editing mode
            setIsCreating(false);
            resetForm();
        }
        else {
            // Create new partner
            const newPartner = await mockCreatePartner(newPartnerData);
            if (newPartner.success) {
                setPartners([...partners, newPartner.partner!]); // Add new partner to the list
                setIsCreating(false); // Exit creating mode
                resetForm();
            }
            else {
                setError('Failed to create partner');
            }
        }
    }, [name, email, phone, status, currentLoad, areas, shiftStart, shiftEnd, rating, completedOrders, cancelledOrders, editingId, partners]);

    // Function to handle deleting a partner
    const handleDeletePartner = async (id: string | null) => {
        if (!id) {
            setError('Cannot delete partner with no ID');
            return;
        }
        const res = await mockDeletePartner(id);
        if (res.success) {
            setPartners(partners.filter(p => p._id !== id));
            if (editingId === id) {
                setEditingId(null); // Exit edit mode if deleting the currently edited item
                resetForm();
            }
            return;
        }
        else {
            setError('Failed to delete partner');
        }
    };

    // Function to handle editing a partner
    const handleEditPartner = (partner: DeliveryPartner) => {
        setEditingId(partner._id);
        setIsCreating(false); // Ensure we are not in "creating new" mode
        setName(partner.name);
        setEmail(partner.email);
        setPhone(partner.phone);
        setStatus(partner.status);
        setCurrentLoad(partner.currentLoad);
        setAreas(partner.areas);
        setShiftStart(partner.shift.start);
        setShiftEnd(partner.shift.end);
        setRating(partner.metrics.rating);
        setCompletedOrders(partner.metrics.completedOrders);
        setCancelledOrders(partner.metrics.cancelledOrders);
    };

    // Function to reset the form
    const resetForm = () => {
        setName('');
        setEmail('');
        setPhone('');
        setStatus('active');
        setCurrentLoad(0);
        setAreas([]);
        setShiftStart('');
        setShiftEnd('');
        setRating(0);
        setCompletedOrders(0);
        setCancelledOrders(0);
        setEditingId(null);
    };

    // Function to add area
    const handleAddArea = () => {
        if (areas.length < 5 && areas.every(area => area.trim() !== '')) { // Limit to 5 areas
            setAreas([...areas, '']); // Add an empty string to the areas array
        }
    };

    // Function to update area
    const handleUpdateArea = (index: number, value: string) => {
        const updatedAreas = [...areas];
        updatedAreas[index] = value;
        setAreas(updatedAreas);
    };

    // Function to remove area
    const handleRemoveArea = (index: number) => {
        const updatedAreas = areas.filter((_, i) => i !== index);
        setAreas(updatedAreas);
    };

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-gray-800">Delivery Partners</h1>


            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold text-gray-800">Total Active Partners</h2>
                    <p className="text-2xl font-bold text-blue-600">{metrics.totalActive}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold text-gray-800">Average Rating</h2>
                    <p className="text-2xl font-bold text-blue-600">{metrics.avgRating.toFixed(1)}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold text-gray-800">Top Areas</h2>
                    <ul className="list-disc pl-5">
                        {metrics.topAreas.map((area, index) => (
                            <li key={index} className="text-gray-700">{area}</li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Divider */}
            <div className="border-b border-gray-300 mb-6"></div>


            {/* Toolbar */}
            <div className="flex justify-between items-center mb-4 md:mb-6">
                <button
                    onClick={() => {
                        setIsCreating(true);
                        setEditingId(null); // Ensure we are not in edit mode
                        resetForm();
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded flex items-center"
                >
                    <Plus className="mr-2" />
                    Add Partner
                </button>
            </div>

            {/* Loading and Error states */}
            {loading && (
                <div className="text-gray-600">Loading delivery partners...</div>
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
                            {editingId ? 'Edit Partner' : 'Add New Partner'}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            {/* Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name <span className="text-red-500">*</span></label>
                                <input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:border-blue-500 sm:text-sm"
                                    placeholder="Enter name"
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:border-blue-500 sm:text-sm"
                                    placeholder="Enter email"
                                    required
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone <span className="text-red-500">*</span></label>
                                <input
                                    id="phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:border-blue-500 sm:text-sm"
                                    placeholder="Enter phone"
                                    required
                                />
                            </div>

                            {/* Status */}
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status <span className="text-red-500">*</span></label>
                                <select
                                    id="status"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:border-blue-500 sm:text-sm"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            {/* Current Load */}
                            <div>
                                <label htmlFor="currentLoad" className="block text-sm font-medium text-gray-700">Current Load</label>
                                <input
                                    id="currentLoad"
                                    type="number"
                                    value={currentLoad}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value, 10);
                                        if (!isNaN(value) && value >= 0 && value <= 3) {
                                            setCurrentLoad(value);
                                        }
                                    }}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:border-blue-500 sm:text-sm"
                                    placeholder="Enter current load (0-3)"
                                />
                            </div>

                            {/* Areas */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Areas</label>
                                {areas.map((area, index) => (
                                    <div key={index} className="mt-1 flex items-center gap-2">
                                        <input
                                            value={area}
                                            onChange={(e) => handleUpdateArea(index, e.target.value)}
                                            placeholder={`Area ${index + 1}`}
                                            className="flex-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:border-blue-500 sm:text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveArea(index)}
                                            className="bg-red-500/20 text-red-500 hover:bg-red-500/30 hover:text-red-400 rounded-md p-1"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                                {areas.length < 5 && (
                                    <button
                                        type="button"
                                        onClick={handleAddArea}
                                        className="mt-2 bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 hover:text-blue-400 rounded-md py-2 px-3"
                                    >
                                        <Plus className="mr-1 h-4 w-4" /> Add Area
                                    </button>
                                )}
                            </div>

                            {/* Shift Start */}
                            <div>
                                <label htmlFor="shiftStart" className="block text-sm font-medium text-gray-700">Shift Start <span className="text-red-500">*</span> (HH:MM)</label>
                                <input
                                    id="shiftStart"
                                    value={shiftStart}
                                    onChange={(e) => setShiftStart(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:border-blue-500 sm:text-sm"
                                    placeholder="HH:MM"
                                    required
                                />
                            </div>

                            {/* Shift End */}
                            <div>
                                <label htmlFor="shiftEnd" className="block text-sm font-medium text-gray-700">Shift End <span className="text-red-500">*</span> (HH:MM)</label>
                                <input
                                    id="shiftEnd"
                                    value={shiftEnd}
                                    onChange={(e) => setShiftEnd(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:border-blue-500 sm:text-sm"
                                    placeholder="HH:MM"
                                    required
                                />
                            </div>

                            {/* Rating */}
                            <div>
                                <label htmlFor="rating" className="block text-sm font-medium text-gray-700">Rating</label>
                                <input
                                    id="rating"
                                    type="number"
                                    value={rating}
                                    onChange={(e) => {
                                        const value = parseFloat(e.target.value);
                                        if (!isNaN(value) && value >= 0 && value <= 5) {
                                            setRating(value);
                                        }
                                    }}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:border-blue-500 sm:text-sm"
                                    placeholder="Enter rating (0-5)"
                                />
                            </div>

                            {/* Completed Orders */}
                            <div>
                                <label htmlFor="completedOrders" className="block text-sm font-medium text-gray-700">Completed Orders</label>
                                <input
                                    id="completedOrders"
                                    type="number"
                                    value={completedOrders}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value, 10);
                                        if (!isNaN(value) && value >= 0) {
                                            setCompletedOrders(value);
                                        }
                                    }}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:border-blue-500 sm:text-sm"
                                    placeholder="Enter completed orders"
                                />
                            </div>

                            {/* Cancelled Orders */}
                            <div>
                                <label htmlFor="cancelledOrders" className="block text-sm font-medium text-gray-700">Cancelled Orders</label>
                                <input
                                    id="cancelledOrders"
                                    type="number"
                                    value={cancelledOrders}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value, 10);
                                        if (!isNaN(value) && value >= 0) {
                                            setCancelledOrders(value);
                                        }
                                    }}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:border-blue-500 sm:text-sm"
                                    placeholder="Enter cancelled orders"
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
                                onClick={handleSavePartner}
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
                            <thead className="bg-gray-100">
                                <tr className="bg-gray-50">
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Load</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Areas</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shift</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cancelled</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {partners.map((partner) => (
                                        <motion.tr
                                            key={partner._id}
                                            variants={listItemVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{partner.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{partner.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{partner.phone}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <span
                                                    className={(
                                                        'px-2 py-1 rounded' +
                                                            partner.status === 'active'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                    )}
                                                >
                                                    {partner.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{partner.currentLoad}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {partner.areas.join(', ')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {partner.shift.start} - {partner.shift.end}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{partner.metrics.rating}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{partner.metrics.completedOrders}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{partner.metrics.cancelledOrders}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                <button
                                                    onClick={() => handleEditPartner(partner)}
                                                    className="bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 hover:text-blue-400 rounded-md p-1"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeletePartner(partner._id)}
                                                    className="bg-red-500/20 text-red-500 hover:bg-red-500/30 hover:text-red-400 rounded-md p-1"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                    {partners.length === 0 && (
                        <div className="px-6 py-4 text-center text-gray-500">
                            No delivery partners found.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default DeliveryPartnersPage;
