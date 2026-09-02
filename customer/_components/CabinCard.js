import { UsersIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import styles from "./CabinCard.module.css";
import Image from "next/image";

function CabinCard({ cabin }) {
  const { id, name, maxCapacity, regularPrice, discount, image } = cabin;

  return (
    <article className={styles.card}>
      <Image
      width={220}
      height={195.2}
        src={image}
        alt={`Cabin ${name}`}
        className={styles.image}
      />

      <div className={styles.content}>
        <div className={styles.details}>
          <h3 className={styles.title}>Cabin {name}</h3>

          <div className={styles.capacity}>
            <UsersIcon className={styles.icon} />
            <p>
              For up to <span className={styles.bold}>{maxCapacity}</span> guests
            </p>
          </div>

          <p className={styles.price}>
            {discount > 0 ? (
              <>
                <span className={styles.currentPrice}>
                  ${regularPrice - discount}
                </span>
                <span className={styles.oldPrice}>
                  ${regularPrice}
                </span>
              </>
            ) : (
              <span className={styles.currentPrice}>${regularPrice}</span>
            )}
            <span className={styles.perNight}>/ night</span>
          </p>
        </div>

        <div className={styles.action}>
          <Link
            href={`/cabins/${id}`}
            className={styles.link}
          >
            Details & reservation &rarr;
          </Link>
        </div>
      </div>
    </article>
  );
}

export default CabinCard;
