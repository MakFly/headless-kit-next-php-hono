import { d as defineMiddleware, s as sequence } from './chunks/index_8gu-at5D.mjs';
import './chunks/astro-designed-error-pages_BV7-2Tgy.mjs';
import './chunks/astro/server_C6wb1U6_.mjs';
import 'clsx';

const PUBLIC_PATHS = ["/", "/fr", "/docs", "/api/webhooks", "/api/auth"];
function isPublicPath(pathname) {
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) return true;
  if (pathname.startsWith("/_")) return true;
  if (pathname.match(/\.(css|js|svg|png|jpg|ico|woff2?)$/)) return true;
  return false;
}
function stripLocalePrefix(pathname) {
  if (pathname.startsWith("/fr/")) return pathname.slice(3) || "/";
  if (pathname === "/fr") return "/";
  return pathname;
}
const onRequest$1 = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const canonicalPath = stripLocalePrefix(pathname);
  const localePrefix = pathname.startsWith("/fr") ? "/fr" : "";
  if (isPublicPath(canonicalPath)) {
    context.locals.user = null;
    context.locals.session = null;
    return next();
  }
  const { auth } = await import('./chunks/auth_CM2pB-DO.mjs');
  try {
    const session = await auth.api.getSession({
      headers: context.request.headers
    });
    if (session) {
      context.locals.user = session.user;
      context.locals.session = session.session;
    } else {
      context.locals.user = null;
      context.locals.session = null;
    }
  } catch {
    context.locals.user = null;
    context.locals.session = null;
  }
  if (canonicalPath.startsWith("/auth/") && context.locals.user) {
    return context.redirect(localePrefix + "/dashboard");
  }
  if (canonicalPath.startsWith("/admin")) {
    return context.redirect(localePrefix + "/dashboard");
  }
  if (canonicalPath.startsWith("/dashboard")) {
    if (!context.locals.user) {
      return context.redirect(localePrefix + "/auth/login?redirect=" + encodeURIComponent(pathname));
    }
  }
  return next();
});

const onRequest = sequence(
	
	onRequest$1
	
);

export { onRequest };
