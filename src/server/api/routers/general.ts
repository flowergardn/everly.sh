import axios from "axios";
import { createTRPCRouter, privateProcedure, publicProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { clerkClient } from "@clerk/nextjs";

export interface VideoObject {
  id: string;
  isShort: boolean;
  link: string;
  thumbnail: string;
  channel: {
    id: string;
    link: string;
    name: string;
  };
  title: string;
  published: {
    date: string;
    relative: string;
  };
}

export interface VideoAnnouncement extends VideoObject {
  announced: boolean;
}

export const generalRouter = createTRPCRouter({
  getYTVideos: publicProcedure
    .input(
      z.object({
        instanceId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const instance = await ctx.prisma.instance.findFirst({
        where: {
          id: input.instanceId,
        },
      });

      if (!instance) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      const {
        data: videos,
      }: {
        data: {
          latest: VideoObject;
          previous: VideoObject[];
        };
      } = await axios.get(`https://yt.astrid.sh/${instance.accountId}`);

      if (!videos.latest) {
        // Disable automation to prevent this error in the future.
        await ctx.prisma.instance.update({
          where: {
            id: input.instanceId,
          },
          data: {
            automation: false,
          },
        });

        throw new TRPCError({
          code: "BAD_REQUEST",
          cause: "Could not fetch latest video!",
        });
      }

      const videoIds = [
        videos.latest.id,
        ...videos.previous.map((video) => video.id),
      ];

      const announcements = await ctx.prisma.announcements.findMany({
        where: {
          instanceId: input.instanceId,
          videoId: {
            in: videoIds,
          },
        },
      });

      return {
        latest: {
          ...videos.latest,
          announced:
            announcements.find(
              (announcement) => announcement.videoId === videos.latest.id
            )?.announced ?? false,
        },
        previous: videos.previous.map((video) => ({
          ...video,
          announced:
            announcements.find(
              (announcement) => announcement.videoId === video.id
            )?.announced ?? false,
        })),
      };
    }),
  isCustomer: privateProcedure.mutation(async ({ ctx }) => {
    const user = await clerkClient.users.getUser(ctx.userId);
    const discord = user.externalAccounts[0];

    if (!discord) {
      return {
        success: false,
        reason: "No Discord linked.",
      };
    }

    const whitelisted = await ctx.prisma.whitelisted.findFirst({
      where: {
        discordId: discord.externalId,
      },
    });

    if (!whitelisted) {
      return {
        success: false,
        reason: "Not whitelisted",
      };
    }

    await clerkClient.users.updateUserMetadata(ctx.userId, {
      publicMetadata: { customer: true },
    });

    return {
      success: true,
    };
  }),
  userInfo: privateProcedure.query(async ({ ctx }) => {
    const user = await clerkClient.users.getUser(ctx.userId);
    const meta = user.publicMetadata;

    const isCustomer = meta.customer as boolean;
    const instanceLimit = meta.instanceCount as number;

    return {
      customer: isCustomer,
      instanceCount: instanceLimit,
    };
  }),
});
