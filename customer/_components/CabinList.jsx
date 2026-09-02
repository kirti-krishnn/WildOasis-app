import CabinCard from "@/_components/CabinCard";
import { getCabins } from "@/_lib/data-service";
import styles from "../app/cabins/page.module.css";

function filterCabins(cabins, capacity) {
  if (capacity === "small") {
    return cabins.filter((cabin) => cabin.maxCapacity >= 2 && cabin.maxCapacity <= 3);
  }

  if (capacity === "medium") {
    return cabins.filter((cabin) => cabin.maxCapacity >= 4 && cabin.maxCapacity <= 7);
  }

  if (capacity === "large") {
    return cabins.filter((cabin) => cabin.maxCapacity >= 8 && cabin.maxCapacity <= 12);
  }

  return cabins;
}

async function CabinList({ activeFilter }) {
  const cabins = await getCabins();
  const filteredCabins = filterCabins(cabins, activeFilter);

  return filteredCabins.length > 0 ? (
    <div className={styles.cardGrid}>
      {filteredCabins.map((cabin) => (
        <CabinCard cabin={cabin} key={cabin.id} />
      ))}
    </div>
  ) : (
    <p className={styles.emptyMessage}>No cabins match this filter.</p>
  );
}

export default CabinList;
