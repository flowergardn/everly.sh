import { type AppType } from "next/app";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/react";
import Head from "next/head";

const Everly: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <script
          defer
          data-domain="everly.astrid.sh"
          src="https://analytics.astrid.sh/js/script.js"
        ></script>
      </Head>
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
