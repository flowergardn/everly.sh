/* eslint-disable @typescript-eslint/no-misused-promises */

import type { NextPage } from "next";
import { useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useWatch } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import Navbar from "~/components/Navbar";
import { api } from "~/utils/api";

type InstanceType = "youtube" | "twitch";

interface Onboarding {
  botToken?: string;
  clientId?: string;
  serverId?: string;
  channelId?: string;
  instanceType?: InstanceType;
}

type FormValues = {
  botToken: string;
  serverId: string;
  channelId: string;
  channel: string;
  instanceType: InstanceType;
};

type OnboardingTypes =
  | "botToken"
  | "server"
  | "invite"
  | "channels"
  | "complete";

enum Datastore {
  TOKEN = 1,
  SERVER_ID,
  CHANNEL_ID,
  CHANNEL,
  INSTANCE,
}

const Setup: NextPage = () => {
  const [onboardingData, setOnboardingData] = useState<Onboarding>({});

  const [page, setPage] = useState<OnboardingTypes>("botToken");

  const {
    mutate: generateInvite,
    data: generatedInvite,
    isLoading: isGeneratingInvite,
    isError: isGenerationError,
    error: generationError,
  } = api.discord.generateInvite.useMutation();

  const { mutate: checkServer } = api.discord.isInServer.useMutation({
    onSuccess(data) {
      if (data.success) {
        setPage("channels");
        return;
      }
      toast.error("Invite the bot to continue!");
    },
  });

  const { mutate: createInstance } = api.instances.create.useMutation({
    onSuccess() {
      window.location.href = "/panel";
    },
  });

  const { register, handleSubmit, control } = useForm<FormValues>();

  const {
    data: userGuilds,
    isLoading: guildsLoading,
    isError: guildsError,
  } = api.discord.getServers.useQuery(undefined, {
    staleTime: /*5 * 1000*/ Infinity,
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const keys = Object.keys(data).length;

    console.log(`on submit!`, data, keys);

    setOnboardingData(data);

    if (keys == Datastore.TOKEN && data.botToken) {
      setPage("server");
    }

    if (keys == Datastore.SERVER_ID && data.serverId) {
      generateInvite({
        botToken: data.botToken,
        serverId: data.serverId,
      });
      setPage("invite");
    }

    if (keys == Datastore.INSTANCE && data.channelId) {
      console.log(`Creating instance with`, data);
      setPage("complete");
      createInstance(data);
    }
  };

  const doSubmit = handleSubmit(onSubmit);

  const ServerSelect = () => {
    if (guildsLoading || guildsError)
      return <span className="loading loading-spinner text-accent" />;
    return (
      <>
        <p className="mb-2">Choose a server!</p>
        <form className="mb-[15px] flex items-center gap-5">
          <select
            className="select-secondary select w-full max-w-xs"
            {...register("serverId")}
          >
            <option disabled selected>
              Pick a server
            </option>
            {userGuilds.map((g) => {
              return (
                <option value={g.id} key={g.id}>
                  {g.name}
                </option>
              );
            })}
          </select>
        </form>
      </>
    );
  };

  const TypeSelect = () => {
    const type = useWatch({
      control,
      name: "instanceType",
    });

    const InputBox = () => {
      switch (type) {
        case "youtube": {
          return (
            <input
              type="text"
              placeholder="YouTube channel URL"
              {...register("channel", {
                required: true,
                pattern:
                  /https:\/\/(www\.)?youtube\.com\/((@[a-zA-Z0-9]{3,})|channel\/[a-zA-Z-_0-9]{3,})/gi,
              })}
              className="input-bordered input-accent input w-full max-w-lg"
            />
          );
        }
        case "twitch":
          return (
            <input
              type="text"
              placeholder="Twitch Username"
              {...register("channel", {
                required: true,
              })}
              className="input-bordered input-accent input w-full max-w-xs"
            />
          );
        default:
          return <></>;
      }
    };

    return (
      <>
        <p className="mb-2">Select instance type</p>
        <form className="mb-[15px] flex items-center gap-5">
          <select
            className="select-accent select w-full max-w-xs"
            {...register("instanceType")}
          >
            <option disabled selected>
              Pick a type
            </option>
            <option value="twitch" key="twitch">
              Twitch
            </option>
            <option value="youtube" key="youtube">
              YouTube
            </option>
          </select>
        </form>
        <form className="mb-[15px] flex items-center gap-5">
          <InputBox />
        </form>
      </>
    );
  };

  const ChannelSelect = () => {
    if (!onboardingData.botToken || !onboardingData.serverId) return <></>;

    const {
      data: guildChannels,
      isLoading: channelsLoading,
      isError: channelsError,
    } = api.discord.getChannels.useQuery(
      {
        botToken: onboardingData.botToken,
        serverId: onboardingData.serverId,
      },
      {
        staleTime: Infinity,
      }
    );
    if (channelsLoading || channelsError)
      return <span className="loading loading-spinner text-accent" />;
    return (
      <>
        <p className="mb-2">Select a text channel</p>
        <form className="mb-[15px] flex items-center gap-5">
          <select
            className="select-accent select w-full max-w-xs"
            {...register("channelId")}
          >
            <option disabled selected>
              Pick a channel
            </option>
            {guildChannels.map((g) => {
              return (
                <option value={g.id} key={g.id}>
                  #{g.name}
                </option>
              );
            })}
          </select>
        </form>
      </>
    );
  };

  const FormInput = () => {
    const GenerateForm = () => {
      switch (page) {
        case "botToken": {
          return (
            <form onSubmit={doSubmit}>
              <p className="mb-2">Enter in a bot token</p>
              <input
                type="text"
                placeholder="Bot token"
                {...register("botToken", {
                  required: true,
                })}
                className="input-bordered input-accent input w-full max-w-xs"
              />
              <input
                type="submit"
                className={`btn-secondary btn float-right mt-4`}
              />
            </form>
          );
        }
        case "server": {
          return (
            <form onSubmit={doSubmit}>
              <ServerSelect />

              <input
                type="submit"
                className={`btn-secondary btn float-right mt-4`}
              />
            </form>
          );
        }
        case "invite": {
          if (isGeneratingInvite) {
            return <p>Generating bot invite :)</p>;
          }
          if (isGenerationError) {
            return <p>{generationError.message}</p>;
          }

          const token = onboardingData.botToken;
          const serverId = onboardingData.serverId;

          if (!token || !serverId) return <></>;

          return (
            <>
              <div className="flex flex-col items-center justify-center">
                <p className="text-xl">Invite link generated!</p>
                <div className="join">
                  <a
                    href={generatedInvite?.invite}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <button
                      className={`btn-accent join-item btn mt-4 capitalize`}
                    >
                      Invite
                    </button>
                  </a>
                  <button
                    className={`btn-accent join-item btn mt-4 capitalize`}
                    onClick={() =>
                      checkServer({
                        botToken: token,
                        serverId,
                      })
                    }
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          );
        }
        case "channels": {
          return (
            <>
              <form onSubmit={doSubmit}>
                <ChannelSelect />
                <TypeSelect />
                <input
                  type="submit"
                  className={`btn-secondary btn float-right mt-4`}
                />
              </form>
            </>
          );
        }
        default: {
          return null;
        }
      }
    };
    return (
      <div className="mt-12 flex items-center justify-center">
        <GenerateForm />
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <main className="flex justify-center">
        <div className="flex h-full w-full flex-col px-8 py-8 md:px-32 md:py-12">
          <div className="md:ml-8">
            <div className="flex items-center justify-center">
              <article className="prose text-center">
                <h1>Setting up Everly</h1>
                <p className="mt-[-1rem] text-lg">
                  Quick and easy setup steps :)
                </p>
              </article>
            </div>
            <FormInput />
          </div>
        </div>
      </main>
    </>
  );
};

export default Setup;
