/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.ts";
const buildId = crypto.randomUUID();
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactCompiler: true,
  experimental: {
    ppr: true,
    typedEnv: true,
    browserDebugInfoInTerminal: true,
    turbopackPersistentCachingForDev: true,
    turbopackPersistentCachingForBuild: true,
  },
  generateBuildId: () => {
    return buildId;
  },
  env: {
    NEXT_PUBLIC_BUILD_ID: buildId,
  },
};

export default nextConfig;
