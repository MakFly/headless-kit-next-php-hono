import { b as createAstro, c as createComponent, a as renderTemplate, u as unescapeHTML } from './astro/server_C6wb1U6_.mjs';
import 'clsx';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://headlesskit.dev");
const $$JsonLd = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$JsonLd;
  const { data } = Astro2.props;
  return renderTemplate(_a || (_a = __template(['<script type="application/ld+json">', "<\/script>"])), unescapeHTML(JSON.stringify(data)));
}, "/Users/kev/Documents/lab/sandbox/headless-kit-next-php-hono/apps/site/src/components/JsonLd.astro", void 0);

export { $$JsonLd as $ };
