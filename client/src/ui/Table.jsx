import { createContext } from "react";
import styles from "./Table.module.css";

const TableContext = createContext();

function Table({ children }) {
  return (
<TableContext.Provider value={{}}>
      <div className={styles.tableContainer}>
        <table className={styles.table}>{children}</table>
      </div>
    </TableContext.Provider>
  );
}

function Header({ columns }) {
  return (
    <thead className={styles.header}>
      <tr>
        {columns.map((label, index) => (
          <th
            key={`${label}-${index}`}
            className={styles.headerCell}
          >
            {label}
          </th>
        ))}
      </tr>
    </thead>
  );
}

function Body({ children }) {
  return <tbody>{children}</tbody>;
}

Table.Header = Header;
Table.Body = Body;

export default Table;
