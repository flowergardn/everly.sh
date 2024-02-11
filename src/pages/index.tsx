import { SignInButton } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import Navbar from "~/components/Navbar";
import { api, getBaseUrl } from "~/utils/api";

const Home: NextPage = () => {
  const [isBuyer, setIsBuyer] = useState(false);

  api.general.userInfo.useQuery(undefined, {
    staleTime: 15 * 1000,
    onSuccess: (d) => setIsBuyer(d.customer),
  });

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
      <div className="hero min-h-screen bg-base-200">
        <div className="animate-fadeInUp hero-content flex-col lg:flex-row">
          <div>
            <h1 className="select-none text-center text-5xl font-bold">
              Everly
            </h1>
            <p className="select-none py-6">
              The best solution for social media notifications.
            </p>

            <div className="flex items-center justify-center">
              <Buttons />
            </div>
            <div className="flex items-center justify-center">
              <Link passHref href={"/example"}>
                <button className="btn-accent btn mr-2 mt-2 normal-case md:float-left">
                  See in action
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
