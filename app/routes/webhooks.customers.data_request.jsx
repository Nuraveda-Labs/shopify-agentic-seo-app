import { authenticate } from "../shopify.server";

/**
 * GDPR: customer data request.
 *
 * Shopify sends this when a store owner / customer requests a report of all
 * personal data held about a given customer. Agentic SEO does NOT store any
 * customer data (see /privacy). We acknowledge the request and respond 200.
 *
 * If the app ever starts holding customer data, this handler must be updated
 * to gather and forward the requested data to Shopify.
 */
export const action = async ({ request }) => {
  const { shop, topic, payload } = await authenticate.webhook(request);

  console.log(`[gdpr] ${topic} for ${shop} — no customer data stored by Agentic SEO`, {
    customer_id: payload?.customer?.id,
    shop_id: payload?.shop_id,
  });

  return new Response();
};
