# SCOUT HUB — Google Login

This build already contains the Supabase Google OAuth flow.

## Google Cloud
OAuth client type: **Web application**

Authorized redirect URI:
`https://rapwjcyjudvbpputwwcu.supabase.co/auth/v1/callback`

Authorized JavaScript origins can remain empty until SCOUT HUB has a public HTTPS domain.

## Supabase
Authentication → Providers → Google:
- Enable Google
- Paste the Google OAuth **Client ID**
- Paste the Google OAuth **Client Secret**
- Save

Authentication → URL Configuration:
- Site URL: the public HTTPS URL where SCOUT HUB is hosted
- Redirect URL: the same public HTTPS URL (the app uses `window.location.origin + window.location.pathname`)

## Important
Never put the Google Client Secret in `js/`, HTML, GitHub, or this ZIP.
The frontend only uses the Supabase publishable key.

## Test
Host SCOUT HUB on HTTPS, open Login, and press **Kontinye ak Google**.
The app redirects to Google, then back through Supabase to SCOUT HUB.
