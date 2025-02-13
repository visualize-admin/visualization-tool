import { request } from "@playwright/test";

export async function authenticate() {
  const context = await request.newContext({
    ignoreHTTPSErrors: true,
  });

  const csrfResponse = await context.get(
    "https://localhost:3000/api/auth/csrf"
  );
  const csrfData = await csrfResponse.json();
  const csrfToken = csrfData.csrfToken;

  const response = await context.post(
    "https://localhost:3000/api/auth/callback/credentials",
    {
      form: {
        csrfToken,
        redirect: false,
      },
    }
  );

  if (!response.ok()) {
    throw new Error(
      `Authentication failed: ${response.status()} ${await response.text()}`
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
