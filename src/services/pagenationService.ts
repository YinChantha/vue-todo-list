const PAGINATION_STORAGE_KEY = "paginationSettings";

export interface PaginationSettings {
  currentPage: number;
  itemsPerPage: number;
}

export const loadPaginationSettings = () => {
  try {
    const settings = localStorage.getItem(PAGINATION_STORAGE_KEY);
    return settings
      ? JSON.parse(settings)
      : { currentPage: 1, itemsPerPage: 5 };
  } catch (error) {
    console.error("Error parsing pagination settings:", error);
    return { currentPage: 1, itemsPerPage: 5 };
  }
};

export const savePaginationSettings = (settings: any) => {
  try {
    localStorage.setItem(PAGINATION_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Error saving pagination settings:", error);
  }
};

export const getPerPageOptions = () => {
  return [5, 10, 20, 50];
};
