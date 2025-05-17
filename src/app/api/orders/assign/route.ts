// POST request to /api/orders/assign
import { NextResponse } from 'next/server';
import { assignOrderToPartner } from '@/lib/orders';
import { Order } from '@/types/order';
import { cusResponse } from '@/types/api';

export async function POST(request: Request) {
    try {
        const body: Order = await request.json();
        const order: Order = await assignOrderToPartner(body._id);
        const res: cusResponse = {
            data: order,
            status: 200,
        }
        return NextResponse.json(res);
    }
    catch {
        const res: cusResponse = {
            error: 'Failed to assign order',
            message: "Error assigning order",
            status: 500,
        }
        return NextResponse.json(res, { status: 500 });
    }
}