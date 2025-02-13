import { request } from "@playwright/test";

export async function authenticate() {
  const context = await request.newContext({
    ignoreHTTPSErrors: true, // Ignore SSL errors for local dev
  });

  // Step 1: Get CSRF Token
  const csrfResponse = await context.get(
    "https://localhost:3000/api/auth/csrf"
  );
  if (!csrfResponse.ok()) {
    throw new Error(
      `Failed to fetch CSRF token: ${csrfResponse.status()} ${await csrfResponse.text()}`
    );
  }

  const csrfData = await csrfResponse.json();
  const csrfToken = csrfData.csrfToken;

  // Step 2: Authenticate via API
  const authResponse = await context.post(
    "https://localhost:3000/api/auth/callback/credentials",
    {
      form: {
        csrfToken,

        redirect: false,
      },
    }
  );

  if (!authResponse.ok()) {
    throw new Error(
      `Authentication failed: ${authResponse.status()} ${await authResponse.text()}`
    );
  }

  const cookies = await context.cookies();
  const authCookie = cookies.find(
    (cookie) => cookie.name === "next-auth.session-token"
  );

  if (!authCookie) {
    throw new Error(
      "No session token found in cookies. Authentication might not have succeeded."
    );
  }
}
