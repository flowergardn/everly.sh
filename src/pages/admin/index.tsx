import Card from "~/components/Card";
import Navbar from "~/components/Navbar";
import { api } from "~/utils/api";

const Admin = () => {
  const Users = () => {
    const { data, isLoading, isError } = api.admin.getUsers.useQuery();

    if (isLoading) {
      return (
        <Card title={"User count"}>
          <span className="loading loading-dots loading-lg" />
        </Card>
      );
    }

    if (isError) {
      return <Card title={"User count"}>Error loading user count :c</Card>;
    }

    const totalUsers = data.users.length;
    const totalCustomers = data.users.filter((u) => u.metadata.customer).length;

    return (
      <Card title={"User count"}>
        <>
          <article>
            <p>{totalUsers} accounts</p>
            <p>{totalCustomers} customers</p>
          </article>
        </>
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
            <Users />
          </div>
        </div>
      </main>
    </>
  );
};

export default Admin;
