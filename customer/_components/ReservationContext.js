"use client";

import { createContext, useContext, useState } from "react";

const ReservationContext = createContext(null);

function ReservationProvider({ children }) {
  const [range, setRange] = useState();

  return (
    <ReservationContext.Provider value={{ range, setRange }}>
      {children}
    </ReservationContext.Provider>
  );
}

function useReservation() {
  const context = useContext(ReservationContext);

  if (!context) {
    throw new Error("useReservation must be used inside ReservationProvider");
  }

  return context;
}

export { ReservationProvider, useReservation };
