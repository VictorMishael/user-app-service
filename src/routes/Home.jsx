import { Link } from "react-router-dom";

// Full width while the calls to action stack, natural width once they sit
// side by side.
const CTA_STYLES = "o-button o-button--lg o-button--block s-action sm:w-auto";

const Home = () => {
  return (
    <main className="o-container o-container--page py-20 text-center sm:py-28">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        User-App-Service
      </h1>
      <p className="u-text-muted mx-auto mt-6 max-w-xl text-lg">
        Account and session management for the Vic-Thor platform. Create an
        account or sign in to reach your dashboard.
      </p>

      <div className="o-cluster o-cluster--center mt-10 flex-col sm:flex-row">
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
