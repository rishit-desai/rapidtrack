// PUT and DELETE request handlers for a specific order
import { NextResponse } from 'next/server';
import { updateOrder, deleteOrder } from '@/lib/orders';
import { Order } from '@/types/order';
import { cusResponse } from '@/types/api';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const body = await request.json();
        const order: Order = await updateOrder(params.id, body);
        const res: cusResponse = {
            data: order,
            status: 200,
        };
        return NextResponse.json(res);
    }
    catch {
        const res: cusResponse = {
            error: 'Failed to update order',
            message: "Error updating order",
            status: 500,
        };
        return NextResponse.json(res, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const isDeleted = await deleteOrder(params.id);
        const res: cusResponse = {
            data: isDeleted,
            status: 200,
        };
        return NextResponse.json(res);
    }
    catch {
        const res: cusResponse = {
            error: 'Failed to delete order',
            message: "Error deleting order",
            status: 500,
        };
        return NextResponse.json(res, { status: 500 });
    }
}