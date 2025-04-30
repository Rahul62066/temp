"use client";

import React, { useEffect } from "react";
import { Button } from "../ui/button";
import { checkoutOrder } from "@/lib/actions/order.actions";
import { IEvent } from "@/lib/database/models/event.model";

interface CheckoutProps {
  event: IEvent;
  userId: string;
  selectedDate: Date | undefined;
  selectedLocation: string;
}

const Checkout = ({ event, userId, selectedDate, selectedLocation }: CheckoutProps) => {
  console.log("first render Checkout component");
  console.log("Event:", event);
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);

    if (query.get("success")) {
      console.log("✅ Order placed! Check your email for confirmation.");
    }

    if (query.get("canceled")) {
      console.log("❌ Order canceled.");
    }
  }, []);

  const onCheckout = async () => {
    if (!selectedDate || !selectedLocation) {
      alert("Please select a date and location before proceeding.");
      return;
    }

    const order = {
      eventTitle: event.title,
      eventId: event._id,
      price: Number(event.price),
      isFree: event.isFree,
      buyerId: userId,
      selectedDate: selectedDate.toISOString(),
      selectedLocation,
    };
console.log("Order Oncheckout:", order);
    const session = await checkoutOrder(order);
console.log("Session after checkoutorder:", session);
    if (event.isFree) {
      alert("✅ Ticket confirmed for free event!");
      return;
    }

    if (session && session.url) {
      window.location.href = session.url;
    } else {
      console.error("Stripe session not returned or URL is missing");
    }
  };

  return (
    <Button type="button" role="link" size="lg" className="button sm:w-fit" onClick={onCheckout}>
      {event.isFree ? "Get Ticket" : "Buy Ticket"}
    </Button>
  );
};

export default Checkout;
