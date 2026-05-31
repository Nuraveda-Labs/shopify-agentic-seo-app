import { Link } from "react-router";

export const meta = () => [
  { title: "Privacy Policy — Agentic SEO" },
  { name: "description", content: "How Agentic SEO handles merchant and shop data." },
];

const LAST_UPDATED = "April 14, 2026";
const CONTACT = "help.nuraveda@gmail.com";

export default function Privacy() {
  return (
    <main style={styles.main}>
      <nav style={styles.nav}>
        <Link to="/" style={styles.navLink}>Agentic SEO</Link>
        <span> · </span>
        <Link to="/privacy" style={styles.navLinkActive}>Privacy</Link>
        <span> · </span>
        <Link to="/support" style={styles.navLink}>Support</Link>
        <span> · </span>
        <Link to="/docs" style={styles.navLink}>Docs</Link>
      </nav>

      <article style={styles.article}>
        <h1>Privacy Policy</h1>
        <p><em>Last updated: {LAST_UPDATED}</em></p>

        <p>
          Agentic SEO is operated by <strong>Nuraveda Lab</strong>. This
          policy describes what data we access from your Shopify store, what we
          store, and how long we keep it.
        </p>

        <h2>What data we access</h2>
        <ul>
          <li>
            <strong>Shop metadata</strong>: store name, domain, plan, contact email,
            enabled currencies, published locales. Read via the Shopify Admin API
            on first install and on demand.
          </li>
          <li>
            <strong>Product, collection, page, and blog data</strong>: titles, handles,
            descriptions, metafields, images, and structured data. Read and written
            via the Admin API when you initiate SEO actions.
          </li>
          <li>
            <strong>Theme files</strong>: read via the Themes API only when you run a
            theme-level action (such as applying a schema fix). Changes target
            unpublished duplicate themes unless you explicitly publish.
          </li>
          <li>
            <strong>Public storefront HTML</strong>: fetched over HTTPS when you run an
            SEO audit. This is the same HTML that any search engine or browser sees.
          </li>
        </ul>

        <h2>What data we do NOT access</h2>
        <ul>
          <li>Customer personal information (names, emails, addresses, payment methods).</li>
          <li>Orders, carts, checkouts, or transaction data.</li>
          <li>Merchant payment accounts or billing information.</li>
          <li>Any data that requires Shopify&rsquo;s <em>protected customer data</em> scopes.</li>
        </ul>
        <p>
          Agentic SEO has not requested and does not hold access to protected
          customer data scopes.
        </p>

        <h2>What we store</h2>
        <ul>
          <li>
            <strong>Offline access token</strong> issued by Shopify on install, stored
            encrypted at rest in our PostgreSQL database. Used to call the Admin API
            on your behalf.
          </li>
          <li>
            <strong>Shop identifier and domain</strong>: used to route API calls to the
            correct store.
          </li>
          <li>
            <strong>Granted scopes</strong>: recorded for audit purposes.
          </li>
        </ul>

        <h2>What we do not store</h2>
        <ul>
          <li>Product catalog data, pages, or theme files (read on demand, not cached).</li>
          <li>Customer information of any kind.</li>
          <li>Billing data.</li>
        </ul>

        <h2>Data retention and deletion</h2>
        <p>
          On app uninstall, Shopify sends an <code>app/uninstalled</code> webhook to our
          server. We immediately revoke the stored access token and delete the shop&rsquo;s
          session record from our database. No residual data remains.
        </p>
        <p>
          You can request earlier deletion by emailing <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
          We will confirm and delete within 7 calendar days.
        </p>

        <h2>Where data is stored</h2>
        <p>
          Data is stored on a dedicated server hosted by <strong>Google Cloud Platform</strong>
          in a single region. PostgreSQL access tokens are stored with disk-level encryption.
          Transit is TLS 1.2+.
        </p>

        <h2>Subprocessors</h2>
        <ul>
          <li><strong>Shopify, Inc.</strong> — OAuth, Admin API, and webhook delivery</li>
          <li><strong>Google Cloud Platform (Google LLC)</strong> — server hosting and database</li>
        </ul>
        <p>
          Agentic SEO does not share your data with third parties for marketing,
          analytics, or advertising. We do not use any ad tracking, session replay,
          or behavioral analytics tools.
        </p>

        <h2>AI processing</h2>
        <p>
          When AI content generation features are used (product description rewrites,
          llms.txt content, programmatic page drafts), your product titles and
          descriptions are sent to AI models operated by Anthropic or OpenAI for
          inference. These are transient calls; no shop data is used to train the models.
          AI features are opt-in per action — the app never sends data to AI providers
          without an explicit merchant-initiated action.
        </p>

        <h2>Security</h2>
        <ul>
          <li>HTTPS enforced on all endpoints (TLS 1.2+).</li>
          <li>Access tokens stored server-side only; never exposed to the browser.</li>
          <li>Minimum scopes requested for each feature.</li>
          <li>All code changes tracked in a private GitHub repository with commit-level audit trail.</li>
        </ul>

        <h2>Your rights</h2>
        <ul>
          <li>Request a copy of what we store about your shop.</li>
          <li>Request earlier deletion at any time.</li>
          <li>Uninstall the app and all stored data is purged automatically.</li>
        </ul>
        <p>
          For any request, contact <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
        </p>

        <h2>Changes to this policy</h2>
        <p>
          If we materially change how we handle data, we will update the date at the
          top of this page and announce changes in the app admin. Continued use of the
          app constitutes acceptance of updates.
        </p>

        <h2>Contact</h2>
        <p>
          Nuraveda Lab<br />
          Email: <a href={`mailto:${CONTACT}`}>{CONTACT}</a>
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
