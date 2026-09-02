export const bookingFilterOptions = [
  {
    label: "All",
    value: "all",
  },
  {
    label: "Checked out",
    value: "checked-out",
    filter: (booking) => booking.status === "checked-out",
  },
  {
    label: "Checked in",
    value: "checked-in",
    filter: (booking) => booking.status === "checked-in",
  },
  {
    label: "Unconfirmed",
    value: "unconfirmed",
    filter: (booking) => booking.status === "unconfirmed",
  },
];

export const bookingSortOptions = [
  {
    label: "Sort by date (recent first)",
    value: "-startDate",
  },
  {
    label: "Sort by date (earlier first)",
    value: "startDate",
  },
  {
    label: "Sort by amount (high first)",
    value: "-totalPrice",
  },
  {
    label: "Sort by amount (low first)",
    value: "totalPrice",
  },
];
