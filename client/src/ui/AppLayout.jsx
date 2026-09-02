import { Outlet } from "react-router-dom";
import { SideBar } from "./SideBarPage";
import styles from "./AppLayout.module.css";
import { Header } from "./Header";

export function AppLayout() {
  return (
    <main className={styles.main}>      
      <SideBar />     
      <div className={styles["user-view"]}> 
         <Header />       
        <div className={styles["user-view__content"]}>
          <div className={styles["user-view__content-inner"]}>

          <Outlet />
          </div>
        </div>
      </div>
    </main>
  )
}