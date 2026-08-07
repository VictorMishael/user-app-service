import { Link } from "react-router-dom";
import { ACTION_BUTTON_BASE } from "../styles/buttonStyles";

const CTA_STYLES = `${ACTION_BUTTON_BASE} w-full px-6 py-3 sm:w-auto`;

const Home = () => {
  return (
    <main className="mx-auto max-w-3xl px-4 py-20 text-center sm:py-28">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        User-App-Service
      </h1>
      <p className="mx-auto mt-6 max-w-xl text-lg text-slate-600 dark:text-slate-400">
        Account and session management for the Vic-Thor platform. Create an
        account or sign in to reach your dashboard.
      </p>

      <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link to="/signup" className={CTA_STYLES}>
          Create an account
        </Link>
        <Link to="/signin" className={CTA_STYLES}>
          Sign in
        </Link>
      </div>
    </main>
  );
};

export default Home;
