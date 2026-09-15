"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDaysIcon,
  HomeIcon,
  UserIcon,
} from "@heroicons/react/24/solid";
import SignOutButton from "./SignOutButton";
import styles from "./SideNavigation.module.css";

const navLinks = [
  {
    name: "Home",
    href: "/account",
    icon: HomeIcon,
  },
  {
    name: "Reservations",
    href: "/account/reservations",
    icon: CalendarDaysIcon,
  },
  {
    name: "Guest profile",
    href: "/account/profile",
    icon: UserIcon,
  },
];

function SideNavigation() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      <ul className={styles.list}>
        {navLinks.map(({ name, href, icon: Icon }) => {
          const isProfileReservationEdit =
            href === "/account/reservations" &&
            pathname.startsWith("/profile/reservations");
          const isActive =
            pathname === href ||
            isProfileReservationEdit ||
            (href !== "/account" && pathname.startsWith(href));

          return (
            <li key={name}>
              <Link
                className={`${styles.link} ${isActive ? styles.activeLink : ""}`}
                href={href}
              >
                <Icon className={styles.icon} />
                <span>{name}</span>
              </Link>
            </li>
          );
        })}

        <li className={styles.signOutItem}>
          <SignOutButton />
        </li>
      </ul>
    </nav>
  );
}

export default SideNavigation;
