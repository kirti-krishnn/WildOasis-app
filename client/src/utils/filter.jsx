export function filterList(list = [], selectedOption, options = []) {
  const option = options.find((currentOption) => currentOption.value === selectedOption);

  if (!option?.filter) return list;

  return list.filter(option.filter);
}
