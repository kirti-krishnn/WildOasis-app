"use client";

import { useState } from "react";
import styles from "./TextExpander.module.css";

function TextExpander({ children }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const text = String(children);
  const displayText = isExpanded
    ? text
    : text.split(" ").slice(0, 40).join(" ") + "...";

  return (
    <span className={styles.text}>
      {displayText}{" "}
      <button
        className={styles.button}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? "Show less" : "Show more"}
      </button>
    </span>
  );
}

export default TextExpander;
