export type Order = {
    _id: string;
    orderNumber: string;
    customer: {
        name: string;
        phone: string;
        address: string;
    };
    area: string;
    items: {
        name: string;
        quantity: number;
        price: number;
    } [];
    status: 'pending' | 'assigned' | 'picked' | 'delivered';
    scheduledFor: string;  // HH:mm 
    assignedTo ?: string;   // partner ID 
    totalAmount: number;
    createdAt: Date;
    updatedAt: Date;
}