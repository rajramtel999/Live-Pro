import { NextResponse } from 'next/server';
import { seedFirestoreData } from '@/lib/seedFirestore';

export async function POST(request: Request) {
  const requestKey = request.headers.get('x-seed-key');
  const expectedKey = process.env.SEED_API_KEY;

  if (!expectedKey || requestKey !== expectedKey) {
    return NextResponse.json(
      { error: 'Unauthorized seed request' },
      { status: 401 }
    );
  }

  try {
    const result = await seedFirestoreData();
    return NextResponse.json({ success: true, inserted: result });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
