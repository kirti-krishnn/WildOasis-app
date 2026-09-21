import styles from "./CabinRow.module.css";
import { HiPencil, HiSquare2Stack, HiTrash } from "react-icons/hi2";
import Menus from "../../ui/Menus.jsx";
import { useState } from "react";
import CreateCabinForm from "./CreateCabinForm.jsx";
import { createPortal } from "react-dom";
import { HiXMark } from "react-icons/hi2";
import modalStyles from "../../ui/Modal.module.css";
import useCreateCabin from "./useCreateCabin.js";
import ConfirmDelete from "../../ui/ConfirmDelete.jsx";
import useDeleteCabin from "./useDeleteCabin.js"
import { useIsAdmin } from "../../auth/useIsAdmin.js";
import { getAssetUrl } from "../../api.js";

function getCabinImageSrc(image) {
    return getAssetUrl(image);
}

export default function CabinRow({ cabin }) {
    const [menuId] = useState(() => cabin._id ?? cabin.name ?? Math.random().toString(36).slice(2));
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen,setIsDeleteOpen]=useState(false);
    const {mutate: createCabin} = useCreateCabin();
    const {mutate: deleteCabin} = useDeleteCabin();
    const isAdmin = useIsAdmin();

    const {name,maxCapacity,regularPrice,discount,image,description} =cabin;

    function handleDuplicate(){
        if (!isAdmin) return;
        createCabin({name:`copy of ${name}`, maxCapacity,regularPrice,discount,image,description});
    }

    function handleDeleteCabin(){
        if (!isAdmin) return;
        deleteCabin(cabin._id);
        setIsDeleteOpen(false);
    }

    return (
        <>
            <tr className={styles.row}>
                <td className={styles.imageCell}>
                    <img className={styles.image} src={getCabinImageSrc(cabin.image)} alt={cabin.name} />
                </td>

                <td className={styles.name}>{cabin.name}</td>
                <td className={styles.capacity}>Fits up to {cabin.maxCapacity} guests</td>
                <td className={styles.price}>${cabin.regularPrice}</td>
                <td className={cabin.discount ? styles.discount : styles.noDiscount}>
                    {cabin.discount ? `$${cabin.discount}` : "-"}
                </td>

                <td className={styles.menuCell}>
                <Menus>
                    <Menus.Toggle id={menuId}>
                        <Menus.List id={menuId}>                           
                            <Menus.Button
                                disabled={!isAdmin}
                                icon={<HiSquare2Stack />}
                                onClick={()=>handleDuplicate()}
                                title={!isAdmin ? "Only admins can duplicate cabins." : undefined}
                            >
                                Duplicate
                            </Menus.Button>
                            <Menus.Button 
                                disabled={!isAdmin}
                                icon={<HiPencil/>}
                                onClick={() => setIsEditOpen(true)}
                                title={!isAdmin ? "Only admins can edit cabins." : undefined}
                            >
                                Edit Cabin
                            </Menus.Button>

                            <Menus.Button
                             disabled={!isAdmin}
                             icon={<HiTrash/>}
                             onClick={()=>setIsDeleteOpen(true)}
                             title={!isAdmin ? "Only admins can delete cabins." : undefined}
                             >
                                Delete Cabin
                            </Menus.Button>
                        </Menus.List>
                    </Menus.Toggle>
                </Menus>
                </td>
            </tr>

            {isEditOpen && createPortal(
                <div className={modalStyles.modal}>
                    <div className={modalStyles.modal__backdrop} onClick={() => setIsEditOpen(false)}></div>
                    <div className={modalStyles.modal__window}>
                        <HiXMark 
                            className={modalStyles.closeButton} 
                            onClick={() => setIsEditOpen(false)} 
                        />
                        <CreateCabinForm 
                            cabinToEdit={cabin}
                            onClose={() => setIsEditOpen(false)}
                        />
                    </div>
                </div>, 
                document.body
            )}

             {isDeleteOpen && createPortal(
                <div className={modalStyles.modal}>
                    <div className={modalStyles.modal__backdrop} onClick={() => setIsDeleteOpen(false)}></div>
                    <div className={modalStyles.modal__window}>
                        <HiXMark 
                            className={modalStyles.closeButton} 
                            onClick={() => setIsDeleteOpen(false)} 
                        />
                       
                        <ConfirmDelete
                            resourceName={cabin.name}
                            onConfirm={handleDeleteCabin}
                            onCancel={() => setIsDeleteOpen(false)}  />
                    </div>
                </div>, 
                document.body
            )}
        </>
    );
}
