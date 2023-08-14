import { DiscordMessages } from "@skyra/discord-components-react";
import {
  DiscordActionRow,
  DiscordAttachments,
  DiscordButton,
  DiscordEmbed,
  DiscordEmbedDescription,
  DiscordMessage,
} from "@skyra/discord-components-react";
import {
  APIButtonComponent,
  APIButtonComponentWithURL,
  APIMessage,
} from "discord-api-types/v10";
import type { GetStaticProps, NextPage } from "next";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "react-hot-toast";
import Page from "~/components/Page";
import { isNonEmptyString } from "~/lib/general";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { api } from "~/utils/api";

type FormValues = {
  messageContent: string;
  embedTitle: string;
  embedDesc: string;
  embedImage: string;
  embedColor: string;
  buttonTitle: string;
  buttonLink: string;
};

type FormField =
  | "messageContent"
  | "embedTitle"
  | "embedDesc"
  | "embedImage"
  | "embedColor"
  | "buttonTitle"
  | "buttonLink";

const hexToDecimal = (hex: string) => parseInt(hex, 16);
const decimalToHex = (decimal: number) => decimal.toString(16);

const InstanceMsgEditor: NextPage<{ id: string }> = ({ id }) => {
  const { data, isLoading, isError, error } = api.instances.getById.useQuery({
    id,
  });

  const { mutate } = api.instances.updateMessage.useMutation({
    onSuccess: () => {
      toast.success("Successfully updated!");
    },
    onError: () => {
      toast.error("Invalid message 😭");
    },
  });

  const { register, control, handleSubmit } = useForm<FormValues>();

  const onSubmit = handleSubmit((data) => {
    if (isNonEmptyString(data.embedColor)) {
      const hex = data.embedColor.replace("#", "");

      data.embedColor = hexToDecimal(hex).toString();
    }

    mutate({
      id,
      data,
    });
  });

  if (isError) {
    return (
      <Page>
        <div className="flex items-center justify-center">{error?.message}</div>
      </Page>
    );
  }

  if (isLoading)
    return (
      <Page>
        <div className="flex items-center justify-center">
          <span className="loading loading-dots loading-lg" />
        </div>
      </Page>
    );

  const msg = JSON.parse(data.announcementMsg) as APIMessage;
  const embedData = (msg.embeds ?? []).shift();

  const defaults = {
    messageContent: parseDefaultValue("messageContent") ?? "@Role",
    embedTitle: parseDefaultValue("embedTitle") ?? "New video",
    embedDesc: parseDefaultValue("embedDesc") ?? "New video!",
    embedImage: parseDefaultValue("embedImage") ?? "",
    embedColor: parseDefaultValue("embedColor") ?? "#ffd4e3",
    buttonTitle: parseDefaultValue("buttonTitle") ?? "",
    buttonLink: parseDefaultValue("buttonLink") ?? "",
  };

  function parseDefaultValue(v: FormField) {
    if (!data) {
      console.log(`No data. Cannot parse default value.`);
      return "";
    }

    const components = msg.components;

    switch (v) {
      case "messageContent":
        return msg.content ?? "";
      case "embedTitle": {
        if (embedData) return embedData.title ?? "";
        else {
          console.log(`no embed for embedTitle`);
          return "";
        }
      }
      case "embedDesc": {
        if (embedData) return embedData.description ?? "";
        else {
          console.log(`no embed for embedDesc`);
          return "";
        }
      }
      case "embedImage": {
        if (embedData && embedData.image) return embedData.image.url ?? "";
        else {
          console.log(`no embed for embedImage`);
          return "";
        }
      }
      case "embedColor": {
        if (embedData && embedData.color) {
          console.log(`found embedData and embedData.color`);
          return "#" + decimalToHex(embedData.color);
        } else {
          console.log(`no embed for embedColor`);
          return "";
        }
      }
      case "buttonLink": {
        if (components && components.length > 0) {
          const comp = components.shift()?.components;
          const btn = comp?.shift() as APIButtonComponentWithURL;
          return btn.url;
        } else return "";
      }
      case "buttonTitle": {
        if (components && components.length > 0) {
          const comp = components.shift()?.components;
          const btn = comp?.shift() as APIButtonComponent;
          return btn.label;
        } else return "";
      }
    }
  }

  const EditorForm = () => {
    const Input = (props: { placeholder: string; formKey: FormField }) => {
      return (
        <input
          type="text"
          placeholder={props.placeholder}
          defaultValue={defaults[props.formKey]}
          {...register(props.formKey)}
          className="input-bordered input-accent input my-2 w-full max-w-md"
        />
      );
    };

    const BigInput = (props: { placeholder: string; formKey: FormField }) => {
      return (
        <textarea
          placeholder={props.placeholder}
          defaultValue={defaults[props.formKey]}
          {...register(props.formKey)}
          className="input-bordered input-accent input my-2 h-full w-full max-w-md"
        />
      );
    };

    return (
      <div className={"card mt-10 w-96 bg-base-200 md:ml-12"}>
        <div className="card-body">
          <h2 className="card-title float-left">Edit</h2>
          <form
            onSubmit={(d) => {
              void onSubmit(d);
            }}
          >
            <BigInput placeholder="Message Content" formKey="messageContent" />
            <Input placeholder="Embed Title" formKey="embedTitle" />
            <Input placeholder="Embed Color" formKey="embedColor" />
            <BigInput placeholder="Embed Description" formKey="embedDesc" />
            <Input placeholder="Embed Image" formKey="embedImage" />
            <div className="divider">Button</div>
            <Input placeholder="Button Text" formKey="buttonTitle" />
            <Input placeholder="Button Link" formKey="buttonLink" />
            <input
              type="submit"
              className={`btn-secondary btn float-right mt-4 capitalize `}
            />
          </form>
        </div>
      </div>
    );
  };

  const Visualizer = () => {
    const fieldNames: FormField[] = [
      "messageContent",
      "embedTitle",
      "embedDesc",
      "embedColor",
      "embedImage",
      "buttonTitle",
      "buttonLink",
    ];

    const formValues = fieldNames.reduce(
      (values: Record<FormField, string>, fieldName: FormField) => {
        values[fieldName] = useWatch({
          control,
          name: fieldName,
          defaultValue: parseDefaultValue(fieldName) ?? "",
        });
        return values;
      },
      {} as Record<FormField, string>
    );

    const {
      messageContent,
      embedTitle,
      embedDesc,
      embedImage,
      embedColor,
      buttonTitle,
      buttonLink,
    } = formValues;

    const DiscordBtn = () => {
      if (buttonTitle.length === 0) return <></>;
      const link = buttonLink.length !== 0 ? buttonLink : "";
      return (
        <DiscordActionRow>
          <DiscordButton type="secondary" url={link}>
            <p>{buttonTitle}</p>
          </DiscordButton>
        </DiscordActionRow>
      );
    };

    const newEmbedImage =
      embedImage === "%thumbnail%"
        ? "https://img.youtube.com/vi/Ce5N_N6qa6I/maxresdefault.jpg"
        : embedImage;

    return (
      <div className={"card mt-10 w-[30rem] bg-base-200 md:ml-12"}>
        <div className="card-body">
          <h2 className="card-title float-left">View</h2>
          <DiscordMessages>
            <DiscordMessage
              author={"Your custom bot"}
              avatar={"/Everly.png"}
              roleColor={"#0099ff"}
              bot={true}
              className={"noHover"}
            >
              <p>{messageContent}</p>
              <DiscordEmbed
                slot="embeds"
                color={embedColor}
                embedTitle={embedTitle}
                image={newEmbedImage}
              >
                <DiscordEmbedDescription slot="description">
                  {embedDesc}
                </DiscordEmbedDescription>
              </DiscordEmbed>
              <DiscordAttachments slot="components">
                <DiscordBtn />
              </DiscordAttachments>
            </DiscordMessage>
          </DiscordMessages>
        </div>
      </div>
    );
  };

  return (
    <Page>
      <article className="prose">
        <h2>Editing {data.name}</h2>
      </article>
      <div className="mt-12 flex flex-row flex-wrap justify-between">
        <div>
          <EditorForm />
        </div>
        <div>
          <Visualizer />
        </div>
      </div>
    </Page>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();

  const id = context.params?.id;

  if (typeof id !== "string") throw new Error("no id");

  await ssg.instances.getById.prefetch({ id });
  await ssg.general.getYTVideos.prefetch({ instanceId: id });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default InstanceMsgEditor;
