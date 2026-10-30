import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Idea Bank — Demo",
    short_name: "Ideas",
    description: "Demo: capture content ideas and the brain dump behind each one. Data stays in your browser.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2F5D3A",
    orientation: "portrait",
    icons: [
      {
        src: "/icon.svg",
        type: "image/svg+xml",
        sizes: "any",
        purpose: "any",
      },
    ],
  };
}
