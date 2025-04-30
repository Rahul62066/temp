"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "../ui/button";
import CheckoutButton from "./CheckoutButton";

interface DialogEventProps {
  event: any;
}

const DialogEvent = ({ event }: DialogEventProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  // console.log("DialogEvent rendered", event);

  const fetchBookedDates = async () => {
    

    try {
      const res = await fetch("/api/bookeddate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      // console.log("Response from API:", res);
      const data = await res.json();

      // console.log("Orders from API:", data);
      const orders = data.orders || [];

      const dates =
  orders
    .map((order: { selectedDate: string }) => {
      if (!order.selectedDate) return null; 
      const date = new Date(order.selectedDate);
      if (isNaN(date.getTime())) return null; 
      return date.toISOString().split("T")[0];
    })
    .filter((d: string | null): d is string => d !== null);


      setBookedDates(dates);
    } catch (error) {
      console.error("Error fetching booked dates:", error);
    }
  };

  useEffect(() => {
    if (open ) {
      fetchBookedDates();
    }
    setSelectedDate(undefined);
  }, [open, selectedLocation, event?._id]);

  const isReadyToCheckout = selectedDate && selectedLocation;

  return (
    <div className="w-full max-w-md">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="default">Book Now</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[445px] bg-slate-100 rounded-md">
          <DialogHeader>
            <DialogTitle>Choose your date</DialogTitle>
            <DialogDescription>
              Select the date and time that work best for you.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <SelectLocation
              location={selectedLocation}
              setLocation={setSelectedLocation}
            />
            <CalendarEvent
              date={selectedDate}
              setDate={setSelectedDate}
              bookedDates={bookedDates}
            />
          </div>

          <DialogFooter>
            {isReadyToCheckout ? (
              <CheckoutButton
                event={event}
                selectedDate={selectedDate}
                selectedLocation={selectedLocation}
              />
            ) : (
              <Button disabled className="w-full">
                Select date and location
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DialogEvent;

interface SelectLocationProps {
  location: string;
  setLocation: (location: string) => void;
}

function SelectLocation({ location, setLocation }: SelectLocationProps) {
  return (
    <Select onValueChange={setLocation} value={location}>
      <SelectTrigger className="w-full bg-slate-300">
        <SelectValue placeholder="Select Location" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup className="bg-slate-200 p-2">
          <SelectLabel>Locations</SelectLabel>
          <SelectItem value="nit-jamshedpur">NIT Jamshedpur</SelectItem>
          <SelectItem value="xlri">XLRI Jamshedpur</SelectItem>
          <SelectItem value="tatasteel">Tata Steel Auditorium</SelectItem>
          <SelectItem value="jubilee-park">Jubilee Park Grounds</SelectItem>
          <SelectItem value="keenan-stadium">Keenan Stadium</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

interface CalendarEventProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  bookedDates?: string[];
}

function CalendarEvent({ date, setDate, bookedDates = [] }: CalendarEventProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const disabledDates = bookedDates.map((d) => {
    const dt = new Date(d);
    dt.setHours(0, 0, 0, 0);
    return dt;
  });

  return (
    <Calendar
      className="w-full rounded-md border shadow bg-slate-200"
      mode="single"
      selected={date}
      onSelect={setDate}
      disabled={(date) =>
        date < today ||
        disabledDates.some((d) => d.getTime() === date.setHours(0, 0, 0, 0))
      }
    />
  );
}
