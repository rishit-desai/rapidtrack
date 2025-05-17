// PUT and DELETE /api/partners/:id

import { NextResponse } from 'next/server';
import { updatePartner, deletePartner } from '@/lib/partners';
import { DeliveryPartner } from '@/types/partner';
import { cusResponse } from '@/types/api';


export async function PUT(request: Request, { params }: { params: { id: string } }) {
	try {
		const body = await request.json();
		const partner: DeliveryPartner = await updatePartner(params.id, body);
		const res = {
			data: partner,
			status: 200,
		};
		return NextResponse.json(res);
	}
	catch {
		const res = {
			error: 'Failed to update partner',
			message: "Error updating partner",
			status: 500,
		};
		return NextResponse.json(res, { status: 500 });
	}
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
	try {
		const isDeleted = await deletePartner(params.id);
		const res: cusResponse = {
			data: isDeleted,
			status: 200,
		};
		return NextResponse.json(res);
	}
	catch {
		const res = {
			error: 'Failed to delete partner',
			message: "Error deleting partner",
			status: 500,
		};
		return NextResponse.json(res, { status: 500 });
	}
}