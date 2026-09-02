/* eslint-disable react-refresh/only-export-components */
import { cloneElement, createContext, useContext } from "react";
import { useState } from "react";
import {createPortal} from "react-dom";
import styles from "./Modal.module.css";
import { HiXMark } from "react-icons/hi2";

export const ModalContext = createContext();

function Modal({children}){
    const [openName, setOpenName] = useState("");

    const openModal = openName => setOpenName(openName);
    const closeModal = () => setOpenName("");
    return (
        <ModalContext.Provider value={{openName, openModal, closeModal}}>
          
            {children}
        </ModalContext.Provider>
    );
};

function Open({name, children}){
    const {openModal} = useContext(ModalContext);
   
    return cloneElement(children, {onClick: () => openModal(name)});
}   

function Window({name, children}){
    const {openName, closeModal} = useContext(ModalContext);
    if(openName !== name) return null;

    return createPortal(
        <div className={styles.modal}>
            <div className={styles.modal__backdrop} onClick={closeModal}></div>
            <div className={styles.modal__window}>
                  <HiXMark className={styles.closeButton} onClick={closeModal} />
                {cloneElement(children, {onClose: closeModal})}
            </div>
        </div>, document.body
    );
    // return 
    
  
}
        

Modal.Open = Open;
Modal.Window = Window;
Modal.ModalContext = ModalContext;
export default Modal;


