import { Link } from "react-router";

export const meta = () => [
  { title: "Support — Agentic SEO" },
  { name: "description", content: "How to get help with Agentic SEO." },
];

const CONTACT = "help.nuraveda@gmail.com";

export default function Support() {
  return (
    <main style={styles.main}>
      <nav style={styles.nav}>
        <Link to="/" style={styles.navLink}>Agentic SEO</Link>
        <span> · </span>
        <Link to="/privacy" style={styles.navLink}>Privacy</Link>
        <span> · </span>
        <Link to="/support" style={styles.navLinkActive}>Support</Link>
        <span> · </span>
        <Link to="/docs" style={styles.navLink}>Docs</Link>
      </nav>

      <article style={styles.article}>
        <h1>Support</h1>

        <h2>Contact</h2>
        <p>
          Email: <a href={`mailto:${CONTACT}`}>{CONTACT}</a>
        </p>
        <p>
          We respond within 1 business day. For urgent issues (app not loading,
          OAuth failure, data question), include your <code>.myshopify.com</code> domain
          in the email so we can look up your session.
        </p>

        <h2>Before contacting us</h2>
        <ul>
          <li>Check the <Link to="/docs">Documentation</Link> page for install, audit, and scope questions.</li>
          <li>Make sure the app is installed with the full scope set. If scopes were updated after install, you&rsquo;ll see a permission prompt on next admin load.</li>
          <li>Re-run the SEO audit after a theme edit — results update on each run.</li>
        </ul>

        <h2>Common issues</h2>

        <h3>Audit shows checks as &ldquo;not testable&rdquo; (⏳)</h3>
        <p>
          The audit couldn&rsquo;t fetch your live storefront or a product page. This
          usually means:
        </p>
        <ul>
          <li>Your store is password-protected (disable storefront password or whitelist our audit User-Agent).</li>
          <li>No product exists yet (product-page checks require at least one published product).</li>
          <li>A CDN or firewall is blocking our crawler. Email us and we&rsquo;ll share our audit IP range.</li>
        </ul>

        <h3>Audit shows &ldquo;failing&rdquo; checks on a brand-new store</h3>
        <p>
          This is expected. Most Shopify themes ship without FAQPage schema,
          BreadcrumbList, or enriched Product JSON-LD. The audit surfaces what&rsquo;s
          missing; the fixes module (and manual theme work we guide you through)
          adds what should be there.
        </p>

        <h3>&ldquo;Permission denied&rdquo; errors</h3>
        <p>
          A scope change has happened on our end (usually because we added a
          capability). Open the app in your admin and approve the updated scopes
          when prompted. You can revoke anytime by uninstalling.
        </p>

        <h3>Data retention / uninstall concerns</h3>
        <p>
          See the <Link to="/privacy">Privacy policy</Link>. On uninstall we delete
          your shop&rsquo;s session record within seconds via Shopify&rsquo;s uninstall
          webhook. You can also request manual deletion by email.
        </p>

        <h2>Feedback and feature requests</h2>
        <p>
          We&rsquo;re actively building — if something is missing or wrong, tell us
          at <a href={`mailto:${CONTACT}`}>{CONTACT}</a>. Feature requests go into our
          roadmap and we reply with an ETA when we have one.
        </p>
      </article>
    </main>
  );
}

const styles = {
  main: {
    maxWidth: "720px",
    margin: "0 auto",
    padding: "2rem 1.25rem 6rem",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, sans-serif",
    lineHeight: 1.55,
    color: "#1a1a1a",
  },
  nav: {
    paddingBottom: "1.5rem",
    borderBottom: "1px solid #e5e5e5",
    marginBottom: "2rem",
    fontSize: "0.9em",
    color: "#666",
  },
  navLink: { color: "#0070f3", textDecoration: "none" },
  navLinkActive: { color: "#1a1a1a", textDecoration: "none", fontWeight: 600 },
  article: { fontSize: "1rem" },
};
