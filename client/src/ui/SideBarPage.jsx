import { NavLink } from "react-router-dom";
import {
  HiOutlineCalendarDays,
  HiOutlineCog6Tooth,
  HiOutlineHome,
  HiOutlineHomeModern,
} from "react-icons/hi2";
import styles from "./SideBarPage.module.css";

const navItems = [
  {
    to: "/dashboard",
    label: "Home",
    icon: HiOutlineHome,
  },
  {
    to: "/bookings",
    label: "Bookings",
    icon: HiOutlineCalendarDays,
  },
  {
    to: "/cabins",
    label: "Cabins",
    icon: HiOutlineHomeModern,
  },
  {
    to: "/settings",
    label: "Settings",
    icon: HiOutlineCog6Tooth,
  },
];

export function SideBar() {
  return (
    <div className={styles.sidebar}>
      <div className={styles["sidebar-logo"]}>
        <img src="/img/logo-dark.png" alt="Logo" className={styles["sidebar-logo-image"]} />
      </div>

      <nav className={styles["sidebar-nav"]}>
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              className={({ isActive }) =>
                `${styles["sidebar-link"]} ${isActive ? styles.active : ""}`
              }
              key={item.to}
              to={item.to}
            >
              <Icon className={styles["sidebar-icon"]} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
