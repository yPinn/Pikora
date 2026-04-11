// Is this a production HTTPS deployment? (controls __Secure- prefix and secure flag)
export const IS_PROD = process.env.NEXT_PUBLIC_DEPLOYMENT_ENV === 'production';

// Both variants exported so the proxy can accept either during env drift / migration
export const SESSION_COOKIE_NAME_SECURE = '__Secure-next-auth.session-token.pikora';
export const SESSION_COOKIE_NAME_INSECURE = 'next-auth.session-token.pikora';

// Primary name used when writing the cookie (auth.js + getToken)
export const SESSION_COOKIE_NAME = IS_PROD
  ? SESSION_COOKIE_NAME_SECURE
  : SESSION_COOKIE_NAME_INSECURE;
