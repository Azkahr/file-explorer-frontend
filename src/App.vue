<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import FolderTree from "./components/FolderTree.vue";
import { useExplorer } from "./composables/useExplorer";
import type { Folder } from "./types/folder";
import { searchFolders } from "./services/explorer";
import { useRename } from "./composables/useRename";
import { useCreateFolder } from "./composables/useCreateFolder";
import { useDeleteFolder } from "./composables/useDeleteFolder";

const { folders, loading } = useExplorer();
const selectedFolder = ref<Folder | null>(null);
const searchQuery = ref("");
const searchResults = ref<Folder[]>([]);
const isSearching = ref(false);

const { editingId, editName, startRename, submitRename } = useRename();
const { createFolder } = useCreateFolder();
const { deleteFolder } = useDeleteFolder();

const contextFolder = ref<Folder | null>(null);
const contextMenu = ref({ visible: false, x: 0, y: 0 });

function selectFolder(folder: Folder) {
  selectedFolder.value = folder;
}

async function handleCreateRootFolder() {
  const folder = await createFolder(null);
  if (folder) {
    selectedFolder.value = folder;
    startRename(folder);
  }
}

async function createNewFolder() {
  const parent = contextFolder.value ?? null;
  const folder = await createFolder(parent);
  if (folder) {
    selectedFolder.value = folder;
    startRename(folder);
  }
  closeContextMenu();
}

function handleRename() {
  if (contextFolder.value) {
    startRename(contextFolder.value);
  }
}

async function handleDeleteFolder() {
  console.log("deleteing folder:", contextFolder.value);

  if (contextFolder.value) {
    await deleteFolder(contextFolder.value);
    contextFolder.value = null;
    selectedFolder.value = null;
    closeContextMenu();
  }
}

function openContextMenu(e: MouseEvent, folder: Folder) {
  e.preventDefault();
  contextFolder.value = folder;
  contextMenu.value = {
    visible: true,
    x: e.clientX,
    y: e.clientY,
  };
}

function closeContextMenu() {
  contextMenu.value.visible = false;
}

onMounted(() => {
  window.addEventListener("click", closeContextMenu);
});

watch(searchQuery, async (query) => {
  if (!query.trim()) {
    isSearching.value = false;
    searchResults.value = [];
    return;
  }

  isSearching.value = true;
  try {
    const result = await searchFolders(query);
    searchResults.value = result;
  } catch (err) {
    console.error("Search error:", err);
  }
});
</script>

<template>
  <div class="h-screen flex font-sans">
    <!-- Sidebar -->
    <aside
      class="w-64 bg-white border-r border-gray-200 overflow-y-auto p-3 text-sm"
    >
      <h1 class="text-3xl mb-3 font-bold">File Explorer</h1>
      <div v-if="loading">Loading folders...</div>
      <div v-else>
        <button
          @click="handleCreateRootFolder"
          class="mb-3 px-2 py-1 text-xs border border-gray-300 rounded bg-gray-100 hover:bg-gray-200 w-full text-left"
        >
          📁 + New Folder
        </button>
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search folders..."
          class="mb-4 w-full px-2 py-1 border border-gray-300 rounded text-sm"
        />
        <FolderTree
          v-for="root in folders"
          :key="root.id"
          :folder="root"
          :selected-id="selectedFolder?.id ?? null"
          @select="selectFolder"
        />
      </div>
    </aside>

    <!-- Right Panel -->
    <main class="flex-1 p-6 bg-gray-50 overflow-y-auto">
      <div v-if="isSearching">
        <h1 class="text-xl font-bold mb-4">Search Results</h1>
        <div v-if="searchResults.length > 0" class="grid grid-cols-4 gap-4">
          <div
            v-for="folder in searchResults"
            :key="folder.id"
            class="flex flex-col items-center gap-1 p-2 w-24 hover:bg-gray-100 rounded-lg cursor-pointer"
            @contextmenu="openContextMenu($event, folder)"
          >
            <div class="w-10 h-10">
              <img src="./assets/folder.png" alt="" />
            </div>
            <span
              v-if="editingId !== folder.id"
              class="text-sm text-center truncate"
            >
              {{ folder.name }}
            </span>
            <input
              v-else
              v-model="editName"
              @blur="submitRename(folder)"
              @keyup.enter="submitRename(folder)"
              class="text-sm text-center border px-1 py-0.5 rounded w-full"
              autofocus
            />
          </div>
        </div>
        <div v-else class="text-gray-400 italic">No folders found</div>
      </div>

      <div v-else-if="!selectedFolder" class="text-gray-400 italic">
        Select a folder from the left to view contents.
      </div>

      <div v-else>
        <h1 class="text-xl font-bold mb-4">{{ selectedFolder.name }}</h1>
        <div class="grid grid-cols-4 gap-4">
          <div
            v-for="folder in selectedFolder?.children ?? []"
            :key="folder.id"
            class="flex flex-col items-center gap-1 p-2 w-24 hover:bg-gray-100 rounded-lg cursor-pointer group"
            @contextmenu="openContextMenu($event, folder)"
          >
            <div class="w-10 h-10">
              <img src="./assets/folder.png" alt="" />
            </div>
            <span
              v-if="editingId !== folder.id"
              class="text-sm text-center truncate"
            >
              {{ folder.name }}
            </span>
            <input
              v-else
              v-model="editName"
              @blur="submitRename(folder)"
              @keyup.enter="submitRename(folder)"
              class="text-sm text-center border px-1 py-0.5 rounded w-full"
              autofocus
            />
          </div>
        </div>
      </div>
    </main>
  </div>

  <!-- Context Menu -->
  <div
    v-if="contextMenu.visible"
    :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
    class="fixed z-50 bg-white border rounded shadow text-sm w-40"
  >
    <ul>
      <li
        @click="handleRename()"
        class="px-3 py-2 hover:bg-gray-100 cursor-pointer"
      >
        ✏️ Rename
      </li>
      <li
        @click="createNewFolder"
        class="px-3 py-2 hover:bg-gray-100 cursor-pointer"
      >
        📁 New Folder
      </li>
      <li
        @click="handleDeleteFolder"
        class="px-3 py-2 hover:bg-gray-100 text-red-500 cursor-pointer"
      >
        🗑 Delete
      </li>
    </ul>
  </div>
</template>
