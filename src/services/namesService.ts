import { ref, computed } from "vue";

interface Name {
  id: number;
  title: string;
  completed: boolean;
  editing: boolean;
}

export class NamesService {
  private names = ref<Name[]>([]);
  private currentPage = ref<number>(1);
  private itemsPerPage = ref<number>(10);
  private showModal = ref<boolean>(false);
  private searchQuery = ref<string>("");
  private filteringService: any;

  constructor() {
    // Initialize or load data from storage
    this.loadNames();
  }

  // Computed properties
  get perPageOptions() {
    return computed(() => [10, 20, 50]);
  }

  get filteredNames() {
    return computed(() =>
      this.filteringService.filterNames(
        this.names.value,
        this.searchQuery.value
      )
    );
  }

  get incompleteCount() {
    return computed(() =>
      this.filteringService.getIncompleteCount(this.names.value)
    );
  }

  get completeCount() {
    return computed(() =>
      this.filteringService.getCompleteCount(this.names.value)
    );
  }

  get totalPages() {
    return computed(() =>
      Math.ceil(this.filteredNames.value.length / this.itemsPerPage.value)
    );
  }

  // Methods
  loadNames() {
    const storedNames = localStorage.getItem("names");
    this.names.value = storedNames ? JSON.parse(storedNames) : [];
  }

  saveNames() {
    const serializableNames = this.names.value.map(
      ({ id, title, completed }) => ({
        id,
        title,
        completed,
      })
    );
    localStorage.setItem("names", JSON.stringify(serializableNames));
  }

  saveChanges(index: number, newTitle: string) {
    const name = this.names.value[index];
    name.title = newTitle;
    name.editing = false;
    this.saveNames();
  }

  addName(newName: string) {
    if (newName.trim()) {
      const existingName = this.names.value.some(
        (name) => name.title.toLowerCase() === newName.trim().toLowerCase()
      );
      if (!existingName) {
        this.names.value.unshift({
          id: Date.now(),
          title: newName,
          completed: false,
          editing: false,
        });
        this.saveNames();
      } else {
        alert(`Name "${newName}" already exists.`);
      }
    }
  }

  checkDuplicate(newTitle: string): boolean {
    return this.names.value.some(
      (name) => name.title.toLowerCase() === newTitle.trim().toLowerCase()
    );
  }

  clearDone() {
    this.names.value = this.names.value.filter((name) => !name.completed);
    this.saveNames();
    this.currentPage.value = 1;
    this.savePaginationSettings();
    this.showModal.value = false;
  }

  clearAll() {
    this.names.value = [];
    this.saveNames();
    this.currentPage.value = 1;
    this.savePaginationSettings();
  }

  completeName(name: Name) {
    name.completed = true; // Example logic for completing a name
    this.saveNames();
  }

  removeName(index: number) {
    this.names.value.splice(index, 1);

    // Adjust pagination if necessary
    if (this.filteredNames.value.length === 0 && this.currentPage.value > 1) {
      this.currentPage.value = 1;
    }

    this.savePaginationSettings();
    this.saveNames();
  }

  goToPage(page: number) {
    this.currentPage.value = page;
    this.savePaginationSettings();
  }

  saveItemsPerPage(itemsPerPage: number) {
    this.currentPage.value = 1;
    this.itemsPerPage.value = itemsPerPage;
    this.savePaginationSettings();
  }

  savePaginationSettings() {
    localStorage.setItem(
      "paginationSettings",
      JSON.stringify({
        currentPage: this.currentPage.value,
        itemsPerPage: this.itemsPerPage.value,
      })
    );
  }

  handleConfirm() {
    this.clearAll();
    this.showModal.value = false;
  }
}
