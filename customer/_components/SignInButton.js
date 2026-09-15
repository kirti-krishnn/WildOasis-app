"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";
import styles from "./SignInButton.module.css";

function SignInButton() {
  return (
    <button
      className={styles.button}
      type="button"
      onClick={() => signIn("google", { callbackUrl: "/account" })}
    >
      <Image
        src="https://authjs.dev/img/providers/google.svg"
        alt="Google logo"
        height={16}
        width={16}
      />
      <span>Continue with Google</span>
    </button>
  );
}

export default SignInButton;
