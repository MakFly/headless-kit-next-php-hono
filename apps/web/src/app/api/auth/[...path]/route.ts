/**
 * for Better BFF Route HandlerAuth
 *
 * Proxies /api/auth/* requests to Laravel (BetterAuth).
 * These routes don't require HMAC signing (unlike /api/v1/*).
 */

import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createLogger } from "@/lib/logger";
import {
  AUTH_BACKEND_COOKIE,
  getCookieNamesForBackend,
  resolveBackend,
} from "@/lib/auth/backend-context";

const log = createLogger("bff-auth-proxy");

type RouteParams = {
  params: Promise<{ path: string[] }>;
};

const LARAVEL_API_URL = process.env.LARAVEL_API_URL || "http://localhost:8000";

function setNoStoreHeaders(headers: Headers): void {
  headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, max-age=0",
  );
  headers.set("Pragma", "no-cache");
}

function getRequestId(request: NextRequest): string {
  return request.headers.get("x-request-id") || crypto.randomUUID();
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  return handleRequest(request, "GET", await params);
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  return handleRequest(request, "POST", await params);
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  return handleRequest(request, "PUT", await params);
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  return handleRequest(request, "PATCH", await params);
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  return handleRequest(request, "DELETE", await params);
}

async function handleRequest(
  request: NextRequest,
  method: string,
  params: { path: string[] },
): Promise<NextResponse> {
  const requestId = getRequestId(request);
  const path = params.path.join("/");
  const url = new URL(request.url);

  const backendUrl = `${LARAVEL_API_URL}/api/auth/${path}${url.search}`;

  log.info(`${method} /api/auth/${path}`, { requestId });

  const cookieStore = await cookies();
  const backend = resolveBackend(cookieStore.get(AUTH_BACKEND_COOKIE)?.value);
  const cookieNames = getCookieNamesForBackend(backend);
  const authToken = cookieStore.get(cookieNames.accessToken)?.value;

  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");
  headers.set("X-Request-ID", requestId);

  if (authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }

  for (const [key, value] of request.headers.entries()) {
    if (
      !["content-type", "accept", "authorization", "x-request-id"].includes(
        key.toLowerCase(),
      )
    ) {
      headers.set(key, value);
    }
  }

  let body: string | undefined;
  if (method !== "GET" && method !== "HEAD") {
    body = await request.text();
  }

  try {
    const response = await fetch(backendUrl, {
      method,
      headers,
      body,
      redirect: "manual",
    });

    const responseHeaders = new Headers();
    setNoStoreHeaders(responseHeaders);

    for (const [key, value] of response.headers.entries()) {
      if (
        !["content-encoding", "content-length", "transfer-encoding"].includes(
          key.toLowerCase(),
        )
      ) {
        responseHeaders.set(key, value);
      }
    }

    const responseBody = await response.text();

    if (response.status >= 400) {
      log.warn(`Backend error: ${response.status}`, {
        requestId,
        status: response.status,
        body: responseBody.substring(0, 500),
      });
    }

    return new NextResponse(responseBody, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    log.error("Proxy error", { requestId, error: String(error) });

    return NextResponse.json(
      {
        error: "Backend unavailable",
        message: "Authentication service is temporarily unavailable",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
