/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env";
const buildId = crypto.randomUUID();
import type { NextConfig } from "next";
import { withBotId } from "botid/next/config";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    ppr: true,
  },
  generateBuildId: () => {
    return buildId;
  },
  env: {
    NEXT_PUBLIC_BUILD_ID: buildId,
  },
};

export default withBotId(nextConfig);
