import { deleteFolder as deleteFolderApi } from "../services/explorer";
import { folders } from "./useExplorer";
import type { Folder } from "../types/folder";

export function useDeleteFolder() {
  const deleteFolder = async (target: Folder) => {
    try {
      await deleteFolderApi(target.id);

      const parentId = target.parentId;
      if (parentId) {
        const parent = findFolderById(folders.value, parentId);
        if (parent?.children) {
          parent.children = parent.children.filter((f) => f.id !== target.id);
        }
      } else {
        folders.value = folders.value.filter((f) => f.id !== target.id);
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return { deleteFolder };
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
