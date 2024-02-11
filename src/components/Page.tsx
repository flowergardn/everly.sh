import type { PropsWithChildren } from "react";
import Navbar from "./Navbar";

const Page = (props: PropsWithChildren) => {
  return (
    <>
      <Navbar />
      <main className="flex justify-center">
        <div className="flex h-full w-full flex-col px-8 py-8 md:px-32 md:py-12">
          {props.children}
        </div>
      </main>
    </>
  );
};

export default Page;
