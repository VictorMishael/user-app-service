import { UserAuth } from "../context/AuthContext";
import { useSignOut } from "../hooks/useSignOut";
import { ACTION_BUTTON_BASE } from "../styles/buttonStyles";

const Dashboard = () => {
  const { session } = UserAuth();
  const { handleSignOut, error } = useSignOut();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <h2 className="mt-2 text-slate-600 dark:text-slate-400">
        Welcome, {session?.user?.email}
      </h2>
      <button
        type="button"
        onClick={handleSignOut}
        className={`${ACTION_BUTTON_BASE} mt-6 px-4 py-3`}
      >
        Sign out
      </button>
      {error && <p className="pt-4 text-red-600">{error}</p>}
    </div>
  );
};

export default Dashboard;
