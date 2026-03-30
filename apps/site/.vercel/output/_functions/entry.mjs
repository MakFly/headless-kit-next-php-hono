import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_CrwIzh5n.mjs';
import { manifest } from './manifest_C6TRLdwi.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/404.astro.mjs');
const _page2 = () => import('./pages/api/admin/_---action_.astro.mjs');
const _page3 = () => import('./pages/api/auth/_---all_.astro.mjs');
const _page4 = () => import('./pages/api/checkout.astro.mjs');
const _page5 = () => import('./pages/api/webhooks/stripe.astro.mjs');
const _page6 = () => import('./pages/auth/login.astro.mjs');
const _page7 = () => import('./pages/auth/logout.astro.mjs');
const _page8 = () => import('./pages/auth/register.astro.mjs');
const _page9 = () => import('./pages/checkout/success.astro.mjs');
const _page10 = () => import('./pages/dashboard/admin/licenses/create.astro.mjs');
const _page11 = () => import('./pages/dashboard/admin/licenses.astro.mjs');
const _page12 = () => import('./pages/dashboard/admin/revenue.astro.mjs');
const _page13 = () => import('./pages/dashboard/admin/settings.astro.mjs');
const _page14 = () => import('./pages/dashboard/admin/users/_id_.astro.mjs');
const _page15 = () => import('./pages/dashboard/admin/users.astro.mjs');
const _page16 = () => import('./pages/dashboard/admin.astro.mjs');
const _page17 = () => import('./pages/dashboard/billing.astro.mjs');
const _page18 = () => import('./pages/dashboard/downloads.astro.mjs');
const _page19 = () => import('./pages/dashboard/license.astro.mjs');
const _page20 = () => import('./pages/dashboard.astro.mjs');
const _page21 = () => import('./pages/docs/_---slug_.astro.mjs');
const _page22 = () => import('./pages/fr/auth/login.astro.mjs');
const _page23 = () => import('./pages/fr/auth/register.astro.mjs');
const _page24 = () => import('./pages/fr.astro.mjs');
const _page25 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["../../node_modules/.bun/astro@5.18.1+212883ea1f8535a0/node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/404.astro", _page1],
    ["src/pages/api/admin/[...action].ts", _page2],
    ["src/pages/api/auth/[...all].ts", _page3],
    ["src/pages/api/checkout.ts", _page4],
    ["src/pages/api/webhooks/stripe.ts", _page5],
    ["src/pages/auth/login.astro", _page6],
    ["src/pages/auth/logout.astro", _page7],
    ["src/pages/auth/register.astro", _page8],
    ["src/pages/checkout/success.astro", _page9],
    ["src/pages/dashboard/admin/licenses/create.astro", _page10],
    ["src/pages/dashboard/admin/licenses.astro", _page11],
    ["src/pages/dashboard/admin/revenue.astro", _page12],
    ["src/pages/dashboard/admin/settings.astro", _page13],
    ["src/pages/dashboard/admin/users/[id].astro", _page14],
    ["src/pages/dashboard/admin/users.astro", _page15],
    ["src/pages/dashboard/admin/index.astro", _page16],
    ["src/pages/dashboard/billing.astro", _page17],
    ["src/pages/dashboard/downloads.astro", _page18],
    ["src/pages/dashboard/license.astro", _page19],
    ["src/pages/dashboard/index.astro", _page20],
    ["src/pages/docs/[...slug].astro", _page21],
    ["src/pages/fr/auth/login.astro", _page22],
    ["src/pages/fr/auth/register.astro", _page23],
    ["src/pages/fr/index.astro", _page24],
    ["src/pages/index.astro", _page25]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_astro-internal_middleware.mjs')
});
const _args = {
    "middlewareSecret": "a940c8fd-8858-4902-80c6-b0747a0125e8",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };
