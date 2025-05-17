import { Order } from "@/types/order";

export async function getOrders(): Promise<Order[]> {
    // Simulate fetching partners from a database
    const orders: Order[] = [
        {
            _id: "1",
            area: "Goregaon",
            createdAt: new Date(),
            customer: {
                name: "John Doe",
                phone: "9930374661",
                address: "123, Goregaon, Mumbai",
            },
            items: [
                {
                    name: "Item 1",
                    quantity: 2,
                    price: 100,
                },
                {
                    name: "Item 2",
                    quantity: 1,
                    price: 200,
                },
            ],
            orderNumber: "ORD123",
            scheduledFor: "2023-10-01T10:00:00Z",
            status: "pending",
            totalAmount: 400,
            updatedAt: new Date(),
        },
        {
            _id: "2",
            area: "Malad",
            createdAt: new Date(),
            customer: {
                name: "Jane Smith",
                phone: "9930374662",
                address: "456, Malad, Mumbai",
            },
            items: [
                {
                    name: "Item 3",
                    quantity: 1,
                    price: 150,
                },
                {
                    name: "Item 4",
                    quantity: 3,
                    price: 50,
                },
            ],
            orderNumber: "ORD124",
            scheduledFor: "2023-10-01T11:00:00Z",
            status: "assigned",
            totalAmount: 300,
            updatedAt: new Date(),
        },
    ];
    return new Promise<Order[]>((resolve) => {
        resolve(orders);
    });
}

export async function createOrder(order: Order): Promise<Order> {
    // Simulate creating a partner in a database
    return new Promise<Order>((resolve) => {
        const newOrder = {
            ...order,
            _id: `${Date.now()}`,
        };
        resolve(newOrder);
    });
}

export async function updateOrder(id: string, order: Order): Promise<Order> {
    // Simulate updating a partner in a database
    return new Promise<Order>((resolve) => {
        const updatedOrder = {
            ...order,
            _id: id,
        };
        resolve(updatedOrder);
    });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function deleteOrder(_id: string): Promise<boolean> {
    // Simulate deleting a partner from a database
    return new Promise<boolean>((resolve) => {
        // random true or false
        const isDeleted = Math.random() > 0.5;
        resolve(isDeleted);
    });
}

export async function getOrderById(id: string): Promise<Order | null> {
    // Simulate fetching a partner by ID from a database
    return new Promise<Order | null>((resolve) => {
        const order: Order = {
            _id: id,
            area: "Goregaon",
            createdAt: new Date(),
            customer: {
                name: "John Doe",
                phone: "9930374661",
                address: "123, Goregaon, Mumbai",
            },
            items: [
                {
                    name: "Item 1",
                    quantity: 2,
                    price: 100,
                },
                {
                    name: "Item 2",
                    quantity: 1,
                    price: 200,
                },
            ],
            orderNumber: "ORD123",
            scheduledFor: "2023-10-01T10:00:00Z",
            status: "pending",
            totalAmount: 400,
            updatedAt: new Date(),
        };
        resolve(order);
    });
}

export async function assignOrderToPartner(orderId: string): Promise<Order> {
    // Simulate assigning an order to a partner
    const assignedOrder: Order = {
        _id: orderId,
        area: "Goregaon",
        createdAt: new Date(),
        customer: {
            name: "John Doe",
            phone: "9930374661",
            address: "123, Goregaon, Mumbai",
        },
        items: [
            {
                name: "Item 1",
                quantity: 2,
                price: 100,
            },
            {
                name: "Item 2",
                quantity: 1,
                price: 200,
            },
        ],
        orderNumber: "ORD123",
        scheduledFor: "2023-10-01T10:00:00Z",
        status: "assigned",
        assignedTo: "partnerId", // Simulate assigning to a partner
        totalAmount: 400,
        updatedAt: new Date(),
    };
    return new Promise<Order>((resolve) => {
        resolve(assignedOrder);
    });

}


export async function updateOrderStatus(id: string, order: Order): Promise<Order> {
    // Simulate updating an order status in a database
    return new Promise<Order>((resolve) => {
        const updatedOrder = {
            ...order,
            _id: id,
        };
        resolve(updatedOrder);
    });
}