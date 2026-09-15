import { auth } from "@/_lib/auth";
import LoginMessage from "./LoginMessage";
import ReservationFormClient from "./ReservationFormClient";

async function ReservationForm({ cabin }) {
  const session = await auth();

  if (!session?.user) return <LoginMessage />;

  return <ReservationFormClient cabin={cabin} user={session.user} />;
}

export default ReservationForm;
