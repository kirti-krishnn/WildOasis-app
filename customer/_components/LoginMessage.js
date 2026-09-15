import Link from "next/link";
import styles from "./ReservationForm.module.css";

function LoginMessage() {
  return (
    <div className={`${styles.reservationForm} ${styles.loginMessage}`}>
      <p>
        Please{" "}
        <Link href="/api/auth/signin" className={styles.loginLink}>
          log in
        </Link>{" "}
        to reserve this
        <br /> cabin right now
      </p>
    </div>
  );
}

export default LoginMessage;
