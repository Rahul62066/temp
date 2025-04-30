"use server";

import Stripe from 'stripe';
import { CheckoutOrderParams, CreateOrderParams, GetOrdersByEventParams, GetOrdersByUserParams } from "@/types";
import { handleError } from '../utils';
import { connectToDatabase } from '../database';
import Order from '../database/models/order.model';
import Event from '../database/models/event.model';
import User from '../database/models/user.model';
import { ObjectId } from 'mongodb';

export const checkoutOrder = async (order: CheckoutOrderParams) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const price = order.isFree ? 0 : Number(order.price) * 100;
  console.log("order", order);
  console.log("typeof order.buyerId", typeof order.buyerId);
  console.log("typeof order.eventId", typeof order.eventId);

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: price,
            product_data: {
              name: order.eventTitle,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        eventId: String(order.eventId),
        buyerId: String(order.buyerId),
        selectedDate: order.selectedDate || '',
        selectedLocation: order.selectedLocation || '',
      },
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/profile?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/?canceled=true`,
    });

    return { url: session.url };
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const createOrder = async (order: CreateOrderParams) => {
  console.log('Creating order with data:', order);
  console.log('typeof order.buyerId', typeof order.buyerId);
  console.log('typeof order.eventId', typeof order.eventId);
  console.log('typeof order.selectedDate', typeof order.selectedDate);
  console.log('typeof order.selectedLocation', typeof order.selectedLocation);
  console.log('typeof order.stripeId', typeof order.stripeId);
  console.log('typeof order.totalAmount', typeof order.totalAmount);
  console.log('typeof order.createdAt', typeof order.createdAt);
  try {
    await connectToDatabase();
    const newOrder = await Order.create({
      ...order,
      event: order.eventId,
      buyer: order.buyerId, // ✅ MUST be a plain string or ObjectId
      selectedDate: order.selectedDate,
      selectedLocation: order.selectedLocation,
    });
    console.log('Creating order with buyer ID:', order.buyerId, typeof order.buyerId);
    console.log('New order created:', newOrder);
    return JSON.parse(JSON.stringify(newOrder));
  } catch (error) {
    handleError(error);
  }
};

export async function getOrdersByEvent({ searchString, eventId }: GetOrdersByEventParams) {
  try {
    await connectToDatabase();

    if (!eventId) throw new Error('Event ID is required');
    const eventObjectId = new ObjectId(eventId);

    const orders = await Order.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'buyer',
          foreignField: '_id',
          as: 'buyer',
        },
      },
      { $unwind: '$buyer' },
      {
        $lookup: {
          from: 'events',
          localField: 'event',
          foreignField: '_id',
          as: 'event',
        },
      },
      { $unwind: '$event' },
      {
        $project: {
          _id: 1,
          totalAmount: 1,
          createdAt: 1,
          selectedDate: 1,
          selectedLocation: 1,
          eventTitle: '$event.title',
          eventId: '$event._id',
          buyer: {
            $concat: ['$buyer.firstName', ' ', '$buyer.lastName'],
          },
        },
      },
      {
        $match: {
          $and: [
            { eventId: eventObjectId },
            { buyer: { $regex: RegExp(searchString, 'i') } },
          ],
        },
      },
    ]);

    return JSON.parse(JSON.stringify(orders));
  } catch (error) {
    handleError(error);
  }
}

export async function getOrdersByUser({ userId, limit = 3, page }: GetOrdersByUserParams) {
  try {
    await connectToDatabase();
    const skipAmount = (Number(page) - 1) * limit;
    let conditions = { buyer: userId };

    if (!userId) throw new Error('User ID is required')
    
    // Handle both string and object userId inputs
    const userIdString = typeof userId === 'string' ? userId : (userId as { userId: string }).userId;
    conditions = { buyer: userIdString };

    const orders = await Order.distinct('event._id')
      .find(conditions)
      .sort({ createdAt: 'desc' })
      .skip(skipAmount)
      .limit(limit)
      .populate({
        path: 'event',
        model: Event,
        populate: {
          path: 'organizer',
          model: User,
          select: '_id firstName lastName',
        },
      });

    const ordersCount = await Order.countDocuments(conditions);

    return {
      data: JSON.parse(JSON.stringify(orders)),
      totalPages: Math.ceil(ordersCount / limit),
    };
  } catch (error) {
    handleError(error);
  }
}
