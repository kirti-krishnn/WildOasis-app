import { useEffect } from "react";
import { useForm } from "react-hook-form";
import Form from "../../ui/Form.jsx";
import FormRow from "../../ui/FormRow.jsx";
import Spinner from "../../ui/Spinner.jsx";
import useSettings from "./useSettings.js";
import useUpdateSettings from "./useUpdateSettings.js";
import styles from "./Settings.module.css";
import { useIsAdmin } from "../../auth/useIsAdmin.js";

const fields = [
  {
    name: "minimumNights",
    label: "Minimum nights/booking",
    min: 0,
  },
  {
    name: "maximumNights",
    label: "Maximum nights/booking",
    min: 0,
  },
  {
    name: "maximumGuestsPerBooking",
    label: "Maximum guests/booking",
    min: 1,
  },
  {
    name: "breakfastPrice",
    label: "Breakfast price",
    min: 0,
  },
  {
    name: "lunchPrice",
    label: "Lunch price",
    min: 0,
  },
  {
    name: "dinnerPrice",
    label: "Dinner price",
    min: 0,
  },
];

const defaultSettings = {
  minimumNights: 3,
  maximumNights: 90,
  maximumGuestsPerBooking: 8,
  breakfastPrice: 15,
  lunchPrice: 25,
  dinnerPrice: 35,
};

export default function Settings() {
  const { data: settings, isLoading, isError, error } = useSettings();
  const { mutate: updateSettings, isPending: isUpdating } = useUpdateSettings();
  const isAdmin = useIsAdmin();
  const { register, reset, getValues } = useForm({
    defaultValues: defaultSettings,
  });

  useEffect(() => {
    if (settings) reset(settings);
  }, [settings, reset]);

  const handleUpdate = (field) => {
    const value = getValues(field);

    if (value === "" || Number.isNaN(value)) return;

    if (settings?.[field] === value) return;

    if (isAdmin) updateSettings({ [field]: value });
  };

  return (
    <section className={styles.settings}>
      <h1 className={styles.heading}>Update hotel settings</h1>

      {isLoading ? <Spinner label="Loading settings" /> : null}
      {isError ? <p className={styles.message}>{error.message}</p> : null}

      {!isLoading && !isError ? (
        <Form onSubmit={(event) => event.preventDefault()}>
          {fields.map((field) => (
            <FormRow name={field.label} key={field.name}>
              <input
                id={field.name}
                type="number"
                min={field.min}
                disabled={isUpdating || !isAdmin}
                title={!isAdmin ? "Only admins can update settings." : undefined}
                {...register(field.name, {
                  valueAsNumber: true,
                  onBlur: () => handleUpdate(field.name),
                })}
              />
            </FormRow>
          ))}
        </Form>
      ) : null}
    </section>
  );
}
