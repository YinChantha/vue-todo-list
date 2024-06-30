export interface Name {
  id: number;
  title: string;
  completed: boolean;
}

export function filterNames(names: Name[], query: string): Name[] {
  if (!query) return names;
  return names.filter((name) =>
    name.title.toLowerCase().includes(query.toLowerCase())
  );
}

export function getIncompleteCount(names: Name[]): number {
  return names.filter((name) => !name.completed).length;
}

export function getCompleteCount(names: Name[]): number {
  return names.filter((name) => name.completed).length;
}
