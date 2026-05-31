#!/usr/bin/env node
/**
 * sh-admin — Shopify Admin CLI for Nuraveda Lab
 *
 * Reads offline access tokens from the local Prisma Session table
 * and calls the Shopify Admin GraphQL API.
 *
 * Usage:
 *   sh-admin <shop> <resource> <action> [--flag value] [...]
 *
 * Shop can be short form (e.g., "mokshya") or full domain.
 * Shop aliases configured in ./shops.json (optional).
 *
 * Examples:
 *   sh-admin mokshya products list
 *   sh-admin mokshya products update --id gid://shopify/Product/123 --vendor "Mokshya"
 *   sh-admin mokshya metafield-def create --namespace custom --key mukhi --type single_line_text_field --name "Mukhi"
 *   sh-admin mokshya pages create --title "About" --handle about --body-html @about.html --published
 *   sh-admin mokshya redirects create --from "/products/old" --to "/products/new"
 *   sh-admin mokshya shop-metafield set --namespace seo --key homepage_h1 --type single_line_text_field --value "Authentic Rudraksha..."
 */

import { PrismaClient } from '@prisma/client';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();
const API_VERSION = '2024-10';

// Shop aliases — create cli/shops.json ({ "alias": "store.myshopify.com" }) to add shortcuts.
// File is gitignored so client domains never leak into the repo.
const ALIASES_PATH = resolve(__dirname, 'shops.json');
const ALIASES = existsSync(ALIASES_PATH)
  ? JSON.parse(readFileSync(ALIASES_PATH, 'utf8'))
  : {};

function resolveShop(arg) {
  if (!arg) die('Shop required. Usage: sh-admin <shop> <resource> <action>');
  if (arg.includes('.myshopify.com')) return arg;
  if (ALIASES[arg]) return ALIASES[arg];
  return `${arg}.myshopify.com`;
}

function die(msg, code = 1) {
  console.error(`sh-admin: ${msg}`);
  process.exit(code);
}

function parseFlags(argv) {
  const flags = {};
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith('--')) {
        flags[key] = true;
      } else {
        flags[key] = next.startsWith('@')
          ? readFileSync(next.slice(1), 'utf8')
          : next;
        i++;
      }
    } else {
      positional.push(a);
    }
  }
  return { flags, positional };
}

async function getToken(shop) {
  const sess = await prisma.session.findFirst({
    where: { shop, isOnline: false },
    orderBy: { expires: 'desc' },
  });
  if (!sess) die(`No offline session for ${shop}. Install the app first.`);
  return sess.accessToken;
}

