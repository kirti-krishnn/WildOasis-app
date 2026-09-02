export const cabinFilterOptions = [
  {
    label: "All",
    value: "all",
  },
  {
    label: "No Discount",
    value: "no-discount",
    filter: (cabin) => cabin.discount === 0,
  },
  {
    label: "With Discount",
    value: "with-discount",
    filter: (cabin) => cabin.discount > 0,
  },
];

export const cabinSortOptions = [
  {
    label: "Sort by name (A-Z)",
    value: "name-asc",
    sort: (firstCabin, secondCabin) => firstCabin.name.localeCompare(secondCabin.name),
  },
  {
    label: "Sort by name (Z-A)",
    value: "name-desc",
    sort: (firstCabin, secondCabin) => secondCabin.name.localeCompare(firstCabin.name),
  },
  {
    label: "Sort by price (low first)",
    value: "regularPrice-asc",
    sort: (firstCabin, secondCabin) => firstCabin.regularPrice - secondCabin.regularPrice,
  },
  {
    label: "Sort by price (high first)",
    value: "regularPrice-desc",
    sort: (firstCabin, secondCabin) => secondCabin.regularPrice - firstCabin.regularPrice,
  },
  {
    label: "Sort by capacity (low first)",
    value: "maxCapacity-asc",
    sort: (firstCabin, secondCabin) => firstCabin.maxCapacity - secondCabin.maxCapacity,
  },
  {
    label: "Sort by capacity (high first)",
    value: "maxCapacity-desc",
    sort: (firstCabin, secondCabin) => secondCabin.maxCapacity - firstCabin.maxCapacity,
  },
];
