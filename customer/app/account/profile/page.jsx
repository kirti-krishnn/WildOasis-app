import styles from "./page.module.css";
import UpdateProfileForm from "@/_components/UpdateProfileForm";
import SelectCountry from "@/_components/SelectCountry";
import { auth } from "@/_lib/auth";
import { getGuest } from "@/_lib/data-service";

export default async function Page() {
    const session = await auth();
    const fullName = session?.user?.name ?? "";
    const email = session?.user?.email ?? "";
    const guest = email ? await getGuest(email) : null;

    const nationality = guest?.nationality || "";
    const countryFlag = guest?.countryFlag || "";
    const nationalID = guest?.nationalID || "";

   return (
    <div className={styles.profile}>
      <h2 className={styles.heading}>
        Update your guest profile
      </h2>

      <p className={styles.description}>
        Providing the following information will make your check-in process
        faster and smoother. See you soon!
      </p>

      <UpdateProfileForm
      fullName={fullName} email={email}
      countryFlag={countryFlag} nationalID={nationalID} >
      
       <SelectCountry
                  name="nationality"
                  id="nationality"
                  className={styles.input}
                  defaultCountry={nationality}
                />
      </UpdateProfileForm>
    </div>
  );
}
