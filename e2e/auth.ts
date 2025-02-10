import * as path from "node:path";

import { Page, chromium } from "@playwright/test";
import { type Session } from "next-auth";
import { JWT } from "next-auth/jwt";

interface TestUser {
  id: number;
  email: string;
  name: string;
  sub: string;
  sessionToken?: string;
}

interface MockAuthContext {
  session: Session;
  token: JWT;
}

const DEFAULT_TEST_USER: TestUser = {
  id: 1,
  email: "test@example.com",
  name: "Test User",
  sub: "test-sub-id",
  sessionToken: "04456e41-ec3b-4edf-92c1-48c14e57cacd",
};

/**
 * Creates a mock session for testing
 */
export const createMockSession = (
  user: Partial<TestUser> = {}
): MockAuthContext => {
  const testUser = { ...DEFAULT_TEST_USER, ...user };
  const date = new Date();
  const sessionToken = "04456e41-ec3b-4edf-92c1-48c14e57cacd2";
  const session: Session = {
    user: {
      id: testUser.id,
      email: testUser.email,
      name: testUser.name,
      sub: testUser.sub,
      sessions: {
        create: {
          expires: new Date(date.getFullYear(), date.getMonth() + 1, 0),
          sessionToken,
        },
      },
      accounts: {
        create: {
          type: "oauth",
          provider: "github",
          providerAccountId: "2222222",
          access_token: "ggg_zZl1pWIvKkf3UDynZ09zLvuyZsm1yC0YoRPt",
          token_type: "bearer",
          scope: "read:org,read:user,repo,user:email",
        },
      },
    },
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
  };

  const token: JWT = {
    name: testUser.name,
    email: testUser.email,
    sub: testUser.sub,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days from now
    jti: "test-jti",
  };

  return { session, token };
};

/**
 * Sets up auth state in the browser
 */
export const setupAuthState = async (
  page: Page,
  user: Partial<TestUser> = {}
) => {
  const testUser = { ...DEFAULT_TEST_USER, ...user };
  const { session } = createMockSession(testUser);
  const storagePath = path.resolve(__dirname, "storageState.json");

  // Set the session cookie
  await page.context().addCookies([
    {
      name: "next-auth.session-token",
      value: testUser.sessionToken!,
      domain: "localhost",
      path: "/",
      httpOnly: false,
      sameSite: "Lax",
      expires: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days from now
      secure: true,
    },
  ]);

  await page.goto("/en");
  const browser = await chromium.launch();
  const context = await browser.newContext({ storageState: storagePath });
  // Set the session data in sessionStorage
  //   await page.evaluate((sessionData) => {
  //     window.localStorage.setItem(
  //       "nextauth.session",
  //       JSON.stringify(sessionData)
  //     );
  //   }, session);
  await context.storageState({ path: storagePath });
  await browser.close();
};

/**
 * Mocks the NextAuth session endpoint
 */
export const mockNextAuthApi = async (
  page: Page,
  user: Partial<TestUser> = {}
) => {
  const { session } = createMockSession(user);

  await page.route("**/api/auth/session", async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify(session),
    });
  });
};

/**
 * Combines all auth mocking steps into one utility function
 */
export const setupTestAuth = async (
  page: Page,
  user: Partial<TestUser> = {}
) => {
  await setupAuthState(page, user);
  await mockNextAuthApi(page, user);
};
