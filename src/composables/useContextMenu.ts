import { ref } from "vue";

export const currentContext = ref<null | (() => void)>(null);

export function useContextMenu() {
  function registerClose(fn: () => void) {
    if (currentContext.value && currentContext.value !== fn) {
      currentContext.value(); // close existing menu
    }
    currentContext.value = fn;
  }

  function clear() {
    currentContext.value = null;
  }

  return {
    registerClose,
    clear,
  };
}
