import { type NextPage } from "next";
import Head from "next/head";
import {
  DiscordActionRow,
  DiscordAttachments,
  DiscordButton,
  DiscordEmbed,
  DiscordEmbedDescription,
  DiscordMessage,
  DiscordMessages,
} from "@skyra/discord-components-react";
import { useEffect, useState } from "react";
import Navbar from "~/components/Navbar";
import { getBaseUrl } from "~/utils/api";

const Example: NextPage = () => {
  const [showMsg, setShowMsg] = useState(false);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => setShowMsg(true), []);

  const Message = () => {
    if (!showMsg) return <></>;
    return (
      <>
        <DiscordMessages>
          <DiscordMessage
            author={"Your custom bot"}
            avatar={"/Everly.png"}
            roleColor={"#0099ff"}
            bot={true}
            className={"noHover"}
          >
            <DiscordEmbed
              slot="embeds"
              color={"#fe4d01"}
              embedTitle={"New LTT Video!"}
              image={"https://img.youtube.com/vi/2fKIaalk4_w/maxresdefault.jpg"}
            >
              <DiscordEmbedDescription slot="description">
                I should stop building computers.
              </DiscordEmbedDescription>
            </DiscordEmbed>
            <DiscordAttachments slot="components">
              <DiscordActionRow>
                <DiscordButton
                  type="secondary"
                  url={"https://youtu.be/watch?v=2fKIaalk4_w"}
                >
                  <p>Watch now</p>
                </DiscordButton>
              </DiscordActionRow>
            </DiscordAttachments>
          </DiscordMessage>
        </DiscordMessages>
      </>
    );
  };

  const Message2 = () => {
    if (!showMsg) return <></>;
    return (
      <>
        <DiscordMessages>
          <DiscordMessage
            author={"Your custom bot"}
            avatar={"/Everly.png"}
            roleColor={"#0099ff"}
            bot={true}
            className={"noHover"}
          >
            <DiscordEmbed
              slot="embeds"
              color={"#b4e41e"}
              embedTitle={"Dream is live!"}
              image={"https://cdn.upload.systems/uploads/DoLoTpdm.jpg"}
            >
              <DiscordEmbedDescription slot="description">
                Minecraft EVENT for CHARITY
              </DiscordEmbedDescription>
            </DiscordEmbed>
            <DiscordAttachments slot="components">
              <DiscordActionRow>
                <DiscordButton type="secondary" url={"https://twitch.tv/dream"}>
                  <p>Come join!</p>
                </DiscordButton>
              </DiscordActionRow>
            </DiscordAttachments>
          </DiscordMessage>
        </DiscordMessages>
      </>
    );
  };

  const Message3 = () => {
    if (!showMsg) return <></>;
    return (
      <>
        <DiscordMessages>
          <DiscordMessage
            author={"Powfu Uploads"}
            avatar={
              "https://cdn.discordapp.com/avatars/1117990796575121449/70cfdfc336ca2a4c4b0cb3a3a5f724cc.png"
            }
            roleColor={"#cf212a"}
            bot={true}
            className={"noHover"}
          >
            <DiscordEmbed
              slot="embeds"
              color={"#9630f5"}
              embedTitle={"New Powfu upload"}
              image={"https://img.youtube.com/vi/TDy1HzFurTM/maxresdefault.jpg"}
            >
              <DiscordEmbedDescription slot="description">
                if i knew sooner (acoustic unreleased)
              </DiscordEmbedDescription>
            </DiscordEmbed>
            <DiscordAttachments slot="components">
              <DiscordActionRow>
                <DiscordButton
                  type="secondary"
                  url={"https://www.youtube.com/watch?v=TDy1HzFurTM"}
                >
                  <p>Watch</p>
                </DiscordButton>
              </DiscordActionRow>
            </DiscordAttachments>
          </DiscordMessage>
        </DiscordMessages>
      </>
    );
  };

  const examples = [<Message />, <Message2 />, <Message3 />];

  const handleNextClick = () => {
    setActiveIndex((activeIndex + 1) % examples.length);
  };

  const Meta = () => {
    const description = `View examples of Everly`;
    const url = getBaseUrl();
    const title = "Example of Everly";

    return (
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={url + "/Kitty.png"} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="256" />
        <meta property="og:image:height" content="256" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="twitter:domain" content={url} />
        <meta property="twitter:url" content={url} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
      </Head>
    );
  };

  return (
    <>
      <Meta />
      <Navbar />
      <div className="hero min-h-screen bg-base-200">
        <div>
          <div className="flex items-center justify-center">
            {examples[activeIndex]}
          </div>
          <div className="mt-4 flex items-center justify-center">
            <button
              className="btn-ghost btn normal-case"
              onClick={handleNextClick}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Example;
