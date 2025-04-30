"use client";

import { IEvent } from "@/lib/database/models/event.model";
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";
import Checkout from "./Checkout";

interface CheckoutButtonProps {
  event: IEvent;
  selectedDate: Date | undefined;
  selectedLocation: string;
}

const CheckoutButton = ({ event, selectedDate, selectedLocation }: CheckoutButtonProps) => {
  const { user } = useUser();
  console.log("User:", user);
  console.log("Selected Date:", selectedDate);
  console.log("Selected Location:", selectedLocation);
  console.log("Event:", event);
  const userId = user?.publicMetadata.userId as string;
console.log("User ID:", userId);
  const hasEventFinished = new Date(event.endDateTime) < new Date();
  const isReady = selectedDate && selectedLocation;

  if (hasEventFinished) {
    return (
      <p className="p-2 text-red-400">
        Sorry, tickets are no longer available.
      </p>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <SignedOut>
        <Button asChild className="rounded-full" size="lg">
          <Link href="/sign-in">Get Tickets</Link>
        </Button>
      </SignedOut>

      <SignedIn>
        {isReady ? (
          <Checkout
            event={event}
            userId={userId}
            selectedDate={selectedDate}
            selectedLocation={selectedLocation}
          />
        ) : (
          <Button disabled className="rounded-full" size="lg">
            Select date and location
          </Button>
        )}
      </SignedIn>
    </div>
  );
};

export default CheckoutButton;
