import { authenticate } from "../shopify.server";
import db from "../db.server";

/**
 * GDPR: shop redact.
 *
 * Shopify sends this 48 hours after a shop uninstalls the app. Delete any
 * remaining records tied to the shop. The app/uninstalled webhook already
 * removes the session, but this is the required catch-all.
 */
export const action = async ({ request }) => {
  const { shop, topic, payload } = await authenticate.webhook(request);

  console.log(`[gdpr] ${topic} for ${shop} — purging any remaining shop records`, {
    shop_id: payload?.shop_id,
    shop_domain: payload?.shop_domain,
  });

  // Defensive: ensure no session lingers for this shop
  await db.session.deleteMany({ where: { shop } });

  return new Response();
};
