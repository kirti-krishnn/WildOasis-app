import styles from "./loading.module.css";

function Loading() {
    return (
        <div className={styles.loading}>
            <h1 className={styles.heading}>Loading data......</h1>
        </div>
    )
}

export default Loading
