import { UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

const Navbar = () => {
  const { isLoaded, user } = useUser();
  const { pathname } = useRouter();

  const getURL = () => {
    switch (pathname) {
      case "/panel/[id]": {
        return "/panel";
      }
      default: {
        return "/";
      }
    }
  };

  const UserDropdown = () => {
    return (
      <>
        <div className="dropdown-end dropdown hidden md:block">
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                userButtonBox: "scale-125",
                user,
              },
            }}
          />
        </div>
      </>
    );
  };

  return (
    <div className="ml-12 mr-24 bg-transparent md:ml-24 md:block">
      <div className="navbar mx-16 md:mx-0">
        <div className="md:ml-none mr-20 flex-1">
          <div className="mr-4 h-12 w-12">
            <Image src={"/Kitty.png"} width={64} height={64} alt="YayCat" />
          </div>
          <Link href={getURL()} passHref>
            <button className="btn-ghost btn text-xl normal-case">
              Everly
            </button>
          </Link>
        </div>
        <div className="ml-20 flex-none md:ml-0">
          {isLoaded ? <UserDropdown /> : <></>}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
