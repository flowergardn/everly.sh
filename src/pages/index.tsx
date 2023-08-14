import {
  DiscordActionRow,
  DiscordAttachments,
  DiscordButton,
  DiscordEmbed,
  DiscordEmbedDescription,
  DiscordMessage,
  DiscordMessages,
} from "@skyra/discord-components-react";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "~/components/Navbar";
import { api, getBaseUrl } from "~/utils/api";

const Home: NextPage = () => {
  const [showMsg, setShowMsg] = useState(false);
  const [isBuyer, setIsBuyer] = useState(false);

  api.general.userInfo.useQuery(undefined, {
    staleTime: 15 * 1000,
    onSuccess: (d) => setIsBuyer(d.customer),
  });

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

  const Buttons = () => {
    return (
      <>
        {!isBuyer ? (
          <>
            <Link passHref href={"/setup"}>
              <button className="btn-accent btn mr-2 mt-2 capitalize md:float-left">
                Get Started
              </button>
            </Link>
            <Link passHref href={"/api/purchase"}>
              <button className="btn-primary btn mx-2 mt-2 capitalize md:float-left">
                Purchase
              </button>
            </Link>
          </>
        ) : (
          <Link passHref href={"/panel"}>
            <button className="btn-accent btn mr-2 mt-2 capitalize md:float-left">
              Panel
            </button>
          </Link>
        )}
      </>
    );
  };

  const Meta = () => {
    const description = `Modernized YouTube and Twitch notification bot.`;
    const url = getBaseUrl();
    const title = "Everly";

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
      <main className="flex h-screen flex-col justify-start md:flex-row md:items-center md:pl-24">
        <div className="md:flex md:flex-col">
          <article className="prose mx-4 mt-4 text-center md:mx-0 md:mt-0 md:w-3/4 md:text-left">
            <h1>Welcome to Everly</h1>
            <p>
              Everly allows you to create custom Discord bots for social media
              notifications.
            </p>
          </article>
          <div className="mt-4 flex flex-wrap justify-center md:justify-start">
            <Buttons />
          </div>
        </div>
        <div className="md:ml-[40rem] md:flex-grow md:justify-end">
          <div className="card mt-10 w-full bg-base-200 md:ml-12 md:mr-12 md:w-[30rem]">
            <div className="card-body p-4 md:px-0">
              <Message />
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
