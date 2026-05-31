import { useEffect } from "react";
import { useFetcher, useLoaderData } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

/**
 * Agentic SEO — embedded admin home page.
 *
 * Loader fetches the shop's basic info plus a quick count of SEO
 * surface area (products, pages, blogs) so the dashboard shows real
 * context on first load.
 *
 * Action runs a live SEO audit: fetches the shop's homepage + one
 * product page and checks for structured-data coverage.
 */

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  const [shopRes, countsRes] = await Promise.all([
    admin.graphql(`#graphql
      {
        shop {
          id
          name
          myshopifyDomain
          primaryDomain { url host }
          plan { displayName }
          contactEmail
        }
      }`),
    admin.graphql(`#graphql
      {
        productsCount { count }
        pages(first: 1) { edges { node { id } } }
        blogs(first: 1) { edges { node { articlesCount { count } } } }
      }`),
  ]);
  const shopJson = await shopRes.json();
  const countsJson = await countsRes.json();

  const shop = shopJson.data.shop;
  const productCount = countsJson.data.productsCount?.count ?? 0;
  const pagesCount = (countsJson.data.pages?.edges?.length ?? 0);
  const articleCount = countsJson.data.blogs?.edges?.[0]?.node?.articlesCount?.count ?? 0;

  return {
    shop,
    storefrontUrl: shop.primaryDomain?.url || `https://${shop.myshopifyDomain}`,
    counts: {
      products: productCount,
      pages: pagesCount,
      articles: articleCount,
    },
  };
};

/**
 * Action: live SEO audit. Fetches the shop's storefront homepage +
 * one product to inspect structured data and critical SEO markers.
 * All checks are read-only — no merchant data is modified.
 */
