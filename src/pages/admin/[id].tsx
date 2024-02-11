import type { APIMessage } from "discord-api-types/v10";
import type { GetStaticProps, NextPage } from "next";
import { toast } from "react-hot-toast";
import Card from "~/components/Card";
import Navbar from "~/components/Navbar";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { api } from "~/utils/api";

const AdminInstance: NextPage<{ id: string }> = ({ id }) => {
  const DeleteInstance = () => {
    const { mutate } = api.admin.deleteInstance.useMutation({
      onSuccess: () => {
        toast.success("Successfully deleted instance");
      },
      onError: (e) => {
        console.log(e);
        toast.error("Error deleting instance.");
      },
    });

    return (
      <Card title="Delete Instance">
        <button
          className="btn-error btn"
          onClick={() => {
            mutate({
              id,
            });
          }}
        >
          Delete
        </button>
      </Card>
    );
  };

  const InstanceInfo = () => {
    const { data, isLoading, isError } = api.admin.getInstance.useQuery({
      id,
    });

    if (isLoading) {
      return (
        <Card title={"Instance info"}>
          <span className="loading loading-dots loading-lg" />
        </Card>
      );
    }

    if (isError) {
      return (
        <Card title={"Instance info"}>Error loading instance info :c</Card>
      );
    }

    return (
      <Card title="Instance info">
        <article>
          <p className="mb-2">
            Type:{" "}
            <code className="rounded-lg bg-black/40 p-1 text-white ">
              {data.type}
            </code>
          </p>
          <p className="mb-2">
            Automation:{" "}
            <code className="rounded-lg bg-black/40 p-1 text-white">
              {data.automation ? "true" : "false"}
            </code>
          </p>
          <p className="mb-2">
            Announcements:{" "}
            <code className="rounded-lg bg-black/40 p-1 text-white">
              {data.announcements.length}
            </code>
          </p>
        </article>
      </Card>
    );
  };

  const InstanceMsg = () => {
    const { data, isLoading, isError } = api.admin.getInstance.useQuery({
      id,
    });

    if (isLoading) {
      return (
        <Card title={"Message"}>
          <span className="loading loading-dots loading-lg" />
        </Card>
      );
    }

    if (isError) {
      return <Card title={"Message"}>Error loading instance Message :c</Card>;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const message: APIMessage = JSON.parse(data.message);

    return (
      <Card title="Message" size="w-fit" center={false}>
        <pre className="rounded-lg bg-black/40 p-1 text-white ">
          {JSON.stringify(message, null, 4)}
        </pre>
      </Card>
    );
  };

  return (
    <>
      <Navbar />
      <main className="flex justify-center">
        <div className="flex h-full w-full flex-col px-8 py-8 md:px-32 md:py-12">
          <article className="prose">
            <h1>Admin</h1>
          </article>
          <div className="mt-12 flex flex-row flex-wrap items-center justify-center">
            <DeleteInstance />
            <InstanceInfo />
            <InstanceMsg />
          </div>
        </div>
      </main>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();

  const id = context.params?.id;

  if (typeof id !== "string") throw new Error("no id");

  await ssg.admin.getInstance.prefetch({ id });

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

export default AdminInstance;