async function gql(shop, query, variables = {}) {
  const token = await getToken(shop);
  const res = await fetch(`https://${shop}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'X-Shopify-Access-Token': token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) {
    console.error('GraphQL errors:', JSON.stringify(json.errors, null, 2));
    process.exit(1);
  }
  return json.data;
}

async function mutate(shop, mutation, variables, userErrorsPath) {
  const data = await gql(shop, mutation, variables);
  const node = userErrorsPath.split('.').reduce((o, k) => o?.[k], data);
  if (node?.userErrors?.length) {
    console.error('userErrors:', JSON.stringify(node.userErrors, null, 2));
    process.exit(1);
  }
  return data;
}

// ─── Commands ───────────────────────────────────────────────

const cmds = {
  'products list': async (shop) => {
    const data = await gql(shop, `{
      products(first: 50) {
        edges { node {
          id title handle vendor productType status
          variants(first: 5) { edges { node { id sku price } } }
        } }
      }
    }`);
    for (const { node: p } of data.products.edges) {
      console.log(`${p.id}`);
      console.log(`  title:  ${p.title}`);
      console.log(`  handle: ${p.handle}`);
      console.log(`  vendor: ${p.vendor}`);
      console.log(`  type:   ${p.productType || '(none)'}`);
      console.log(`  status: ${p.status}`);
      for (const { node: v } of p.variants.edges) {
        console.log(`    variant ${v.id} sku=${v.sku || '-'} $${v.price}`);
      }
      console.log();
    }
  },

  'products update': async (shop, { id, vendor, type, handle, 'body-html': bodyHtml, title, status }) => {
    if (!id) die('--id required (gid://shopify/Product/...)');
    const input = { id };
    if (vendor != null) input.vendor = vendor;
    if (type != null) input.productType = type;
    if (handle != null) input.handle = handle;
    if (bodyHtml != null) input.descriptionHtml = bodyHtml;
    if (title != null) input.title = title;
    if (status != null) input.status = status.toUpperCase();
    const data = await mutate(shop, `mutation($input: ProductInput!) {
      productUpdate(input: $input) {
        product { id title handle vendor productType status }
        userErrors { field message }
      }
    }`, { input }, 'productUpdate');
    console.log(JSON.stringify(data.productUpdate.product, null, 2));
  },

  'products set-metafield': async (shop, { id, namespace, key, type, value }) => {
    if (!id || !namespace || !key || !type || value == null) die('--id --namespace --key --type --value all required');
    const data = await mutate(shop, `mutation($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields { id namespace key value }
        userErrors { field message }
      }
    }`, {
      metafields: [{ ownerId: id, namespace, key, type, value }]
    }, 'metafieldsSet');
    console.log(JSON.stringify(data.metafieldsSet.metafields, null, 2));
  },

  'metafield-def create': async (shop, { namespace, key, type, name, 'owner-type': ownerType = 'PRODUCT', description }) => {
    if (!namespace || !key || !type || !name) die('--namespace --key --type --name required');
    const data = await mutate(shop, `mutation($def: MetafieldDefinitionInput!) {
      metafieldDefinitionCreate(definition: $def) {
        createdDefinition { id name namespace key type { name } ownerType }
        userErrors { field message code }
      }
    }`, {
      def: { namespace, key, type, name, description, ownerType }
    }, 'metafieldDefinitionCreate');
    console.log(JSON.stringify(data.metafieldDefinitionCreate.createdDefinition, null, 2));
  },

  'pages list': async (shop) => {
    const data = await gql(shop, `{
      pages(first: 50) {
        edges { node { id title handle isPublished templateSuffix bodySummary } }
      }
    }`);
    for (const { node: p } of data.pages.edges) {
      console.log(`${p.id} ${p.handle} "${p.title}" published=${p.isPublished} template=${p.templateSuffix || '-'}`);
    }
  },

  'pages create': async (shop, { title, handle, 'body-html': bodyHtml, 'template-suffix': templateSuffix, published }) => {
    if (!title) die('--title required');
    const input = { title };
    if (handle) input.handle = handle;
    if (bodyHtml != null && bodyHtml !== '') input.body = String(bodyHtml);
    if (templateSuffix) input.templateSuffix = templateSuffix;
    if (published) input.isPublished = true;
    const data = await mutate(shop, `mutation($page: PageCreateInput!) {
      pageCreate(page: $page) {
        page { id title handle isPublished templateSuffix }
        userErrors { field message code }
      }
    }`, { page: input }, 'pageCreate');
    console.log(JSON.stringify(data.pageCreate.page, null, 2));
  },

  'pages update': async (shop, { id, title, handle, 'body-html': bodyHtml, 'template-suffix': templateSuffix, published }) => {
    if (!id) die('--id required (gid://shopify/Page/...)');
    const input = {};
    if (title != null) input.title = title;
    if (handle != null) input.handle = handle;
    if (bodyHtml != null) input.body = bodyHtml;
    if (templateSuffix != null) input.templateSuffix = templateSuffix;
    if (published != null) input.isPublished = published === true || published === 'true';
    const data = await mutate(shop, `mutation($id: ID!, $page: PageUpdateInput!) {
      pageUpdate(id: $id, page: $page) {
        page { id title handle isPublished templateSuffix }
        userErrors { field message code }
      }
    }`, { id, page: input }, 'pageUpdate');
    console.log(JSON.stringify(data.pageUpdate.page, null, 2));
  },

  'redirects create': async (shop, { from, to }) => {
    if (!from || !to) die('--from and --to required');
    const data = await mutate(shop, `mutation($input: UrlRedirectInput!) {
      urlRedirectCreate(urlRedirect: $input) {
        urlRedirect { id path target }
        userErrors { field message code }
      }
    }`, { input: { path: from, target: to } }, 'urlRedirectCreate');
    console.log(JSON.stringify(data.urlRedirectCreate.urlRedirect, null, 2));
  },

  'shop-metafield set': async (shop, { namespace, key, type, value }) => {
    if (!namespace || !key || !type || value == null) die('--namespace --key --type --value required');
    const shopData = await gql(shop, `{ shop { id } }`);
    const data = await mutate(shop, `mutation($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields { id namespace key value }
        userErrors { field message code }
      }
    }`, {
      metafields: [{ ownerId: shopData.shop.id, namespace, key, type, value }]
    }, 'metafieldsSet');
    console.log(JSON.stringify(data.metafieldsSet.metafields, null, 2));
  },

  'images alt': async (shop, { 'product-id': productId, 'media-id': mediaId, alt }) => {
    if (!productId || !mediaId || alt == null) die('--product-id --media-id --alt required');
    const data = await mutate(shop, `mutation($productId: ID!, $media: [UpdateMediaInput!]!) {
      productUpdateMedia(productId: $productId, media: $media) {
        media { ... on MediaImage { id alt } }
        mediaUserErrors { field message }
      }
    }`, {
      productId,
      media: [{ id: mediaId, alt }]
    }, 'productUpdateMedia');
    console.log(JSON.stringify(data.productUpdateMedia.media, null, 2));
  },

  'products media': async (shop, { id }) => {
    if (!id) die('--id (product gid) required');
    const data = await gql(shop, `query($id: ID!) {
      product(id: $id) {
        id title
        media(first: 20) { edges { node { ... on MediaImage { id alt image { url } } } } }
      }
    }`, { id });
    console.log(JSON.stringify(data.product, null, 2));
  },

  'whoami': async (shop) => {
    const data = await gql(shop, `{ shop { id name email myshopifyDomain plan { displayName } } }`);
    console.log(JSON.stringify(data.shop, null, 2));
  },

  'raw': async (shop, { query, variables }) => {
    if (!query) die('--query required');
    const vars = variables ? JSON.parse(variables) : {};
    const data = await gql(shop, query, vars);
    console.log(JSON.stringify(data, null, 2));
  },
};

// ─── Dispatch ───────────────────────────────────────────────

const [,, shopArg, resource, action, ...rest] = process.argv;
if (!shopArg || shopArg === '--help' || shopArg === '-h') {
  console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 25).join('\n'));
  process.exit(0);
}
const shop = resolveShop(shopArg);
// Try two-word command first, fall back to one-word
let cmdKey = `${resource} ${action}`;
let cmd = cmds[cmdKey];
let flagsRest = rest;
if (!cmd && cmds[resource]) {
  cmdKey = resource;
  cmd = cmds[resource];
  flagsRest = action ? [action, ...rest] : rest;
}
if (!cmd) {
  console.error(`Unknown command: ${resource}${action ? ' ' + action : ''}`);
  console.error('Available commands:');
  Object.keys(cmds).forEach(k => console.error(`  ${k}`));
  process.exit(2);
}
const { flags } = parseFlags(flagsRest);
await cmd(shop, flags);
await prisma.$disconnect();
