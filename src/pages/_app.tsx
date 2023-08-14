import { type AppType } from "next/app";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/react";

const Everly: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <ClerkProvider
        appearance={{
          baseTheme: dark,
        }}
      >
        <Toaster position="bottom-center" />
        <Component {...pageProps} />
      </ClerkProvider>
      <Analytics />
    </>
  );
};

export default api.withTRPC(Everly);
