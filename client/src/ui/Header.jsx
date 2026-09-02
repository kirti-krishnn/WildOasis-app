import styles from "./Header.module.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import {
  HiArrowRightOnRectangle,
  HiOutlineMoon,
  HiOutlineUser,
} from "react-icons/hi2";

function getUserPhotoSrc(photo) {
  if (!photo) return "/users/user-1.jpg";
  if (photo.startsWith("http") || photo.startsWith("/")) return photo;
  return `/users/${photo}`;
}

export function Header() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userName = user?.name || "User";

  return (
    <header className={styles.header}>
      <div className={styles["headerContent"]}>

        <div className={styles["user"]}>

            <img src={getUserPhotoSrc(user?.photo)} alt={userName} className={styles["avatar"]}/>
     
             <span className={styles["userName"]}>{userName}</span>
        </div>
        <div className={styles["actions"]}>
          <button className={styles["iconButton"]}>
            <HiOutlineUser className={styles.icon} />
          </button>
          <button className={styles["iconButton"]}>
            <HiOutlineMoon className={styles.icon} />
          </button>
          <button
            className={styles["iconButton"]}
            type="button"
            aria-label="Log out"
            onClick={() => navigate("/logout")}
          >
            <HiArrowRightOnRectangle className={styles.icon} />
          </button>
        </div>
      </div>     
    </header>
  )
}
