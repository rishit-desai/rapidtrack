// PUT request to change the status of an order
import { NextResponse } from 'next/server';
import { updateOrderStatus } from '@/lib/orders';
import { Order } from '@/types/order';
import { cusResponse } from '@/types/api';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const body: Order = await request.json();
        const order: Order = await updateOrderStatus(params.id, body);
        const res: cusResponse = {
            data: order,
            status: 200,
        };
        return NextResponse.json(res);
    }
    catch {
        const res: cusResponse = {
            error: 'Failed to update order status',
            message: "Error updating order status",
            status: 500,
        };
        return NextResponse.json(res, { status: 500 });
    }
}