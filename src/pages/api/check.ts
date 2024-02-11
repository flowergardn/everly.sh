import type { NextApiRequest, NextApiResponse } from "next";
import { validateAPIEmbed } from "~/lib/validateEmbed";
import { prisma } from "~/server/db";
import type { Instance } from "@prisma/client";
import { createTRPCContext } from "~/server/api/trpc";
import { appRouter } from "~/server/api/root";
import axios from "axios";
import { parseEmbed } from "~/lib/placeholders";
import type APIMessage from "~/interfaces/APIMessage";
import { getUserStream } from "~/lib/twitch";
import type { VideoObject } from "~/server/api/routers/general";
import { isPastDate } from "~/lib/general";
import dayjs from "dayjs";

const sendMsg = async (parsedEmbed: APIMessage, instance: Instance) => {
  try {
    await axios.post(
      `https://discord.com/api/v10/channels/${instance.channelId}/messages`,
      parsedEmbed,
      {
        headers: {
          Authorization: `Bot ${instance.botToken}`,
        },
      }
    );
  } catch (err) {}
};

const sendYoutubeAnnouncement = async (
  instance: Instance,
  video: VideoObject
) => {
  const _embed = JSON.parse(instance.announcementMsg) as APIMessage;

  const parsedEmbed = parseEmbed(
    _embed,
    new Map([
      ["username", video.channel.name],
      ["title", video.title],
      ["link", video.link],
      ["thumbnail", video.thumbnail],
    ])
  );

  const isValid = validateAPIEmbed(JSON.stringify(parsedEmbed));

  if (!isValid) {
    console.log(
      `Announcement message for instance ${instance.id} was invalid.`
    );
    return;
  }

  await sendMsg(parsedEmbed, instance);

  await prisma.announcements.create({
    data: {
      videoId: video.id,
      announced: true,
      instanceId: instance.id,
    },
  });
};

const checkInstances = async (req: NextApiRequest, res: NextApiResponse) => {
  const ctx = createTRPCContext({ req, res });
  const caller = appRouter.createCaller(ctx);

  const instances = await prisma.instance.findMany({
    where: {
      automation: true,
    },
  });

  let announced = 0;

  const checkYouTube = async (instance: Instance) => {
    const videos = await caller.general.getYTVideos({
      instanceId: instance.id,
    });

    const { latest } = videos;

    const { date } = latest.published;

    if (isPastDate(date, dayjs(instance.createdAt).format())) {
      return;
    }

    if (latest.isShort && instance.ignoreShorts) {
      return;
    }

    if (!latest.announced) {
      await sendYoutubeAnnouncement(instance, latest);
      announced++;
    }
  };

  const checkTwitch = async (instance: Instance) => {
    const currentStream = await getUserStream(instance.accountId);
    // Do not do anything if there's a prior stream
    if (!currentStream) return;

    const priorAnnouncement = await prisma.announcements.findFirst({
      where: {
        videoId: currentStream.id,
        AND: {
          instanceId: instance.id,
        },
      },
    });

    // If this exact stream has been announced from this instance, do nothing.
    if (priorAnnouncement) return;

    const thumbnail = currentStream.thumbnail_url
      .replace("{width}", "1280")
      .replace("{height}", "720");

    const _embed = JSON.parse(instance.announcementMsg) as APIMessage;

    const parsedEmbed = parseEmbed(
      _embed,
      new Map([
        ["username", instance.accountId],
        ["title", currentStream.title],
        ["link", `https://twitch.tv/${instance.accountId}`],
        ["thumbnail", thumbnail],
        ["game", currentStream.game_name],
      ])
    );

    const isValid = validateAPIEmbed(JSON.stringify(parsedEmbed));

    if (!isValid) {
      console.log(
        `Announcement message for instance ${instance.id} was invalid.`
      );
      return;
    }

    await sendMsg(parsedEmbed, instance);

    announced++;

    await prisma.announcements.create({
      data: {
        videoId: currentStream.id,
        announced: true,
        instanceId: instance.id,
      },
    });
  };

  const processEach = async (i: Instance) => {
    switch (i.type) {
      case "youtube": {
        await checkYouTube(i);
        break;
      }
      case "twitch": {
        await checkTwitch(i);
        break;
      }
      default:
        console.log(`${i.type} was an invalid type!`);
    }
  };

  await Promise.all(
    instances.map(async (i) => {
      return await processEach(i);
    })
  );

  res.json({
    success: true,
    announced,
  });
};

export { sendYoutubeAnnouncement };

export default checkInstances;
