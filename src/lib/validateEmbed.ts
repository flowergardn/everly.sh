import { z } from "zod";

const APIButtonSchema = z.object({
  type: z.literal(2),
  label: z.string(),
  style: z.number(),
  url: z.string().regex(/^(https:\/\/.*|%link%)$/),
});

const APIActionRowSchema = z.object({
  type: z.literal(1),
  components: z.array(APIButtonSchema),
});

const APIEmbedFooterSchema = z.object({
  text: z.string().max(2048),
  icon_url: z.string().includes("https://").optional(),
});

const APIEmbedImageSchema = z.object({
  url: z.string().regex(/^(https:\/\/.*|%thumbnail%)$/),
  proxy_url: z.string().optional(),
});

const APIEmbedThumbnailSchema = z.object({
  url: z.string().regex(/^(https:\/\/.*|%thumbnail%)$/),
  proxy_url: z.string().optional(),
});

const APIEmbedAuthorSchema = z.object({
  name: z.string().max(256),
  url: z.string().includes("https://").optional(),
  icon_url: z.string().includes("https://").optional(),
});

const APIEmbedFieldSchema = z.object({
  name: z.string().max(256),
  value: z.string().max(1024),
  inline: z.boolean().optional(),
});

const APIEmbedSchema = z.object({
  title: z.string().max(256).optional(),
  description: z.string().max(4096).optional(),
  url: z.string().optional(),
  color: z.number().optional(),
  timestamp: z.string().datetime().optional(),
  footer: APIEmbedFooterSchema.optional(),
  fields: APIEmbedFieldSchema.array().max(25).optional(),
  author: APIEmbedAuthorSchema.optional(),
  image: APIEmbedImageSchema.optional(),
  thumbnail: APIEmbedThumbnailSchema.optional(),
});

const APIMessageSchema = z
  .object({
    content: z.string().optional(),
    color: z.number().optional(),
    embeds: APIEmbedSchema.array().optional(),
    components: APIActionRowSchema.array().optional(),
  })
  .strict();

export function validateAPIEmbed(jsonString: string): boolean {
  try {
    APIMessageSchema.parse(JSON.parse(jsonString));
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}
