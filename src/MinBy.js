export function minBy(list, n, lambda) {
  const mins = [];
  if (list.length < n) {
    return list;
  }

  const mappedValues = list.map(item => { item: item; value: lambda(item) })
  const sortedValues = mappedValues.sort( item1, item2 => {
    if (item1.value < item2.value) return -1;
    if (item2.value < item1.value) return 1;
    return 0;
  })

  return sortedValues.slice(0, n).map(entry => entry.item);
}