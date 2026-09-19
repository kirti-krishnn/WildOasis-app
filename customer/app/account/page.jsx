import { auth } from "@/_lib/auth";
import SignOutButton from "@/_components/SignOutButton";
import styles from "./page.module.css";

export const metadata = {
  title: "Guest Area",
  description: "Customer website for The Wild Oasis",
};

async function Page() {
  const session = await auth();

  console.log("SERVER SESSION:", session);

  const name = session?.user?.name || "Guest";

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Welcome, {name}</h1>
      <div className={styles.actions}>
        <SignOutButton />
      </div>
    </div>
  );
}

export default Page;
