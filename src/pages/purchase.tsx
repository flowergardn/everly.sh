import Link from "next/link";
import { toast } from "react-hot-toast";
import Navbar from "~/components/Navbar";
import { api } from "~/utils/api";

const Purchase = () => {
  const { mutate } = api.general.isCustomer.useMutation({
    onSuccess: (d) => {
      if (!d.success && d.reason) {
        toast.error(d.reason);
        return;
      }
      toast.success("Success!");
      setTimeout(() => (location.href = "/setup"));
    },
  });
  return (
    <>
      <Navbar />
      <main className="flex justify-center">
        <div className="mt-24 flex h-full w-full items-center justify-center text-center">
          <article className="prose">
            <h1>Purchase Everly</h1>
            <p className="text-lg">
              It appears you haven&apos;t purchased Everly yet!
            </p>
            <p className="text-lg">
              Head over{" "}
              <Link
                href="https://everly.sellpass.io/products/Everly"
                passHref
                legacyBehavior
              >
                <a>here</a>
              </Link>{" "}
              to purchase it.
            </p>
            <button
              className="btn-success btn capitalize"
              onClick={() => {
                mutate();
              }}
            >
              recheck
            </button>
          </article>
        </div>
      </main>
    </>
  );
};

export default Purchase;
