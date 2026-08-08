import { UserAuth } from "../context/AuthContext";
import { useSignOut } from "../hooks/useSignOut";

const Dashboard = () => {
  const { session } = UserAuth();
  const { handleSignOut, error } = useSignOut();

  return (
    <div className="o-container o-container--page py-12">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <h2 className="u-text-muted mt-2">Welcome, {session?.user?.email}</h2>
      <button
        type="button"
        onClick={handleSignOut}
        className="o-button o-button--md s-action mt-6"
      >
        Sign out
      </button>
      {error && <p className="u-text-error pt-4">{error}</p>}
    </div>
  );
};

export default Dashboard;
