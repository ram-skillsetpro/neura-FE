export function fetchOlderFilesList<T extends { id: number | string }>(arr1: T[], arr2: T[]): T[] {
  return arr1.filter((o1) => !arr2.some((o2) => o1.id === o2.id));
}
