import type { MetadataRoute } from "next";
import { appConfig, requirePublicOrigin } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const publicOrigin = requirePublicOrigin(appConfig());
  return [
    { url: publicOrigin, changeFrequency: "weekly", priority: 1 },
    { url: `${publicOrigin}/claims`, changeFrequency: "hourly", priority: 0.8 },
    { url: `${publicOrigin}/create`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${publicOrigin}/account`, changeFrequency: "monthly", priority: 0.4 },
  ];
}
