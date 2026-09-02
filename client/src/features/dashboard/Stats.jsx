import {
  HiOutlineBanknotes,
  HiOutlineBriefcase,
  HiOutlineCalendarDays,
  HiOutlineChartBar,
} from "react-icons/hi2";
import { formatCurrency } from "../bookings/bookingFormatters.js";
import Stat from "./Stat.jsx";
import styles from "./Stats.module.css";

export default function Stats({ stats }) {
  return (
    <section className={styles.stats}>
      <Stat
        title="Bookings"
        color="blue"
        icon={<HiOutlineBriefcase />}
        value={stats.numBookings}
      />
      <Stat
        title="Sales"
        color="green"
        icon={<HiOutlineBanknotes />}
        value={formatCurrency(stats.sales)}
      />
      <Stat
        title="Check-ins"
        color="indigo"
        icon={<HiOutlineCalendarDays />}
        value={stats.checkIns}
      />
      <Stat
        title="Occupancy rate"
        color="orange"
        icon={<HiOutlineChartBar />}
        value={`${stats.occupancyRate}%`}
      />
    </section>
  );
}
