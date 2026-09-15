import SideNavigation from "@/_components/SideNavigation";
import styles from "../account/layout.module.css";

export default function Layout({ children }) {
  return (
    <div className={styles.layout}>
      <SideNavigation />
      <div className={styles.content}>{children}</div>
    </div>
  );
}
