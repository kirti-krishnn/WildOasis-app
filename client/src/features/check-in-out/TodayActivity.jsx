import TodayItem from "./TodayItem.jsx";
import useTodayActivity from "./useTodayActivity.js";
import Spinner from "../../ui/Spinner.jsx";
import styles from "./TodayActivity.module.css";

export default function TodayActivity() {
  const { data: activities = [], isLoading, error } = useTodayActivity();

  return (
    <section className={styles.activity}>
      <h3 className={styles.heading}>Today&apos;s activity</h3>
      {isLoading ? <Spinner label="Loading today's activity" /> : null}
      {error ? <p className={styles.message}>{error.message}</p> : null}
      {!isLoading && !error && activities.length === 0 ? (
        <p className={styles.empty}>No activity today</p>
      ) : null}
      {!isLoading && !error && activities.length > 0 ? (
        <ul className={styles.list}>
          {activities.map((activity) => (
            <TodayItem key={activity._id ?? activity.id} activity={activity} />
          ))}
        </ul>
      ) : null}
    </section>
  );
}
