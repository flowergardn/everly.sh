import APIMessage, { Component, Embed } from "~/interfaces/APIMessage";

function replacePlaceholders(s: string, map: Map<string, string>): string {
  let placeholded = s;

  for (const [key, value] of map.entries()) {
    const regex = new RegExp(`%${key}%`, "g");
    placeholded = placeholded.replace(regex, value);
  }

  return placeholded;
}

function parseEmbed(obj: APIMessage, map: Map<string, string>): APIMessage {
  const result: APIMessage = {};

  console.log(map);

  if (obj.content) {
    result.content = replacePlaceholders(obj.content, map);
  }

  if (obj.embeds) {
    result.embeds = obj.embeds.map((embed) => {
      const newEmbed: Embed = {};

      if (embed.color) newEmbed.color = embed.color;

      if (embed.title) {
        newEmbed.title = replacePlaceholders(embed.title, map);
      }

      if (embed.description) {
        newEmbed.description = replacePlaceholders(embed.description, map);
      }

      if (embed.image) {
        console.log(embed.image);
        newEmbed.image = {
          url: replacePlaceholders(embed.image.url, map),
        };
      }

      return newEmbed;
    });
  }

  if (obj.components) {
    result.components = obj.components.map((component) => {
      const newComponent: Component = {
        type: component.type,
        components: [],
      };

      if (component.components) {
        newComponent.components = component.components.map((button) => ({
          type: button.type,
          label: replacePlaceholders(button.label, map),
          style: button.style,
          url: replacePlaceholders(button.url, map),
        }));
      }

      return newComponent;
    });
  }

  return result;
}

export { parseEmbed };
