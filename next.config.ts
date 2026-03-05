import type { NextConfig } from "next";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pkg = require("./package.json");

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['better-sqlite3'],
  env: {
    NEXT_PUBLIC_APP_VERSION: pkg.version,
  },
  experimental: {
    turbo: {
      resolveAlias: {
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        buffer: false,
        util: false,
        os: false,
      },
    },
  },
};

export default nextConfig;
