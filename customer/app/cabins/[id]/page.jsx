import { EyeSlashIcon, MapPinIcon, UsersIcon } from "@heroicons/react/24/solid";
import { getCabin, getCabins } from "@/_lib/data-service";
import TextExpander from "@/_components/TextExpander";
import styles from "../page.module.css";
import Image from "next/image";
import Reservation from "@/_components/Reservation";
import Spinner from "@/_components/Spinner";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const cabins = await getCabins();

  return cabins.map((cabin) => ({
    id: String(cabin.id),
  }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const cabin = await getCabin(id);

  return {
    title: `Cabin ${cabin.name}`,
    description: `Details and reservation for cabin ${cabin.name}`,
  };
}

export default async function Page({ params }) {
  const { id } = await params;
  const cabin = await getCabin(id);

  if (!cabin) {
    return (
      <main className={styles.page}>
        <p className={styles.description}>No cabins found.</p>
      </main>
    );
  }

  const { name, maxCapacity, image, description } = cabin;

    const imageUrl = image.startsWith("http")
    ? image
    : `https://wild-oasis-api.vercel.app${image}`;

  return (
    <main className={`${styles.page} ${styles.detailPage}`}>
      <div className={`${styles.cabin} ${styles.detailCabin}`}>
        <div className={styles.imageWrap}>
          <Image width={220} height={195.2} src={imageUrl} alt={`Cabin ${name}`} />
        </div>

        <div className={styles.content}>
          <h3 className={styles.title}>Cabin {name}</h3>

          <p className={styles.description}>
            <TextExpander>{description}</TextExpander>
          </p>

          <ul className={styles.metaList}>
            <li className={styles.metaItem}>
              <UsersIcon className={styles.icon} />
              <span>
                For up to <span className={styles.bold}>{maxCapacity}</span>{" "}
                guests
              </span>
            </li>
            <li className={styles.metaItem}>
              <MapPinIcon className={styles.icon} />
              <span>
                Located in the heart of the{" "}
                <span className={styles.bold}>Dolomites</span> (Italy)
              </span>
            </li>
            <li className={styles.metaItem}>
              <EyeSlashIcon className={styles.icon} />
              <span>
                Privacy <span className={styles.bold}>100%</span> guaranteed
              </span>
            </li>
          </ul>
        </div>
      </div>
      <div className={styles.reserve}>
        <h2 className={styles.reserveTitle}>Reserve {cabin.name} today. Pay on arrival.</h2>
      </div>
      <Suspense fallback={<Spinner />}>
        <Reservation cabin={cabin} />
      </Suspense>
    </main>
  );
}
