<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  watch,
  nextTick,
} from "vue";
import type { Folder } from "../types/folder";
import { useRename } from "../composables/useRename";
import { useCreateFolder } from "../composables/useCreateFolder";
import FolderTree from "./FolderTree.vue"; // for recursion
import { useDeleteFolder } from "../composables/useDeleteFolder";

const props = defineProps<{
  folder: Folder;
  selectedId: number | null;
  isRoot?: boolean;
}>();

const emit = defineEmits<{
  (e: "select", folder: Folder): void;
}>();

const isOpen = ref(false);
const hasChildren = computed(
  () => props.folder.children && props.folder.children.length > 0,
);

const { editingId, editName, startRename, submitRename } = useRename();
const { createFolder } = useCreateFolder();
const { deleteFolder } = useDeleteFolder();

const newlyCreatedId = ref<number | null>(null);

function toggleOpen() {
  if (hasChildren.value) isOpen.value = !isOpen.value;
}

function toggleSelect() {
  emit("select", props.folder);
}

function emitSelect(folder: Folder) {
  emit("select", folder);
}

const contextMenu = ref({ visible: false, x: 0, y: 0 });

function openContextMenu(e: MouseEvent) {
  e.preventDefault();
  contextMenu.value = {
    visible: true,
    x: e.clientX,
    y: e.clientY,
  };
}

function closeContextMenu() {
  contextMenu.value.visible = false;
}

async function handleCreateSubfolder() {
  const newFolder = await createFolder(props.folder);
  if (newFolder) {
    newlyCreatedId.value = newFolder.id;
    isOpen.value = true;

    await nextTick();
    editName.value = newFolder.name;
    startRename(newFolder);
  }
  closeContextMenu();
}

async function handleDeleteFolder() {
  await deleteFolder(props.folder);
  closeContextMenu();
}

watch(
  () => props.folder.id,
  (id) => {
    if (id === newlyCreatedId.value) {
      startRename(props.folder);
      newlyCreatedId.value = null;
    }
  },
);

onMounted(() => {
  window.addEventListener("click", closeContextMenu);
});

onBeforeUnmount(() => {
  window.removeEventListener("click", closeContextMenu);
});
</script>

<template>
  <div class="ml-2">
    <!-- Folder Item -->
    <div
      class="flex items-center gap-1 cursor-pointer select-none py-0.5 px-1 hover:bg-gray-100 rounded"
      :class="{ 'bg-blue-100': props.folder.id === selectedId }"
      @click.stop="toggleSelect"
      @contextmenu.prevent="openContextMenu"
    >
      <span
        v-if="hasChildren"
        class="w-4 text-gray-600"
        @click.stop="toggleOpen"
      >
        {{ isOpen ? "v" : ">" }}
      </span>
      <span v-else class="w-4"></span>
      <img src="../assets/folder.png" alt="" class="w-4" />

      <span v-if="editingId !== props.folder.id" class="truncate">
        {{ props.folder.name }}
      </span>
      <input
        v-else
        v-model="editName"
        @blur="submitRename(props.folder)"
        @keyup.enter="submitRename(props.folder)"
        class="text-xs border px-1 py-0.5 rounded w-full"
        autofocus
      />
    </div>

    <!-- Recursive Children -->
    <div v-if="isOpen" class="ml-4">
      <FolderTree
        v-for="child in props.folder.children"
        :key="child.id"
        :folder="child"
        :selected-id="selectedId"
        @select="emitSelect"
      />
    </div>

    <!-- Context Menu -->
    <div
      v-if="contextMenu.visible"
      :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
      class="fixed z-50 bg-white border rounded shadow text-sm w-40"
    >
      <ul>
        <li
          class="px-3 py-2 hover:bg-gray-100 cursor-pointer"
          @click="
            () => {
              startRename(props.folder);
              closeContextMenu();
            }
          "
        >
          ✏️ Rename
        </li>
        <li
          class="px-3 py-2 hover:bg-gray-100 cursor-pointer"
          @click="handleCreateSubfolder"
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
  </div>
</template>
