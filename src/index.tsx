import { serve } from "bun";
import index from "./index.html";

const server = serve({
  routes: {
    // All routes served by the React SPA — client-side routing handles the rest
    "/*": index,
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`EventFlow frontend running at ${server.url}`);
