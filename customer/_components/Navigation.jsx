"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import styles from "./Navigation.module.css";

export default function Navigation() {
  const { data: session } = useSession();
  const userImage = session?.user?.image;

  return (
    <nav className={styles.nav}>
      <ul className={styles.list}>
        <li>
          <Link href="/cabins" className={styles.link}>
            Cabins
          </Link>
        </li>
        <li>
          <Link href="/about" className={styles.link}>
            About
          </Link>
        </li>
        <li>
          <Link
            href="/account"
            className={`${styles.link} ${styles.accountLink}`}
          >
            {userImage && (
              <Image
                src={userImage}
                alt={session.user.name || "Guest"}
                width={32}
                height={32}
                className={styles.avatar}
                referrerPolicy="no-referrer"
              />
            )}
            <span>Guest area</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
