import { createContext, useContext, useState, useRef, useEffect } from "react";
import styles from "./Menus.module.css";
import { HiEllipsisVertical } from "react-icons/hi2";
import { createPortal } from "react-dom";

const MenusContext = createContext();

export default function Menus({ children }) {
    const [openId, setOpenId] = useState("");
    const [anchor, setAnchor] = useState(null);
    const close = () => {
        setOpenId("");
        setAnchor(null);
    };
    const open = (id, rect) => {
        setOpenId(id);
        setAnchor(rect ?? null);
    };

    return (
        <MenusContext.Provider value={{ openId, close, open, anchor }}>
            {children}
        </MenusContext.Provider>
    );
}


function Toggle({ id, children }) {
    const { open, close, openId } = useContext(MenusContext);
    const ref = useRef(null);

    function handleClick() {
        const node = ref.current;
        const rect = node?.getBoundingClientRect();
        if (openId !== id || openId === "") open(id, rect ? { top: rect.bottom, left: rect.left } : null);
        else close();
    }

    return (
        <div className={styles.menu} ref={ref}>
            <button className={styles.toggle} onClick={handleClick}>
                <HiEllipsisVertical />
            </button>
            {children}
        </div>
    );
}

function List({ id, children }) {
    const { openId, anchor } = useContext(MenusContext);
    const [pos, setPos] = useState(null);
    const ulRef = useRef(null);

  

    useEffect(() => {
        const node = ulRef.current;
        if (!node) return;

        const rect = node.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        let top = anchor?.top ?? 0;
        let left = anchor?.left ?? 0;

        // If menu would overflow bottom, flip above the anchor
        if (top + rect.height > vh - 8) {
            top = (anchor?.top ?? 0) - rect.height - 8;
            if (top < 8) top = 8;
        }

        // If menu would overflow right, shift left
        if (left + rect.width > vw - 8) {
            left = Math.max(8, vw - rect.width - 8);
        }

        setPos({ top, left });
    }, [anchor, openId, children]);

      if (openId !== id || openId === "") return null;

    const style = pos ? { position: "fixed", top: `${pos.top}px`, left: `${pos.left}px` } : { position: "fixed", visibility: "hidden" };

    return createPortal(
        <ul ref={ulRef} className={styles.list} style={style}>
            {children}
        </ul>,
        document.body
    );
}

function Button({ children, icon, onClick, disabled = false, title }) {
    const {close} = useContext(MenusContext);
    function handleClick(){
        if (disabled) return;
        onClick?.();
        close();
    }
    return (
        <li>
            <button
                className={styles.button}
                disabled={disabled}
                onClick={handleClick}
                title={title}
                type="button"
            >
                <span className={styles.icon}>{icon}</span>
                {children}
            </button>
        </li>
    );
}

Menus.Toggle = Toggle;
Menus.List = List;
Menus.Button = Button;

