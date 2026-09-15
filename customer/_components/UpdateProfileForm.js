"use client";

import Image from "next/image";
import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/_lib/actions";
import styles from "./UpdateProfileForm.module.css";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className={styles.button} disabled={pending}>
      {pending ? "Updating..." : "Update profile"}
    </button>
  );
}

export default function UpdateProfileForm({ fullName, email, countryFlag, nationalID, children }) {
    const [state, formAction] = useActionState(updateProfile, { error: "" });
    const router = useRouter();
    const isFirstRender = useRef(true);

    useEffect(() => {
      if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
      }

      if (state.error) {
        window.alert(state.error);
        return;
      }

      // Force a refetch of this route's server data so the saved values show immediately.
      router.refresh();
    }, [state, router]);

    return (
    <div>
      <form className={styles.form} action={formAction}>
        <div className={styles.field}>
          <label className={styles.label}>Full name</label>
          <input
            disabled
            defaultValue={fullName}
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Email address</label>
          <input
            disabled
            defaultValue={email}
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label className={styles.label} htmlFor="nationality">Where are you from?</label>
            {countryFlag && (
              <Image
                src={countryFlag}
                alt="Country flag"
                width={20}
                height={20}
                className={styles.flag}
              />
            )}
          </div>

          {children}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="nationalID">National ID number</label>
          <input
            name="nationalID"
            id="nationalID"
            defaultValue={nationalID}
            maxLength={10}
            inputMode="numeric"
            className={styles.input}
          />
        </div>

        <div className={styles.actions}>
          <SubmitButton />
        </div>
      </form>
      </div>
      );
}
