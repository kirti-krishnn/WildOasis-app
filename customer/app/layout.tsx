import type { Metadata } from "next";
import Header from "@/_components/Header";
import AuthProvider from "@/_components/AuthProvider";
import ReservationReminder from "@/_components/ReservationReminder";
import { ReservationProvider } from "@/_components/ReservationContext";


import {Josefin_Sans} from "next/font/google";

const josefin = Josefin_Sans({
  subsets:["latin"],
  display: "swap",
})

import "@/_styles/globals.css";

export const metadata: Metadata = {
  title:{
    template: "%s / The Wild Oasis",
    default: "Welcome / The Wild Oasis",
  } ,
  description: "Customer website for The Wild Oasis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className ={`${josefin.className}`}>
        <AuthProvider>
          <ReservationProvider>
            <Header/>
            {children}
            <ReservationReminder />
          </ReservationProvider>
        </AuthProvider>
        
      </body>
    </html>
  );
}
