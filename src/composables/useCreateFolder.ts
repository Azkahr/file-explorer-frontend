import { ref } from "vue";
import { createFolder as createFolderApi } from "../services/explorer";
import type { Folder } from "../types/folder";
import { folders } from "./useExplorer";

export function useCreateFolder() {
  const creating = ref(false);

  const createFolder = async (parent: Folder | null = null) => {
    creating.value = true;
    const parentId = parent?.id ?? null;

    try {
      const { data } = await createFolderApi({ name: "Untitled", parentId });

      const newFolder: Folder = { ...data, children: [] };

      if (!parentId) {
        folders.value.push(newFolder);
      } else {
        const parentFolder = findFolderById(folders.value, parentId);
        parentFolder?.children?.push(newFolder);
      }

      return newFolder;
    } catch (err) {
      console.error("Failed to create folder:", err);
      return null;
    } finally {
      creating.value = false;
    }
  };

  return {
    createFolder,
    creating,
  };
}

function findFolderById(tree: Folder[], id: number): Folder | null {
  for (const folder of tree) {
    if (folder.id === id) return folder;
    if (folder.children) {
      const found = findFolderById(folder.children, id);
      if (found) return found;
    }
  }
  return null;
}
