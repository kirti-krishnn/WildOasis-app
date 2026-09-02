import styles from "./page.module.css";
import CabinList from "@/_components/CabinList";
import FilterTabs from "@/_components/FilterTabs";
import { Suspense } from "react";
import Spinner from "@/_components/Spinner.js";

const filterOptions = [
  { label: "All cabins", value: "all", href: "/cabins" },
  { label: "2-3 guests", value: "small", href: "/cabins?capacity=small" },
  { label: "4-7 guests", value: "medium", href: "/cabins?capacity=medium" },
  { label: "8-12 guests", value: "large", href: "/cabins?capacity=large" },
];

export default async function Page({ searchParams }) {
  const params = await searchParams;
  const activeFilter = params?.capacity || "all";

  return (
    <main className={styles.page}>
      <h1 className={styles.listHeading}>
        Our Luxury Cabins
      </h1>
      <p className={styles.listIntro}>
        Cozy yet luxurious cabins, located right in the heart of the Italian
        Dolomites. Imagine waking up to beautiful mountain views, spending your
        days exploring the dark forests around, or just relaxing in your private
        hot tub under the stars. Enjoy nature&apos;s beauty in your own little home
        away from home. The perfect spot for a peaceful, calm vacation. Welcome
        to paradise.
      </p>

      <FilterTabs options={filterOptions} activeValue={activeFilter} />

      <Suspense key={activeFilter} fallback={<Spinner />}>
        <CabinList activeFilter={activeFilter} />
      </Suspense>
    </main>
  );
}
