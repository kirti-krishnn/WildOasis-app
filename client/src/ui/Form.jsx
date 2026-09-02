import styles from "./Form.module.css";

function Form({ type = "regular", children, ...props }) {
  return (
    <form
      className={`${styles.form} ${
        type === "modal" ? styles.modal : styles.regular
      }`}
      {...props}
    >
      {children}
    </form>
  );
}

export default Form;