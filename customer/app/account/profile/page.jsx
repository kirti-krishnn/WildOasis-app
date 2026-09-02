import SelectCountry from "@/_components/SelectCountry";
import styles from "./page.module.css";
import Image from "next/image";

export default function Page() {
  // CHANGE
  const countryFlag = "https://flagcdn.com/pt.svg";
  const nationality = "portugal";

  return (
    <div className={styles.profile}>
      <h2 className={styles.heading}>
        Update your guest profile
      </h2>

      <p className={styles.description}>
        Providing the following information will make your check-in process
        faster and smoother. See you soon!
      </p>

      <form className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label}>Full name</label>
          <input
            disabled
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Email address</label>
          <input
            disabled
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label className={styles.label} htmlFor="nationality">Where are you from?</label>
            <Image
              src={countryFlag}
              alt="Country flag"
              width={20}
              height={20}
              className={styles.flag}
            />
          </div>

          <SelectCountry
            name="nationality"
            id="nationality"
            className={styles.input}
            defaultCountry={nationality}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="nationalID">National ID number</label>
          <input
            name="nationalID"
            className={styles.input}
          />
        </div>

        <div className={styles.actions}>
          <button className={styles.button}>
            Update profile
          </button>
        </div>
      </form>
    </div>
  );
}
