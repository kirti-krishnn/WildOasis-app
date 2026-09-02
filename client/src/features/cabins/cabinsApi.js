import {request} from "../../api.js";

export const cabinsApi = {
    
    getAllCabins: () => request("/cabins"),

    getCabinById: (id) => request(`/cabins/${id}`),

    createCabin: (payload) => 
        request("/cabins", {
        method: "POST",
        body: 
        payload instanceof FormData 
        ? payload 
        : JSON.stringify(payload),   
    }),

    updateCabin: (id, payload) => 
        request(`/cabins/${id}`, {
        method: "PATCH",
        body: 
        payload instanceof FormData 
        ? payload 
        : JSON.stringify(payload),
    }),

    deleteCabin: (id) => 
        request(`/cabins/${id}`, {
        method: "DELETE",
    }),
}; 