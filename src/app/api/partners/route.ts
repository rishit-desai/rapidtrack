// GET and POST /api/partners
import { NextResponse } from 'next/server';
import { getPartners, createPartner } from '@/lib/partners';
import { DeliveryPartner } from '@/types/partner';
import { cusResponse } from '@/types/api';

export async function GET() {
	try {
		const partners = await getPartners();
		const res: cusResponse = {
			data: partners,
			status: 200,
		}
		return NextResponse.json(res);
	} catch {
		const res: cusResponse = {
			error: 'Failed to fetch partners',
			message: "Error fetching partners",
			status: 500,
		}
		return NextResponse.json(res, { status: 500 });
	}
}
export async function POST(request: Request) {
	try {
		const body = await request.json();
		const partner: DeliveryPartner = await createPartner(body);
		const res: cusResponse = {
			data: partner,
			status: 200,
		}
		return NextResponse.json(res);
	}
	catch {
		const res: cusResponse = {
			error: 'Failed to create partner',
			message: "Error creating partner",
			status: 500,
		}
		return NextResponse.json(res, { status: 500 });
	}
}