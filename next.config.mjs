import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ada lockfile lain di folder induk (C:\Users\PC), jadi root proyek dikunci ke folder ini.
  turbopack: { root: dir },
};

export default nextConfig;
