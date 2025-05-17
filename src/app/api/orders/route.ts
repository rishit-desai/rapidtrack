// GET and POST /api/orders
import { NextResponse } from 'next/server';
import { getOrders, createOrder } from '@/lib/orders';
import { Order } from '@/types/order';
import { cusResponse } from '@/types/api';

export async function GET() {
    try {
        const orders = await getOrders();
        const res: cusResponse = {
            data: orders,
            status: 200,
        }
        return NextResponse.json(res);
    } catch {
        const res: cusResponse = {
            error: 'Failed to fetch orders',
            message: "Error fetching orders",
            status: 500,
        }
        return NextResponse.json(res, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const order: Order = await createOrder(body);
        const res: cusResponse = {
            data: order,
            status: 200,
        }
        return NextResponse.json(res);
    }
    catch {
        const res: cusResponse = {
            error: 'Failed to create order',
            message: "Error creating order",
            status: 500,
        }
        return NextResponse.json(res, { status: 500 });
    }
}