import {
  defineConfig,
  minimal2023Preset,
} from "@vite-pwa/assets-generator/config";

export default defineConfig({
  headLinkOptions: {
    preset: "2023",
  },
  preset: {
    ...minimal2023Preset,
    transparent: {
      sizes: [64, 192, 512],
      favicons: [[48, "favicon.ico"]],
      padding: 0.05,
    },
    maskable: {
      sizes: [512],
      padding: 0.3,
    },
    apple: {
      sizes: [180],
      padding: 0.05,
    },
  },
});