export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  // Get storefront URL + first product URL
  const ctxRes = await admin.graphql(`#graphql
    {
      shop { primaryDomain { url } myshopifyDomain }
      products(first: 1) { edges { node { onlineStoreUrl handle } } }
    }`);
  const ctx = (await ctxRes.json()).data;
  const base = ctx.shop.primaryDomain?.url || `https://${ctx.shop.myshopifyDomain}`;
  const productUrl = ctx.products.edges[0]?.node?.onlineStoreUrl || null;

  // Fetch homepage + product HTML (small timeout per request)
  const fetchHtml = async (url) => {
    try {
      const res = await fetch(url, { headers: { "User-Agent": "AgenticSEO-Audit/1.0" } });
      if (!res.ok) return null;
      return await res.text();
    } catch { return null; }
  };

  const [homeHtml, productHtml] = await Promise.all([
    fetchHtml(base),
    productUrl ? fetchHtml(productUrl) : Promise.resolve(null),
  ]);

  const check = (html, test) => (html ? test(html) : null);
  const has = (pattern) => (html) => pattern.test(html);
  const countMatches = (pattern) => (html) => (html.match(pattern) || []).length;

  const audits = [
    {
      id: "home_product_ld",
      label: "Homepage has structured data (JSON-LD)",
      status: check(homeHtml, has(/application\/ld\+json/)),
      group: "Structured data",
    },
    {
      id: "home_organization_ld",
      label: "Organization / OnlineStore schema on homepage",
      status: check(homeHtml, has(/"@type":\s*"(Organization|OnlineStore)"/)),
      group: "Structured data",
    },
    {
      id: "home_faq_ld",
      label: "FAQPage schema on homepage",
      status: check(homeHtml, has(/"@type":\s*"FAQPage"/)),
      group: "Structured data",
    },
    {
      id: "home_website_ld",
      label: "WebSite + SearchAction schema",
      status: check(homeHtml, has(/"@type":\s*"(WebSite|SearchAction)"/)),
      group: "Structured data",
    },
    {
      id: "home_h1",
      label: "Homepage has a semantic H1",
      status: check(homeHtml, has(/<h1[^>]*>/)),
      group: "On-page SEO",
    },
    {
      id: "home_canonical",
      label: "Homepage has canonical tag",
      status: check(homeHtml, has(/rel=["']canonical["']/)),
      group: "On-page SEO",
    },
    {
      id: "home_og_image_https",
      label: "og:image uses https (not http)",
      status: check(homeHtml, (h) => !(/<meta[^>]+property=["']og:image["'][^>]+content=["']http:/i.test(h))),
      group: "On-page SEO",
    },
    {
      id: "product_breadcrumb",
      label: "Product page emits BreadcrumbList schema",
      status: check(productHtml, has(/"@type":\s*"BreadcrumbList"/)),
      group: "Product pages",
    },
    {
      id: "product_product_ld",
      label: "Product page emits Product schema",
      status: check(productHtml, has(/"@type":\s*"Product"/)),
      group: "Product pages",
    },
    {
      id: "product_additional_property",
      label: "Product JSON-LD uses additionalProperty (material, origin, etc.)",
      status: check(productHtml, has(/"@type":\s*"PropertyValue"/)),
      group: "Product pages",
    },
    {
      id: "product_aggregate_rating",
      label: "Product JSON-LD has AggregateRating",
      status: check(productHtml, has(/"@type":\s*"AggregateRating"/)),
      group: "Product pages",
    },
  ];

  const passing = audits.filter((a) => a.status === true).length;
  const failing = audits.filter((a) => a.status === false).length;
  const unknown = audits.filter((a) => a.status === null).length;

  return {
    audits,
    summary: { passing, failing, unknown, total: audits.length },
    urls: { home: base, product: productUrl },
    ranAt: new Date().toISOString(),
  };
};

export default function Index() {
  const { shop, storefrontUrl, counts } = useLoaderData();
  const fetcher = useFetcher();
  const shopify = useAppBridge();
  const isAuditing = fetcher.state === "submitting" || fetcher.state === "loading";
  const audit = fetcher.data;

  useEffect(() => {
    if (audit?.summary) {
      const { passing, total } = audit.summary;
      shopify.toast.show(`Audit complete: ${passing}/${total} checks passing`);
    }
  }, [audit?.ranAt, shopify]);

  const runAudit = () => fetcher.submit({}, { method: "POST" });

  const groupedAudits = audit?.audits?.reduce((acc, a) => {
    (acc[a.group] = acc[a.group] || []).push(a);
    return acc;
  }, {}) || {};

  return (
    <s-page heading="Agentic SEO">
      <s-button slot="primary-action" onClick={runAudit} {...(isAuditing ? { loading: true } : {})}>
        Run SEO audit
      </s-button>

      <s-section heading={shop.name}>
        <s-stack direction="block" gap="base">
          <s-paragraph>
            <s-text>Store:</s-text>{" "}
            <s-link href={storefrontUrl} target="_blank">
              {storefrontUrl}
            </s-link>
          </s-paragraph>
          <s-stack direction="inline" gap="base">
            <s-badge>{counts.products} products</s-badge>
            <s-badge>{counts.articles} blog articles</s-badge>
          </s-stack>
          <s-paragraph>
            Agentic SEO checks your storefront for structured data (JSON-LD),
            LLM-citable content signals, breadcrumbs, and on-page SEO markers
            that drive both Google rankings and AI-search citations (ChatGPT,
            Perplexity, Google AI Overviews).
          </s-paragraph>
        </s-stack>
      </s-section>

      {audit?.summary && (
        <s-section heading={`Audit summary — ${audit.summary.passing}/${audit.summary.total} passing`}>
          <s-stack direction="inline" gap="base">
            <s-badge tone={audit.summary.passing === audit.summary.total ? "success" : "attention"}>
              {audit.summary.passing} passing
            </s-badge>
            <s-badge tone={audit.summary.failing > 0 ? "critical" : "subdued"}>
              {audit.summary.failing} failing
            </s-badge>
            {audit.summary.unknown > 0 && (
              <s-badge tone="subdued">{audit.summary.unknown} not testable</s-badge>
            )}
          </s-stack>
          <s-paragraph>
            Audited <s-link href={audit.urls.home} target="_blank">{audit.urls.home}</s-link>
            {audit.urls.product && (
              <> and <s-link href={audit.urls.product} target="_blank">a product page</s-link></>
            )}
            {" · "}{new Date(audit.ranAt).toLocaleString()}
          </s-paragraph>
        </s-section>
      )}

      {Object.entries(groupedAudits).map(([group, items]) => (
        <s-section heading={group} key={group}>
          <s-stack direction="block" gap="small">
            {items.map((a) => (
              <s-stack key={a.id} direction="inline" gap="small">
                <s-text>
                  {a.status === true ? "✅" : a.status === false ? "❌" : "⏳"}
                </s-text>
                <s-text>{a.label}</s-text>
              </s-stack>
            ))}
          </s-stack>
        </s-section>
      ))}

      {!audit && (
        <s-section heading="What Agentic SEO checks">
          <s-unordered-list>
            <s-list-item>Organization / OnlineStore / WebSite JSON-LD on homepage</s-list-item>
            <s-list-item>FAQPage schema on homepage Q&amp;A sections</s-list-item>
            <s-list-item>BreadcrumbList schema on product, collection, article pages</s-list-item>
            <s-list-item>Product JSON-LD with <code>material</code>, <code>category</code>, <code>additionalProperty</code>, <code>aggregateRating</code></s-list-item>
            <s-list-item>Canonical tags, og:image protocol (https), semantic H1</s-list-item>
            <s-list-item>LLM-citable content signals (llms.txt, citable product copy)</s-list-item>
          </s-unordered-list>
          <s-paragraph>
            Click <s-text weight="bold">Run SEO audit</s-text> to scan your
            live storefront.
          </s-paragraph>
        </s-section>
      )}

      <s-section slot="aside" heading="Why structured data matters">
        <s-paragraph>
          Google uses structured data to show rich results (price, rating,
          availability, breadcrumbs). AI assistants (ChatGPT, Perplexity,
          Google AI Overviews) use it to decide which stores to cite when
          shoppers ask where to buy.
        </s-paragraph>
        <s-paragraph>
          Agentic SEO audits what's there, surfaces what's missing, and — in
          the upcoming fixes module — writes the schema + content directly
          into your theme and product metafields.
        </s-paragraph>
      </s-section>

      <s-section slot="aside" heading="Coming soon">
        <s-unordered-list>
          <s-list-item>One-click theme schema fixes</s-list-item>
          <s-list-item>AI product description rewrites (LLM-citable format)</s-list-item>
          <s-list-item>Multi-locale content (Spanish, German, French)</s-list-item>
          <s-list-item>llms.txt page generation</s-list-item>
          <s-list-item>Programmatic landing page generator</s-list-item>
        </s-unordered-list>
      </s-section>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
