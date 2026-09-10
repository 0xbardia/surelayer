import type { MetadataRoute } from "next";
import { appConfig, requirePublicOrigin } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  const publicOrigin = requirePublicOrigin(appConfig());
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${publicOrigin}/sitemap.xml`,
  };
}
