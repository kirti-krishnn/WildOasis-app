import SignInButton from "@/_components/SignInButton";
import styles from "./page.module.css";

export default function Page() {
  return (
    <div className={styles.page}>
      <h2 className={styles.heading}>
        Sign in to access your guest area
      </h2>
      <SignInButton />
    </div>
  );
}
