import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import styles from "./CabinsPage.module.css";
import CabinTable from "../features/cabins/CabinTable.jsx";
import CreateCabinForm from "../features/cabins/CreateCabinForm.jsx";
import Modal from "../ui/Modal.jsx";
import FeaturesHeader from "../ui/FeaturesHeader.jsx";
import Spinner from "../ui/Spinner.jsx";
import useCabins from "../features/cabins/useCabins.js";
import { cabinFilterOptions, cabinSortOptions } from "../features/cabins/cabinOptions.js";
import { useIsAdmin } from "../auth/useIsAdmin.js";

export function CabinsPage() {
    const [filter, setFilter] = useState("all");
    const [sortBy, setSortBy] = useState("name-asc");
    const { data: cabins = [], isLoading, error } = useCabins();
    const isAdmin = useIsAdmin();

    useEffect(() => {
        if (error) toast.error(error.message);
    }, [error]);

    const cabinFeatures = [
        ...cabinFilterOptions.map((option) => ({
            type: "button",
            title: option.label,
            value: option.value,
            active: filter === option.value,
            onClick: () => setFilter(option.value),
        })),
        {
            type: "select",
            title: "",
            active: true,
            value: sortBy,
            onChange: (event) => setSortBy(event.target.value),
            options: cabinSortOptions,
        },
    ];

    return (
        <div className={styles.page}>
            <FeaturesHeader 
            title="All Cabins" 
            buttonList={cabinFeatures} />
            
            {isLoading ? <Spinner label="Loading cabins" /> : null}
            {error ? <p>{error.message}</p> : null}
            {!isLoading && !error ? (
                <CabinTable
                    cabins={cabins}
                    filter={filter}
                    key={`${filter}-${sortBy}`}
                    sortBy={sortBy}
                />
            ) : null}
            <Modal>
            <Modal.Open name="createCabin">
            <button
                className={styles.addButton}
                disabled={!isAdmin}
                title={!isAdmin ? "Only admins can create cabins." : undefined}
                type="button"
            >
                Add Cabin
            </button>
            </Modal.Open>
            <Modal.Window name="createCabin">
                <CreateCabinForm />
            </Modal.Window>
            </Modal>
              
        </div>
    );
}  
