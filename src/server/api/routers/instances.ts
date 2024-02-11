import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { validateAPIEmbed } from "~/lib/validateEmbed";
import * as yt from "~/lib/scrape";
import { createTRPCRouter, customerProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import { ButtonStyle } from "discord-api-types/payloads/v10";
import * as twitch from "~/lib/twitch";
import { isNonEmptyString } from "~/lib/general";
import type { VideoObject } from "./general";
import axios from "axios";
import { sendYoutubeAnnouncement } from "~/pages/api/check";
import { clerkClient } from "@clerk/nextjs";

interface ButtonComponent {
  type: number;
  components: {
    type: number;
    label: string;
    style: number;
    url: string;
  }[];
}

interface Message {
  content?: string;
  embeds: {
    title?: string;
    description?: string;
    color?: number;
    image?:
      | {
          url: string | undefined;
        }
      | undefined;
  }[];
  components: ButtonComponent[];
}

const updateMsgSchema = z.object({
  buttonLink: z.string().optional(),
  buttonTitle: z.string().optional(),
  embedDesc: z.string().optional(),
  embedImage: z.string().optional(),
  embedTitle: z.string().optional(),
  embedColor: z.string().optional(),
  messageContent: z.string().optional(),
});

export const instanceRouter = createTRPCRouter({
  create: customerProcedure
    .input(
      z.object({
        botToken: z.string(),
        serverId: z.string(),
        channelId: z.string(),
        channel: z.string(),
        instanceType: z.enum(["youtube", "twitch"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userData = await clerkClient.users.getUser(ctx.userId);

      const instanceCount =
        (userData.publicMetadata.instanceCount as number) ?? 3;

      const allInstances = await ctx.prisma.instance.findMany({
        where: {
          managers: {
            contains: ctx.userId,
          },
        },
      });

      if (allInstances.length >= instanceCount) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          cause: `You are currently past your instance limit of ${instanceCount}`,
        });
      }

      const managers = JSON.stringify([ctx.userId]);
      let pfp = "/Everly.png";
      let name = "Unnamed";
      let id;

      const {
        serverId,
        channelId,
        botToken,
        channel,
        instanceType: type,
      } = input;

      switch (type) {
        case "youtube": {
          const scrapeResponse = await yt.scrape(
            /UC[-_0-9A-Za-z]{21}[AQgw]/g,
            channel
          );

          if (!scrapeResponse.success) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              cause: "Error fetching YouTube channel id!",
            });
          }

          const youtubePfp = await yt.getPfp(channel);
          const youtubeName = await yt.getName(channel);

          pfp =
            youtubePfp ||
            "https://avatars.githubusercontent.com/u/45674371?v=4";
          name = youtubeName || "New instance";
          id = scrapeResponse.match;

          if (!id) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              cause: "Error fetching YouTube channel id!",
            });
          }

          break;
        }
        case "twitch": {
          name = channel;
          id = channel;

          const twitchResponse = await twitch.getUser(id);
          const data = twitchResponse.data.data;

          if (!data || data.length === 0) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              cause: "Invalid Twitch username",
            });
          }

          const d = data.shift();

          if (!d) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              cause: "Failed to get Twitch data.",
            });
          }

          pfp = d.profile_image_url;

          break;
        }
      }

      return await ctx.prisma.instance.create({
        data: {
          name,
          managers,
          serverId,
          channelId,
          botToken,
          accountId: id,
          accountPfp: pfp,
          type,
        },
      });
    }),
  get: customerProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.instance.findMany({
      where: {
        managers: {
          contains: ctx.userId,
        },
      },
    });
  }),
  getById: customerProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const instance = await ctx.prisma.instance.findFirst({
        where: {
          managers: {
            contains: ctx.userId,
          },
          id: input.id,
        },
      });

      if (!instance) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      return instance;
    }),
  toggleAutomation: customerProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const instance = await ctx.prisma.instance.findFirst({
        where: {
          managers: {
            contains: ctx.userId,
          },
          id: input.id,
        },
      });

      if (!instance) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      return await prisma.instance.update({
        where: {
          id: input.id,
        },
        data: {
          automation: !instance.automation,
        },
      });
    }),
  getAnnouncements: customerProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.announcements.findMany({
        where: {
          instanceId: input.id,
        },
      });
    }),
  updateMessage: customerProcedure
    .input(
      z.object({
        id: z.string(),
        data: updateMsgSchema.strict(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const instance = await ctx.prisma.instance.findFirst({
        where: {
          managers: {
            contains: ctx.userId,
          },
          id: input.id,
        },
      });

      if (!instance) {
        throw new TRPCError({
          code: "NOT_FOUND",
          cause: "Could not find that instance.",
        });
      }

      const {
        embedTitle,
        embedDesc,
        embedImage,
        embedColor,
        messageContent,
        buttonLink,
        buttonTitle,
      } = input.data;

      const apiMessage: Message = {
        content: isNonEmptyString(messageContent) ? messageContent : undefined,
        embeds: [],
        components: [],
      };

      const hasEmbed = embedTitle || embedDesc || embedImage || !!embedColor;

      if (hasEmbed) {
        const embColor = parseInt(embedColor ?? "0");

        apiMessage.embeds.push({
          title: isNonEmptyString(embedTitle) ? embedTitle : undefined,
          description: isNonEmptyString(embedDesc) ? embedDesc : undefined,
          color: embColor ? embColor : undefined,
          image: isNonEmptyString(embedImage) ? { url: embedImage } : undefined,
        });
      }

      if (buttonTitle && buttonLink) {
        apiMessage.components = [
          {
            type: 1,
            components: [
              {
                type: 2,
                label: buttonTitle,
                style: ButtonStyle.Link,
                url: buttonLink,
              },
            ],
          },
        ];
      }

      const apiMessageStr = JSON.stringify(apiMessage);

      const isValid = validateAPIEmbed(apiMessageStr);

      if (!isValid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          cause: "Invalid APIEmbed.",
        });
      }

      return await ctx.prisma.instance.update({
        where: {
          id: input.id,
        },
        data: {
          announcementMsg: apiMessageStr,
        },
      });
    }),
  announce: customerProcedure
    .input(
      z.object({
        videoId: z.string(),
        instanceId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const instance = await ctx.prisma.instance.findFirst({
        where: {
          managers: {
            contains: ctx.userId,
          },
          id: input.instanceId,
        },
      });

      if (!instance) {
        throw new TRPCError({
          code: "NOT_FOUND",
          cause: "Could not find that instance.",
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

      const allVideos = [videos.latest, ...videos.previous];

      const foundVideo = allVideos
        .filter((v) => v.id === input.videoId)
        .shift();

      if (!foundVideo) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          cause: "Failed to find video!",
        });
      }

      await sendYoutubeAnnouncement(instance, foundVideo);

      return {
        success: true,
      };
    }),
});
