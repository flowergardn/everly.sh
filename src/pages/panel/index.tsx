import { Instance } from "@prisma/client";
import { NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import { Add } from "~/components/Icons";
import Navbar from "~/components/Navbar";
import { api } from "~/utils/api";

const Instance = (props: { instance: Instance }) => {
  return (
    <a href={`/panel/${props.instance.id}`}>
      <div className="tooltip tooltip-bottom" data-tip={props.instance.name}>
        <div className="avatar md:ml-12">
          <div className="w-24 rounded-full">
            <Image
              src={props.instance.accountPfp}
              height={128}
              width={128}
              alt={"Profile Picture"}
            />
          </div>
        </div>
      </div>
    </a>
  );
};

const Panel: NextPage = () => {
  const {
    data: instances,
    isLoading: instancesLoading,
    isError: instancesError,
  } = api.instances.get.useQuery();

  const CreateInstance = () => {
    const {
      data: userInfo,
      isLoading: userInfoLoading,
      isError: userInfoError,
    } = api.general.userInfo.useQuery();

    if (userInfoLoading || userInfoError) return <></>;

    let currentInstances = 0;
    if (instances) currentInstances = instances.length;

    if (currentInstances >= userInfo.instanceCount) {
      return (
        <div
          className="tooltip tooltip-bottom"
          data-tip={`You've surpassed your limit of ${userInfo.instanceCount} instances.`}
        >
          <button className={`btn-disabled btn-outline btn w-14`}>
            <Add />
          </button>
        </div>
      );
    }

    return (
      <div className="tooltip tooltip-bottom" data-tip="Create new instance">
        <Link href="/setup" passHref legacyBehavior>
          <button className={`btn-success btn-outline btn w-14`}>
            <Add />
          </button>
        </Link>
      </div>
    );
  };

  const InstanceList = () => {
    const cantShow = instancesLoading || instancesError;
    const hasInstances = instances && instances.length > 0;

    return (
      <div className="mt-12 flex flex-row flex-wrap items-center justify-center">
        {cantShow ? (
          <span className="loading loading-dots loading-lg" />
        ) : hasInstances ? (
          instances.map((instance) => (
            <Instance instance={instance} key={instance.id} />
          ))
        ) : (
          <span>
            No instances found. Create one by going
            <Link href="/setup" passHref>
              <span className="font-bold"> here</span>
            </Link>
          </span>
        )}
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <main className="flex justify-center">
        <div className="flex h-full w-full flex-col px-8 py-8 md:px-32 md:py-12">
          <div className="flex justify-end">
            <CreateInstance />
          </div>
          <InstanceList />
        </div>
      </main>
    </>
  );
};

export default Panel;
