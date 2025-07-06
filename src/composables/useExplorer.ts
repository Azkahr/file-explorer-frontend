import { onMounted, ref } from "vue";
import { getFolders } from "../services/explorer";
import type { Folder } from "../types/folder";

export const folders = ref<Folder[]>([]);
const loading = ref(false);

export function useExplorer() {
  const fetchFolders = async () => {
    loading.value = true;
    try {
      folders.value = await getFolders();
    } catch (err) {
      console.error("Fetch error: ", err);
    } finally {
      loading.value = false;
    }
  };

  onMounted(fetchFolders);

  return {
    folders,
    loading,
    fetchFolders,
  };
}
