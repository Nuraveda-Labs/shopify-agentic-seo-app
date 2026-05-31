import { Link } from "react-router";

export const meta = () => [
  { title: "Documentation — Agentic SEO" },
  { name: "description", content: "Install, audit, and ship SEO improvements with Agentic SEO." },
];

const CONTACT = "help.nuraveda@gmail.com";

export default function Docs() {
  return (
    <main style={styles.main}>
      <nav style={styles.nav}>
        <Link to="/" style={styles.navLink}>Agentic SEO</Link>
        <span> · </span>
        <Link to="/privacy" style={styles.navLink}>Privacy</Link>
        <span> · </span>
        <Link to="/support" style={styles.navLink}>Support</Link>
        <span> · </span>
        <Link to="/docs" style={styles.navLinkActive}>Docs</Link>
      </nav>

      <article style={styles.article}>
        <h1>Documentation</h1>
        <p>
          Agentic SEO is an SEO audit and schema app for Shopify. It runs against
          your live storefront, surfaces what&rsquo;s missing, and — with merchant-initiated
          actions — applies fixes through the Admin API and theme layer.
        </p>

        <h2>Getting started</h2>
        <ol>
          <li>Install Agentic SEO from the Shopify App Store.</li>
          <li>Approve the requested scopes. See <Link to="/privacy">Privacy policy</Link> for what each is used for.</li>
          <li>Open the app from your Shopify admin sidebar. The dashboard loads with your shop name, storefront URL, plan, and product counts.</li>
          <li>Click <strong>Run SEO audit</strong> (top right). Results appear within a few seconds.</li>
        </ol>

        <h2>Understanding the audit</h2>
        <p>Each audit fetches the live homepage and one product page, then checks:</p>

        <h3>Structured data</h3>
        <ul>
          <li><strong>JSON-LD present</strong> — at least one <code>application/ld+json</code> script on the homepage.</li>
          <li><strong>Organization / OnlineStore</strong> — the brand entity that grounds all other schema.</li>
          <li><strong>FAQPage</strong> — required for Q&amp;A rich results on Google and AI citation on ChatGPT / Perplexity / Google AI Overviews.</li>
          <li><strong>WebSite / SearchAction</strong> — enables the in-search sitelinks search box.</li>
        </ul>

        <h3>On-page SEO</h3>
        <ul>
          <li><strong>Semantic H1</strong> — every page should have one content-describing H1, not a logo-wrapped H1.</li>
          <li><strong>Canonical tag</strong> — declares the preferred URL; prevents duplicate content penalties.</li>
          <li><strong>og:image uses https</strong> — many themes still use http-prefixed og:image values; social crawlers and some search engines skip these.</li>
        </ul>

        <h3>Product pages</h3>
        <ul>
          <li><strong>BreadcrumbList</strong> — navigation structure that appears in search results and helps AI answer tools understand your taxonomy.</li>
          <li><strong>Product schema</strong> — core Product JSON-LD with offers, price, availability.</li>
          <li><strong>additionalProperty</strong> — richer product attributes (material, origin, certification) that Google uses for product-specific rich results and AI tools use for citations.</li>
          <li><strong>AggregateRating</strong> — review stars in search results.</li>
        </ul>

        <h2>Scopes</h2>
        <table style={styles.table}>
          <thead>
            <tr><th style={styles.th}>Scope</th><th style={styles.th}>Used for</th></tr>
          </thead>
          <tbody>
            <tr><td style={styles.td}><code>write_products</code></td><td style={styles.td}>Rename handles, update descriptions, set metafields (merchant-initiated)</td></tr>
            <tr><td style={styles.td}><code>write_content</code></td><td style={styles.td}>Create or update pages including the llms.txt content page</td></tr>
            <tr><td style={styles.td}><code>write_files</code></td><td style={styles.td}>Upload media for alt-text workflows</td></tr>
            <tr><td style={styles.td}><code>write_themes</code></td><td style={styles.td}>Apply on-page SEO fixes to unpublished duplicate themes; never the live theme without approval</td></tr>
            <tr><td style={styles.td}><code>write_translations</code></td><td style={styles.td}>Push translated content across locales</td></tr>
            <tr><td style={styles.td}><code>write_inventory</code></td><td style={styles.td}>Surface stock in structured data offers</td></tr>
            <tr><td style={styles.td}><code>write_online_store_navigation</code></td><td style={styles.td}>Create 301 redirects when products are renamed</td></tr>
            <tr><td style={styles.td}><code>read_locales</code></td><td style={styles.td}>Read enabled locales for multi-language coverage</td></tr>
            <tr><td style={styles.td}><code>read_product_listings</code></td><td style={styles.td}>Read listing coverage</td></tr>
          </tbody>
        </table>

        <h2>Safety defaults</h2>
        <ul>
          <li>Theme edits always target an unpublished duplicate. Publish only on explicit approval.</li>
          <li>Product handle renames automatically create a 301 redirect from the old URL.</li>
          <li>All admin actions are logged per shop and reversible via <code>git revert</code> (for theme code) or Shopify&rsquo;s product history.</li>
        </ul>

        <h2>Frequently asked questions</h2>

        <h3>Will Agentic SEO access customer data?</h3>
        <p>
          No. Agentic SEO does not request <code>read_customers</code>, <code>read_orders</code>, or any
          protected customer data scopes. See <Link to="/privacy">Privacy policy</Link>.
        </p>

        <h3>Does the app work with custom themes (non-Dawn)?</h3>
        <p>
          Yes. The audit reads the rendered HTML — it&rsquo;s theme-agnostic. Theme fixes,
          where applied, work on any OS 2.0 theme via the standard sections and snippets
          structure.
        </p>

        <h3>Does the app support multi-locale stores?</h3>
        <p>
          Audit coverage is single-locale today. Translation workflows (Spanish, German,
          French, etc.) are rolling out — you&rsquo;ll see them in the app once available.
        </p>

        <h3>What happens to my data when I uninstall?</h3>
        <p>
          Your shop&rsquo;s session (access token + shop identifier) is deleted within seconds
          via the Shopify uninstall webhook. No catalog data is cached, so there&rsquo;s
          nothing else to purge. See <Link to="/privacy">Privacy policy</Link>.
        </p>

        <h3>Is there a paid plan?</h3>
        <p>
          Agentic SEO is free during the current review phase. Paid plans may be introduced
          in the future with at least 30 days&rsquo; notice and always with the Shopify
          Billing API.
        </p>

        <h2>Need help?</h2>
        <p>
          Email <a href={`mailto:${CONTACT}`}>{CONTACT}</a> or visit the <Link to="/support">Support</Link> page.
        </p>
      </article>
    </main>
  );
}

const styles = {
  main: {
    maxWidth: "820px",
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
  table: { width: "100%", borderCollapse: "collapse", marginBottom: "1rem" },
  th: { textAlign: "left", padding: "0.4rem 0.6rem", borderBottom: "2px solid #e5e5e5", fontSize: "0.9em" },
  td: { padding: "0.4rem 0.6rem", borderBottom: "1px solid #f0f0f0", fontSize: "0.9em", verticalAlign: "top" },
};
