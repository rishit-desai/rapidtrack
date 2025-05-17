export type DeliveryPartner = {
    _id: string | null;
    name: string;
    email: string;
    phone: string;
    status: 'active' | 'inactive';
    currentLoad: number;  // max: 3 
    areas: string[];
    shift: {
        start: string;     // HH:mm 
        end: string; // HH:mm
    };
    metrics: {
        rating: number;
        completedOrders: number;
        cancelledOrders: number;
    };
}

export type DeliveryPartnerMetrics = {
    totalActive: number;
    avgRating: number;
    topAreas: string[];
}