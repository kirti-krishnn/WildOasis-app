"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "./auth";

import {
  createBooking,
  deleteBooking,
  getBooking,
  getGuest,
  updateBooking,
  updateGuest,
} from "./data-service";

export async function createReservation(formData) {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
  console.error("UPDATE PROFILE: server session is missing");
  throw new Error("SERVER SESSION IS MISSING");
}

  const guest = await getGuest(email);
  const guestId = guest?.id || guest?._id;

  if (!guestId) throw new Error("Could not find your guest account.");

  await createBooking({
    cabinId: formData.get("cabinId"),
    guestId,
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    numGuests: Number(formData.get("numGuests")),
    observations: formData.get("observations") || "",
    hasBreakfast: false,
    isPaid: false,
    status: "unconfirmed",
    created_at: new Date().toISOString(),
  }, email);

  revalidatePath("/account/reservations");
  redirect("/account/reservations");
}

export async function signOutUser() {
  redirect("/api/auth/signout?callbackUrl=/");
}

export async function updateProfile(previousState, formData) {
  void previousState;

  try {
    const session = await auth();
    const email = session?.user?.email;

    if (!email) redirect("/login");

    const guest = await getGuest(email);
    const guestId = guest?.id || guest?._id;

    if (!guestId) throw new Error("Could not find your guest account.");

    const nationalID = String(formData.get("nationalID") || "").trim();

    if (nationalID && !/^\d{1,10}$/.test(nationalID)) {
      throw new Error("National ID must contain only numbers and be at most 10 digits.");
    }

    const [nationality, countryFlag] = String(formData.get("nationality") || "").split("%");

    await updateGuest(guestId, {
      nationalID,
      nationality,
      countryFlag,
      email,
    });

    revalidatePath("/account/profile", "page");
  } catch (error) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;

    return {
      error: error instanceof Error ? error.message : "Could not update profile.",
    };
  }

  return { error: "" };
}

export async function deleteReservation(formData) {
  const bookingId = formData.get("bookingId");

  if (typeof bookingId !== "string" || !bookingId) {
    throw new Error("Reservation ID is required.");
  }

  const session = await auth();
  const email = session?.user?.email;

  if (!email) redirect("/login");

  const guest = await getGuest(email);
  const guestId = String(guest?.id || guest?._id || "");
  const booking = await getBooking(bookingId, email);
  const bookingGuestId = String(
    booking?.guestId?.id || booking?.guestId?._id || booking?.guestId || "",
  );

  if (!guestId || guestId !== bookingGuestId) {
    throw new Error("You are not allowed to delete this reservation.");
  }

  if (new Date(booking.startDate) <= new Date()) {
    throw new Error("Past reservations cannot be deleted.");
  }

  await deleteBooking(bookingId, email);
  revalidatePath("/account/reservations");
}

export async function updateReservation(previousState, formData) {
  void previousState;

  let bookingId;

  try {
    bookingId = formData.get("bookingId");

    if (typeof bookingId !== "string" || !bookingId) {
      throw new Error("Reservation ID is required.");
    }

    const session = await auth();
    const email = session?.user?.email;

    if (!email) redirect("/login");

    const guest = await getGuest(email);
    const guestId = String(guest?.id || guest?._id || "");
    const booking = await getBooking(bookingId, email);
    const bookingGuestId = String(
      booking?.guestId?.id || booking?.guestId?._id || booking?.guestId || "",
    );

    if (!guestId || guestId !== bookingGuestId) {
      throw new Error("You are not allowed to update this reservation.");
    }

    if (new Date(booking.startDate) <= new Date()) {
      throw new Error("Past reservations cannot be updated.");
    }

    await updateBooking(bookingId, {
      numGuests: Number(formData.get("numGuests")),
      hasBreakfast: formData.get("hasBreakfast") === "true",
      observations: formData.get("observations") || "",
    }, email);

    revalidatePath("/account/reservations");
    revalidatePath(`/profile/reservations/edit/${bookingId}`);
  } catch (error) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;

    return {
      error: error instanceof Error ? error.message : "Could not update reservation.",
    };
  }

  redirect("/account/reservations");
}

