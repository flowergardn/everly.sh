import { createTRPCRouter } from "~/server/api/trpc";
import { discordRouter } from "./routers/discord";
import { instanceRouter } from "./routers/instances";
import { generalRouter } from "./routers/general";
import { adminRouter } from "./routers/admin";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  discord: discordRouter,
  instances: instanceRouter,
  general: generalRouter,
  admin: adminRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
