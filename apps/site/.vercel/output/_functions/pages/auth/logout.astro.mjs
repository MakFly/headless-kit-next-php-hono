import { b as createAstro, c as createComponent } from '../../chunks/astro/server_C6wb1U6_.mjs';
import 'clsx';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("https://headlesskit.dev");
const prerender = false;
const $$Logout = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Logout;
  const { auth } = await import('../../chunks/auth_CM2pB-DO.mjs');
  try {
    await auth.api.signOut({
      headers: Astro2.request.headers,
      body: {}
    });
  } catch {
  }
  Astro2.cookies.delete("better-auth.session_token", { path: "/" });
  return Astro2.redirect("/");
}, "/Users/kev/Documents/lab/sandbox/headless-kit-next-php-hono/apps/site/src/pages/auth/logout.astro", void 0);

const $$file = "/Users/kev/Documents/lab/sandbox/headless-kit-next-php-hono/apps/site/src/pages/auth/logout.astro";
const $$url = "/auth/logout";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Logout,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
