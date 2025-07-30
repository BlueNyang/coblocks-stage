import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import dts from "rollup-plugin-dts";
import alias from "@rollup/plugin-alias";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  input: "src/index.ts",
  cache: cache,
  output: [
    {
      file: "dist/index.js",
      format: "cjs",
      sourcemap: true,
      exports: "named",
    },
    {
      file: "dist/index.esm.js",
      format: "esm",
      sourcemap: true,
    },
  ],
  plugins: [
    alias({
      entries: [{ find: "@", replacement: path.resolve(__dirname, "src") }],
    }),
    resolve({
      browser: true,
      preferBuiltins: false,
    }),
    commonjs(),
    peerDepsExternal(), // React를 external로 처리
    typescript({
      tsconfig: "./tsconfig.json",
      declaration: false, // tsc로 따로 생성
      declarationMap: false,
      outputToFilesystem: true,
    }),
  ],
  external: ["@coblocks-stage/core", "react", "react-dom"],
};
