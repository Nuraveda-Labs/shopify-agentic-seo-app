import { authenticate } from "../shopify.server";

/**
 * GDPR: customer redact.
 *
 * Shopify sends this 10+ days after a customer requests deletion. Agentic SEO
 * does NOT store any customer data (see /privacy), so there is nothing to
 * redact. Acknowledge and respond 200.
 *
 * If the app ever starts holding customer data, this handler must be updated
 * to delete all records associated with payload.customer.id.
 */
export const action = async ({ request }) => {
  const { shop, topic, payload } = await authenticate.webhook(request);

  console.log(`[gdpr] ${topic} for ${shop} — no customer data to redact`, {
    customer_id: payload?.customer?.id,
  });

  return new Response();
};
