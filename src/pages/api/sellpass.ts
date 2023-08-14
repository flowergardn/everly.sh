import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import InvoiceResponse from "~/interfaces/SellpassInvoice";
import Purchase from "~/interfaces/SellpassWebhook";
import { prisma } from "~/server/db";
import constants from "~/lib/constants";
import { env } from "~/env.mjs";

const getInvoice = async (invoiceId: string) => {
  const token = env.SELLPASS_TOKEN;

  if (!token) {
    console.log(`Failed to fetch invoice! No sellpass token.`);
    return;
  }

  const _invoice = await axios.get(
    `https://dev.sellpass.io/self/31576/invoices/${invoiceId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const invoice = _invoice as {
    data: InvoiceResponse;
  };

  return invoice.data.data;
  // invoice.data.data.customerInfo.discordSocialConnect.discordUserInfo.id
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const body = req.body as Purchase;

  const invoice = await getInvoice(body.InvoiceId);

  if (!invoice) {
    res.status(500).json({
      success: false,
      error: "INVALID_ENV",
    });
    return;
  }

  const { discordId } =
    invoice.customerInfo.discordSocialConnect.discordUserInfo;

  if (!discordId) {
    res.status(500).json({
      success: false,
      error: "INVALID_ID",
    });
    return;
  }

  await prisma.whitelisted.create({
    data: {
      discordId: discordId,
    },
  });

  await axios.post(env.DEV_WEBHOOK, {
    content: `<@852656702037164053> Someone (<@${discordId}>) just bought Everly!`,
  });

  await axios.put(
    `https://discord.com/api/guilds/${constants.guildId}/members/${discordId}/roles/${constants.userRoleId}`,
    undefined,
    {
      headers: {
        "X-Audit-Log-Reason": `Purchased Everly <3`,
      },
    }
  );

  res
    .status(200)
    .json(
      "Your purchase has successfully completed! Login to https://everly.sh/ with Discord to access it."
    );
}
