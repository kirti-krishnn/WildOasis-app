import Form from "../../ui/Form";
import FormRow from "../../ui/FormRow";
import styles from "./CreateCabinForm.module.css";
import rowStyles from "../../ui/FormRow.module.css";
import useCreateCabin from "./useCreateCabin.js";
import useEditCabin from "./useEditCabin.js";
import { useForm } from "react-hook-form";

export default function CreateCabinForm({ onClose = () => {}, cabinToEdit = {} }) {

  const { mutate: createCabin } = useCreateCabin();
  const { mutate: editCabin } = useEditCabin();

  // Extract ID properly - handle both id and _id
  const cabinId = cabinToEdit?._id || cabinToEdit?.id;
  const isEditMode = Boolean(cabinId);
  
  // Extract all fields except the ID fields
  const { _id, ...editValues } = cabinToEdit;
  
   const {register, handleSubmit ,reset,getValues, formState: { errors } } = useForm(
    {
      defaultValues: isEditMode ? editValues : {}
    }
  );

    const onSubmit = handleSubmit((data) => {
    // normalize image: could be a string (existing path) or FileList from input
    let imageToUse = data.image;
    
    // If in edit mode and no new image provided, use the existing image
    if (isEditMode && !data.image) {
      imageToUse = cabinToEdit.image;
    }
    
    const imageFile = typeof imageToUse === "string" ? imageToUse : imageToUse?.[0];

    // build payload: if we have a File, send FormData so multer handles upload
    let payload;
    if (imageFile instanceof File) {
      const fd = new FormData();
      fd.append("name", data.name);
      fd.append("maxCapacity", data.maxCapacity);
      fd.append("regularPrice", data.regularPrice);
      fd.append("discount", data.discount);
      fd.append("description", data.description);
      fd.append("image", imageFile);
      payload = fd;
    } else {
      payload = { 
        name: data.name,
        maxCapacity: data.maxCapacity,
        regularPrice: data.regularPrice,
        discount: data.discount,
        description: data.description,
        image: imageFile
      };
    }

    if (isEditMode) {
      editCabin({ id: cabinId, payload });
    } else {
      createCabin(payload);
    }
    reset();
    onClose();
    
  });

  return (
    <Form type="modal" onSubmit={onSubmit}> 
      <FormRow name="Cabin Name">
         <div className={rowStyles.inputWithError}>
        <input type="text" name="name" placeholder="Cabin Name" 
        {...register("name", { required: "Cabin name is required" })} />
        {errors?.name?.message ? <span className={rowStyles.error}>{errors.name.message}</span> : null}
        </div>
      </FormRow>
      <FormRow name="Maximum Capacity">
         <div className={rowStyles.inputWithError}>          
        <input type="number" name="maxCapacity" placeholder="Maximum Capacity" 
        {...register("maxCapacity", { required: "Maximum capacity is required", min: 1, valueAsNumber: true })} />
        {errors?.maxCapacity?.message ? <span className={rowStyles.error}>{errors.maxCapacity.message}</span> : null}
        </div>
      </FormRow>
      <FormRow name="Regular Price">
         <div className={rowStyles.inputWithError}>
        <input type="number" name="regularPrice" placeholder="Regular Price" 
        {...register("regularPrice", { required: "Regular price is required", min: 0, valueAsNumber: true })} />
        {errors?.regularPrice?.message ? <span className={rowStyles.error}>{errors.regularPrice.message}</span> : null}
        </div>
      </FormRow>
      <FormRow name="Discount">
        <div className={rowStyles.inputWithError}>
        <input type="number" name="discount" placeholder="Discount" 
        {...register("discount", { required: "Discount is required", min: 0, valueAsNumber: true,
         validate: (value) => value <= getValues("regularPrice") || "Discount must be a positive number" })} />
        {errors?.discount?.message ? <span className={rowStyles.error}>{errors.discount.message}</span> : null}
        </div>
      </FormRow>
      <FormRow name="Description for Website">
         <div className={rowStyles.inputWithError}>
       <textarea
        name="description"
        rows="4"
        placeholder="Description for Website"
        {...register("description", { required: "Description is required" })} />
        {errors?.description?.message ? <span className={rowStyles.error}>{errors.description.message}</span> : null}
        </div>
  </FormRow>
      <FormRow name="Cabin Photo">
         <div className={rowStyles.inputWithError}>
        {isEditMode && cabinToEdit.image && (
          <div className={rowStyles.currentImage}>
            <img src={cabinToEdit.image} alt={cabinToEdit.name} style={{maxWidth: "100px", marginBottom: "10px"}} />
            <p style={{fontSize: "0.875rem", color: "#9ca3af"}}>Current image</p>
          </div>
        )}
        <input type="file" name="image" placeholder="Cabin Photo" 
        {...register("image", { required: isEditMode ? false : "Cabin photo is required" })} />
        {errors?.image?.message ? <span className={rowStyles.error}>{errors.image.message}</span> : null}
        </div>
      </FormRow>      
   
   <div className={styles.actions}>
  <button type="reset" className={styles.cancelButton} onClick={onClose}
  {...register("cancel")}>
    Cancel
  </button>

  <button type="submit" className={styles.submitButton}
  { ...register("submit")}>
    {isEditMode ? "Edit cabin" : "Create new cabin"}
  </button>
</div>
     </Form>
  );
}
