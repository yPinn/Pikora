const isProd = process.env.NEXT_PUBLIC_DEPLOYMENT_ENV === 'production';

export const SESSION_COOKIE_NAME = isProd
  ? '__Secure-next-auth.session-token.pikora'
  : 'next-auth.session-token.pikora';
