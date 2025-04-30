import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { createOrder } from '@/lib/actions/order.actions'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature') as string
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err) {
    return NextResponse.json({ message: 'Webhook error', error: err }, { status: 400 })
  }

  const eventType = event.type

  if (eventType === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const order = {
      stripeId: session.id,
      eventId: session.metadata?.eventId || '',
      buyerId: session.metadata?.buyerId || '', // ✅ ensure it's a string
      totalAmount: session.amount_total ? (session.amount_total / 100).toString() : '0',
      selectedDate: session.metadata?.selectedDate || '',
      selectedLocation: session.metadata?.selectedLocation || '',
      createdAt: new Date(),
    };
    console.log('Creating order with data:', order);
  console.log('typeof order.buyerId', typeof order.buyerId);
  console.log('typeof order.eventId', typeof order.eventId);
  console.log('typeof order.selectedDate', typeof order.selectedDate);
  console.log('typeof order.selectedLocation', typeof order.selectedLocation);
  console.log('typeof order.stripeId', typeof order.stripeId);
  console.log('typeof order.totalAmount', typeof order.totalAmount);
  console.log('typeof order.createdAt', typeof order.createdAt);

    try {
      console.log('Creating order with data:', order)
      console.log("typeofin route:",order.buyerId)
      const newOrder = await createOrder(order)
      console.log('New order created:', newOrder)
      return NextResponse.json({ message: 'OK', order: newOrder })
    } catch (err) {
      return NextResponse.json({ message: 'Failed to create order', error: err }, { status: 500 })
    }
  }

  return new Response('', { status: 200 })
}
