import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MixDro Editor",
    short_name: "MixDro",
    description: "A personal local-first editor for MixDro social templates.",
    start_url: "/",
    display: "standalone",
    background_color: "#08080d",
    theme_color: "#7c6af7",
    icons: [
      {
        src: "/icon.png",
        sizes: "1024x1024",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icon.png",
        sizes: "1024x1024",
        type: "image/png",
        purpose: "maskable"
      }
    ]
  };
}
