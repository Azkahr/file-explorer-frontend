import { ref } from "vue";
import { renameFolder } from "../services/explorer";
import type { Folder } from "../types/folder";

const editingId = ref<number | null>(null);
const editName = ref("");

export function useRename() {
  function isEditing(folder: Folder) {
    return editingId.value === folder.id;
  }

  function startRename(folder: Folder) {
    editingId.value = folder.id;
    editName.value = folder.name;
  }

  async function submitRename(folder: Folder) {
    if (!editName.value.trim() || editName.value === folder.name) {
      editingId.value = null;
      return;
    }

    try {
      const updated = await renameFolder(folder.id, editName.value.trim());
      folder.name = updated.name;
    } catch (err) {
      console.error("Rename failed:", err);
    }

    editingId.value = null;
  }

  function cancelRename() {
    editingId.value = null;
  }

  return {
    editingId,
    editName,
    isEditing,
    startRename,
    submitRename,
    cancelRename,
  };
}
