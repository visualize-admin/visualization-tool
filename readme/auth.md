[back](../README.md)

# Authentication

By default, authentication is provided by the Swiss federal government's eIAM
through ADFS. [NextAuth](https://next-auth.js.org/) is used to integrate the
application with eIAM through a
[custom provider](../app/auth-providers/adfs.ts). For testing locally and for
Vercel preview deployments, a NextAuth Credentials provider is used that
automatically signs the user in as a shared test account.

## Locally

For local authentication, you can use the eIAM _ref_ environment. ADFS
environment variables should be configured in your `.env.local` file.

Make sure to set the `NEXTAUTH_URL` environment variable to
`https://localhost:3000` and run the dev server with `yarn dev:ssl`.
