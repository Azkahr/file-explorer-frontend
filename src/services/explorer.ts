import type { Folder } from "../types/folder";
import api from "./axios";

export const getFolders = async (): Promise<Folder[]> => {
  const res = await api.get<Folder[]>("/v1/folders/tree");
  return res.data;
};

export const createFolder = async (payload: {
  name: string;
  parentId: number | null;
}) => {
  const res = await api.post("/v1/folders/create", payload);
  return res.data;
};

export const searchFolders = async (query: string): Promise<Folder[]> => {
  const res = await api.get<{ message: string; data: Folder[] }>(
    `/v1/folders/search/${query}`,
  );
  return res.data.data;
};

export const renameFolder = async (id: number, newName: string) => {
  const res = await api.post("/v1/folders/rename", { id, name: newName });
  return res.data.data;
};

export const deleteFolder = async (id: number) => {
  const res = await api.delete("/v1/folders/delete", {
    data: {
      id: id,
    },
  });
  return res;
};
