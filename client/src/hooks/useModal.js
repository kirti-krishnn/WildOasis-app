import { useState } from "react";

export function useModal() {
  const [openName, setOpenName] = useState("");

  const open = (name) => setOpenName(name);
  const close = () => setOpenName("");
  const isOpen = (name) => openName === name;

  return { openName, open, close, isOpen };
}
