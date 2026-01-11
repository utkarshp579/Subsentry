import { NextResponse } from 'next/server';

// GET /api/subscriptions
export async function GET() {
  try {
    // Mock data - replace with your actual database query
    const subscriptions = [
      {
        id: '1',
        name: 'Netflix Premium',
        amount: 19.99,
        billingCycle: 'monthly',
        category: 'Entertainment',
        renewalDate: '2026-01-09',
        trial: false,
        source: 'stripe',
        status: 'active'
      },
      {
        id: '2',
        name: 'Spotify Family',
        amount: 16.99,
        billingCycle: 'monthly',
        category: 'Music',
        renewalDate: '2026-01-12',
        trial: false,
        source: 'paypal',
        status: 'active'
      },
      {
        id: '3',
        name: 'Adobe Creative Cloud',
        amount: 599.88,
        billingCycle: 'yearly',
        category: 'Software',
        renewalDate: '2026-03-15',
        trial: false,
        source: 'stripe',
        status: 'active'
      },
      {
        id: '4',
        name: 'GitHub Pro',
        amount: 4.00,
        billingCycle: 'monthly',
        category: 'Development',
        renewalDate: '2026-01-20',
        trial: true,
        source: 'stripe',
        status: 'trial'
      },
      {
        id: '5',
        name: 'Figma Professional',
        amount: 12.00,
        billingCycle: 'monthly',
        category: 'Design',
        renewalDate: '2026-02-01',
        trial: false,
        source: 'stripe',
        status: 'active'
      }
    ];

    return NextResponse.json({ subscriptions });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}
