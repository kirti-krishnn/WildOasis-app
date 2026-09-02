import FeaturesHeader from "../ui/FeaturesHeader.jsx";
import DurationChart from "../features/dashboard/DurationChart.jsx";
import SalesChart from "../features/dashboard/SalesChart.jsx";
import Stats from "../features/dashboard/Stats.jsx";
import useDashboardStats from "../features/dashboard/useDashboardStats.js";
import TodayActivity from "../features/check-in-out/TodayActivity.jsx";
import { useSearchParams } from "react-router-dom";
import Spinner from "../ui/Spinner.jsx";
import styles from "./DashboardPage.module.css";

export function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const numDays = Number(searchParams.get("last")) || 7;
  const { data: stats, isLoading, error } = useDashboardStats();

  function handlePeriodChange(days) {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("last", String(days));
    setSearchParams(nextParams);
  }

  const homeFeatures = [
    { type: "button", title: "Last 7 days", active: numDays === 7, onClick: () => handlePeriodChange(7) },
    { type: "button", title: "Last 30 days", active: numDays === 30, onClick: () => handlePeriodChange(30) },
    { type: "button", title: "Last 90 days", active: numDays === 90, onClick: () => handlePeriodChange(90) },
  ];

  return (
    <div className={styles.dashboard}>
      <FeaturesHeader title="Dashboard" buttonList={homeFeatures} />
      {isLoading && <Spinner label="Loading dashboard stats" />}
      {error && <p className={styles.message}>{error.message}</p>}
      {!isLoading && !error && (
        <>
          <Stats stats={stats} />
          <div className={styles.middleGrid}>
            <TodayActivity />
            <DurationChart data={stats.durationChart} />
          </div>
          <SalesChart
            data={stats.salesChart}
            numDays={stats.numDays}
            periodEnd={stats.periodEnd}
            periodStart={stats.periodStart}
          />
        </>
      )}
    </div>
  );
}
