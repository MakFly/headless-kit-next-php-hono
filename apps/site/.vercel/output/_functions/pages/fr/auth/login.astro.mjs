import { b as createAstro, c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead, e as addAttribute } from '../../../chunks/astro/server_C6wb1U6_.mjs';
import { g as getLocale, a as getMessages } from '../../../chunks/SEOHead_BDAgrQOd.mjs';
import { $ as $$Main } from '../../../chunks/main_BctqMkjO.mjs';
export { renderers } from '../../../renderers.mjs';

const $$Astro = createAstro("https://headlesskit.dev");
const prerender = false;
const $$Login = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Login;
  const locale = getLocale(Astro2.currentLocale);
  const t = getMessages(locale);
  return renderTemplate`${renderComponent($$result, "Layout", $$Main, { "title": "Connexion", "description": "Connectez-vous à votre compte Headless Kit" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="relative flex min-h-svh items-center justify-center px-4 py-12"> <div class="relative z-10 w-full max-w-md"> <a${addAttribute(`/fr/`, "href")} class="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"> <span>&larr;</span> ${t.nav.backToHome} </a> ${renderComponent($$result2, "LoginForm", null, { "client:only": "react", "isDev": true, "locale": locale, "client:component-hydration": "only", "client:component-path": "@/components/auth/LoginForm", "client:component-export": "LoginForm" })} </div> </div> ` })}`;
}, "/Users/kev/Documents/lab/sandbox/headless-kit-next-php-hono/apps/site/src/pages/fr/auth/login.astro", void 0);

const $$file = "/Users/kev/Documents/lab/sandbox/headless-kit-next-php-hono/apps/site/src/pages/fr/auth/login.astro";
const $$url = "/fr/auth/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
