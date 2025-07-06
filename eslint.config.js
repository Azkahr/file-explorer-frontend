import pluginVue from "eslint-plugin-vue";
import globals from "globals";

export default [
  ...pluginVue.configs["flat/recommended"],
  {
    rules: {
      "vue/script-setup-uses-vars": "error",
    },
    languageOptions: {
      sourceType: "module",
      globals: {
        ...globals.browser,
      },
    },
  },
];
