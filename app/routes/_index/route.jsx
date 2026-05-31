import { redirect, Form, useLoaderData, Link } from "react-router";
import { login } from "../../shopify.server";
import styles from "./styles.module.css";

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export default function App() {
  const { showForm } = useLoaderData();

  return (
    <div className={styles.index}>
      <div className={styles.content}>
        <h1 className={styles.heading}>Agentic SEO</h1>
        <p className={styles.text}>
          SEO audit and schema for your store: products, FAQ, breadcrumbs,
          llms.txt. Built for both traditional search and AI assistants.
        </p>
        {showForm && (
          <Form className={styles.form} method="post" action="/auth/login">
            <label className={styles.label}>
              <span>Your Shopify store domain</span>
              <input
                className={styles.input}
                type="text"
                name="shop"
                placeholder="your-store.myshopify.com"
              />
            </label>
            <button className={styles.button} type="submit">
              Install Agentic SEO
            </button>
          </Form>
        )}
        <ul className={styles.list}>
          <li>
            <strong>Audit.</strong> One-click pass-fail checklist for structured
            data, breadcrumbs, canonical tags, and og:image — run against your
            live storefront.
          </li>
          <li>
            <strong>Schema coverage.</strong> Product JSON-LD with category,
            material, and additionalProperty. FAQPage and BreadcrumbList wired
            into the theme.
          </li>
          <li>
            <strong>AI search ready.</strong> Generates llms.txt and rewrites
            product descriptions in a format search engines and AI answer tools
            can cite.
          </li>
        </ul>
        <p className={styles.text} style={{ marginTop: "2rem", fontSize: "0.9em" }}>
          <Link to="/privacy">Privacy policy</Link>
          {" · "}
          <Link to="/support">Support</Link>
          {" · "}
          <Link to="/docs">Docs</Link>
        </p>
      </div>
    </div>
  );
}
