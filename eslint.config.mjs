import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

const config = [
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // 現状は <img> で統一している。next/image への移行は見た目の確認を伴う別タスク
      // （docs/agents/workflow.md の「次の一手」参照）。移行したらこの行を削除する。
      "@next/next/no-img-element": "off",
    },
  },
];

export default config;
