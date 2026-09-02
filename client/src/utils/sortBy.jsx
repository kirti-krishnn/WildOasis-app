export function sortByOption(list = [], selectedOption, options = []) {
  const option = options.find((currentOption) => currentOption.value === selectedOption);

  if (!option?.sort) return list;

  return [...list].sort(option.sort);
}
