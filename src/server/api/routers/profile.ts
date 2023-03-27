import { TRPCError } from "@trpc/server";
import { clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";
import { publicProcedure } from "~/server/api/trpc";
import { createTRPCRouter } from "~/server/api/trpc";
import { filterUserForClient } from "~/server/helpers/filterUserForClients";

export const profileRouter = createTRPCRouter({
  getUserByUserName: publicProcedure
    .input(
      z.object({
        username: z.string(),
      })
    )
    .query(async ({ input }) => {
      const [user] = await clerkClient.users.getUserList({
        username: [input.username],
      });

      if (!user)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });

      return filterUserForClient(user);
    }),
});
