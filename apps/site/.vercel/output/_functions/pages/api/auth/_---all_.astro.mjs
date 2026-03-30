import { auth } from '../../../chunks/auth_CM2pB-DO.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const handler = async (ctx) => {
  return auth.handler(ctx.request);
};
const GET = handler;
const POST = handler;
const PUT = handler;
const PATCH = handler;
const DELETE = handler;

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  GET,
  PATCH,
  POST,
  PUT,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
