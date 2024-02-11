import { z } from "zod";
import { adminProcedure, createTRPCRouter } from "../trpc";
import { clerkClient } from "@clerk/nextjs";
import { User } from "@clerk/nextjs/dist/types/server";
import { TRPCError } from "@trpc/server";
import type { Announcements, Instance } from "@prisma/client";
import { prisma } from "~/server/db";

interface FilteredUser {
  username: string;
  id: string;
  createdAt: number;
  discordId: string;
  metadata: UserPublicMetadata;
}

interface DetailedInstance {
  id: string;
  message: string;
  type: string;
  automation: boolean;
  accountId: string;
  announcements: Announcements[];
  managers: FilteredUser[];
}

const filterUser = (u: User): FilteredUser => {
  const ext = u.externalAccounts;

  return {
    username: u.username ?? "No username",
    id: u.id,
    createdAt: u.createdAt,
    discordId: ext.shift()?.externalId ?? "000000000",
    metadata: u.publicMetadata,
  };
};

const filterInstance = async (instanceData: Instance) => {
  const announcements = await prisma.announcements.findMany({
    where: {
      instanceId: instanceData.id,
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const managersArr: string[] = JSON.parse(instanceData.managers);

  const instance: DetailedInstance = {
    id: instanceData.id,
    message: instanceData.announcementMsg,
    type: instanceData.type,
    accountId: instanceData.accountId,
    automation: instanceData.automation,
    announcements,
    managers: [],
  };

  //   await Promise.all(
  //     managersArr.map(async (i: string) => {
  //       const user = await clerkClient.users.getUser(i);
  //       instance.managers.push(filterUser(user));
  //     })
  //   );

  return instance;
};

export const adminRouter = createTRPCRouter({
  getUsers: adminProcedure.query(async () => {
    const users = await clerkClient.users.getUserList();

    const filteredUsers = users.map(filterUser);

    return {
      users: filteredUsers,
    };
  }),
  getInstances: adminProcedure.query(async ({ ctx }) => {
    const instances = await ctx.prisma.instance.findMany();

    return {
      count: instances.length,
    };
  }),
  getInstance: adminProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const instanceData = await ctx.prisma.instance.findFirst({
        where: {
          id: input.id,
        },
      });

      if (!instanceData) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      return filterInstance(instanceData);
    }),
  deleteInstance: adminProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const instanceData = await ctx.prisma.instance.findFirst({
        where: {
          id: input.id,
        },
      });

      if (!instanceData) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      await ctx.prisma.announcements.deleteMany({
        where: {
          instanceId: input.id,
        },
      });

      await ctx.prisma.instance.delete({
        where: {
          id: input.id,
        },
      });

      return {
        success: true,
      };
    }),
});
