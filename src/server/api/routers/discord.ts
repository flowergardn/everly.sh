import { clerkClient } from "@clerk/nextjs/server";
import type { AxiosError } from "axios";
import axios from "axios";
import { createTRPCRouter, customerProcedure } from "~/server/api/trpc";

import { calculate } from "discord-permission";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { ChannelType } from "discord-api-types/v10";
import type { APIChannel, APIGuild, APIUser } from "discord-api-types/v10";

export interface AllGuildsResponse {
  data: APIGuild[];
}

export interface AllChannelsResponse {
  data: APIChannel[];
}

export const discordRouter = createTRPCRouter({
  getServers: customerProcedure.query(async ({ ctx }) => {
    const userTokens = (
      await clerkClient.users.getUserOauthAccessToken(
        ctx.userId,
        "oauth_discord"
      )
    ).shift();

    if (!userTokens) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        cause: "Failed to fetch token from Clerk.",
      });
    }

    const { data: guildResponse }: AllGuildsResponse = await axios.get(
      `https://discord.com/api/users/@me/guilds`,
      {
        headers: {
          Authorization: `Bearer ${userTokens.token}`,
        },
      }
    );

    return guildResponse.filter((g) => {
      const permissions = parseInt(g.permissions ?? "0");
      return calculate("MANAGE_GUILD", permissions);
    });
  }),
  getChannels: customerProcedure
    .input(
      z.object({
        botToken: z.string(),
        serverId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { data: channelResponse }: AllChannelsResponse = await axios.get(
        `https://discord.com/api/guilds/${input.serverId}/channels`,
        {
          headers: {
            Authorization: `Bot ${input.botToken}`,
          },
        }
      );

      return channelResponse.filter(
        (c) =>
          c.type === ChannelType.GuildAnnouncement ||
          c.type === ChannelType.GuildText
      );
    }),
  generateInvite: customerProcedure
    .input(
      z.object({
        botToken: z.string(),
        serverId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      let resp: {
        data: APIUser;
      };

      try {
        resp = await axios.get(`https://discord.com/api/users/@me`, {
          headers: {
            Authorization: `Bot ${input.botToken}`,
          },
        });
      } catch (err) {
        console.log(err);
        throw new TRPCError({
          code: "BAD_REQUEST",
          cause: "Invalid bot token",
        });
      }

      return {
        invite: `https://discord.com/api/oauth2/authorize?client_id=${resp.data.id}&permissions=&scope=bot%20applications.commands&guild_id=${input.serverId}&disable_guild_select=true`,
      };
    }),
  isInServer: customerProcedure
    .input(
      z.object({
        botToken: z.string(),
        serverId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await axios.get(
          `https://discord.com/api/guilds/${input.serverId}`,
          {
            headers: {
              Authorization: `Bot ${input.botToken}`,
            },
          }
        );

        // Check the status code to determine if the server exists
        const isIn = response.status === 200;

        return {
          success: isIn,
        };
      } catch (error) {
        const err = error as AxiosError;
        // Handle specific errors or use a default value
        if (err.response && err.response.status === 404) {
          return {
            success: false,
          };
        } else {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
          });
        }
      }
    }),
});
