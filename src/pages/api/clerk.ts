import { Webhook } from "svix";
import { buffer } from "micro";
import { NextApiRequest, NextApiResponse } from "next";
import { IncomingHttpHeaders } from "http";
import { UserWebhookEvent } from "@clerk/nextjs/dist/types/server";
import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "~/server/db";
import { EmbedBuilder } from "@discordjs/builders";
import { APIEmbedField } from "discord-api-types/v10";
import axios from "axios";
import { env } from "~/env.mjs";

export const config = {
  api: {
    bodyParser: false,
  },
};

const secret = env.CLERK_WEBHOOK_SECRET;

type CustomHeaders = IncomingHttpHeaders & {
  "webhook-id": string;
  "webhook-timestamp": string;
  "webhook-signature": string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!secret) {
    res.status(500).json({
      success: false,
      error: `NO_WEBHOOK_SECRET`,
    });
    return;
  }

  try {
    const payload = await buffer(req);
    const headers = req.headers as CustomHeaders;

    const wh = new Webhook(secret);
    const msg = wh.verify(payload.toString(), headers) as UserWebhookEvent;

    if (msg.type !== "user.created") {
      res.status(200).end();
      return;
    }

    const { id: userId } = msg.data;

    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: { instanceCount: 3 },
    });

    const { external_accounts: linkedAccounts } = msg.data;

    if (linkedAccounts.length !== 1) {
      res.json({ ping: "pongy" });
      return;
    }

    const linked = linkedAccounts[0];

    if (!linked) return;

    const logEmbed = new EmbedBuilder().setTitle("User Created");
    logEmbed.setAuthor({
      name: linked.username ?? "",
      iconURL: linked.avatar_url,
    });

    const fields: APIEmbedField[] = [
      {
        name: "User ID",
        value: msg.data.id,
      },
    ];

    const whitelisted = await prisma.whitelisted.findFirst({
      where: {
        discordId: linked.provider_user_id,
      },
    });

    const isWhitelisted = whitelisted !== null;

    if (isWhitelisted) {
      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: { customer: true },
      });
    }

    fields.push({
      name: "Customer?",
      value: `${isWhitelisted ? "Yes" : "No"}`,
    });

    await axios.post(env.DEV_WEBHOOK, {
      embeds: [logEmbed.toJSON()],
    });

    res.json({ ping: "pong" });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
    });
  }
}
