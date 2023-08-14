import type { GetStaticProps, NextPage } from "next";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { Speakerphone } from "~/components/Icons";
import Page from "~/components/Page";
import type { VideoAnnouncement } from "~/server/api/routers/general";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { api } from "~/utils/api";

const InstanceInfo: NextPage<{ id: string }> = ({ id }) => {
  const ctx = api.useContext();

  const { data, isLoading, isError, error } = api.instances.getById.useQuery({
    id,
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

  const Automation = () => {
    const { mutate: toggleAutomation } =
      api.instances.toggleAutomation.useMutation({
        onSuccess: async () => {
          await ctx.instances.getById.invalidate();
        },
      });

    const onClick = () => toggleAutomation({ id: data.id });

    const AutomationButton = () => {
      if (!data.automation) {
        return (
          <button className={"btn-success btn capitalize"} onClick={onClick}>
            Enable
          </button>
        );
      }

      return (
        <button className={"btn-error btn capitalize"} onClick={onClick}>
          Disable
        </button>
      );
    };
    return (
      <div className={"card mt-10 w-52 bg-base-200 md:ml-12"}>
        <div className="card-body items-center text-center">
          <h2 className="card-title">Automation</h2>
          <div className="card-actions mt-4 justify-end">
            <AutomationButton />
          </div>
        </div>
      </div>
    );
  };

  const Editor = () => {
    return (
      <div className={"card mt-10 w-52 bg-base-200 md:ml-12"}>
        <div className="card-body items-center text-center">
          <h2 className="card-title">Editor</h2>
          <div className="card-actions mt-4 justify-end">
            <Link passHref legacyBehavior href={`${data.id}/editor`}>
              <button className={"btn-primary btn capitalize"}>View</button>
            </Link>
          </div>
        </div>
      </div>
    );
  };

  const RecentVideos = () => {
    const {
      data: videoData,
      isLoading: loadingVideoData,
      isError: videoDataError,
    } = api.general.getYTVideos.useQuery({
      instanceId: id,
    });

    const { mutate } = api.instances.announce.useMutation({
      onSuccess: async () => {
        await ctx.general.getYTVideos.invalidate();
        toast.success("Success!");
      },
      onError: (e) => {
        toast.error(e.message);
      },
    });

    const Video = (props: { video: VideoAnnouncement }) => {
      const Badge = () => {
        if (props.video.announced)
          return <div className="badge badge-success">Announced</div>;
        else return <div className="badge badge-error">Unannounced</div>;
      };
      return (
        <div
          className={`rounded-md bg-black/20 px-4 ${
            props.video.announced ? "py-4" : ""
          }`}
        >
          <p className="my-2">{props.video.title}</p>
          <Badge />
          {!props.video.announced && (
            <div className="card-actions my-4">
              <div className="tooltip tooltip-bottom" data-tip={"Announce"}>
                <button
                  className="btn-primary btn-sm rounded-xl capitalize"
                  onClick={() => {
                    mutate({
                      instanceId: data.id,
                      videoId: props.video.id,
                    });
                  }}
                >
                  <Speakerphone />
                </button>
              </div>
            </div>
          )}
        </div>
      );
    };

    const VideoList = () => {
      if (loadingVideoData || videoDataError) return <></>;

      const arr = [videoData.latest, ...videoData.previous];
      arr.length = 4;

      return (
        <>
          {arr.map((v) => {
            return <Video video={v} key={v.id} />;
          })}
        </>
      );
    };

    return (
      <div className={"card mt-10 w-96 bg-base-200 md:ml-12"}>
        <div className="card-body">
          <h2 className="card-title float-left">Recent Videos</h2>

          {loadingVideoData ? (
            <span className="loading loading-dots loading-lg" />
          ) : (
            <VideoList />
          )}
        </div>
      </div>
    );
  };

  return (
    <Page>
      <article className="prose">
        <h2>Managing {data.name}</h2>
      </article>
      {data.type === "youtube" ? (
        <main className="flex justify-center">
          <div className="flex h-full w-full items-center justify-center md:px-32 md:py-12">
            <Automation />
            <Editor />
          </div>
          <div className="mt-12 flex flex-row flex-wrap justify-between">
            <div>
              <RecentVideos />
            </div>
          </div>
        </main>
      ) : (
        <main className="flex justify-center">
          <div className="flex h-full w-full items-center justify-center px-8 py-8 md:px-32 md:py-12">
            <Automation />
            <Editor />
          </div>
        </main>
      )}
    </Page>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();

  const id = context.params?.id;

  if (typeof id !== "string") throw new Error("no id");

  await ssg.instances.getById.prefetch({ id });

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

export default InstanceInfo;
