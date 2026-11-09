import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Projects withdrawn from the public portfolio send visitors (and any old
  // links) to the collection instead of a 404. Temporary, so a project can be
  // reinstated later without browsers having cached a permanent redirect.
  async redirects() {
    return ["pink-balloon-circle", "colorful-sequin-backdrop"].map((slug) => ({
      source: `/portfolio/${slug}`,
      destination: "/portfolio",
      permanent: false,
    }));
  },
};

export default nextConfig;
