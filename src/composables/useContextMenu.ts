import { onBeforeUnmount, onMounted, ref } from "vue";

export function useContextMenu<T = unknown>() {
  const contextTarget = ref<T | null>(null);
  const contextMenu = ref({ visible: false, x: 0, y: 0 });

  function openContextMenu(e: MouseEvent, target: T) {
    e.preventDefault();

    contextTarget.value = target;
    contextMenu.value = {
      visible: true,
      x: e.clientX,
      y: e.clientY,
    };
  }

  function closeContextMenu() {
    contextMenu.value.visible = false;
  }

  onMounted(() => window.addEventListener("click", closeContextMenu));
  onBeforeUnmount(() => window.removeEventListener("click", closeContextMenu));

  return {
    contextTarget,
    contextMenu,
    openContextMenu,
    closeContextMenu,
  };
}
