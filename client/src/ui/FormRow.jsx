import styles from "./FormRow.module.css";

function FormRow({children, ...props }) {
  return (
    <div className={`${styles.formRow}`}>
    <label
      className={`${styles.formRowLabel}`}
        
        >  
        {props.name}  
    </label>
      {children}
  </div>
  );
}

export default FormRow;