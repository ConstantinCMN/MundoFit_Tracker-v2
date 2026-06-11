import createMiddleware from 'next-intl/middleware';
import { routing } from '@/lib/i18n/routing';
import { createServerClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

const handleI18nRouting = createMiddleware(routing);

const PROTECTED_PATHS = [
  '/dashboard',
  '/weight',
  '/measurements',
  '/photos',
  '/calories',
  '/goals',
  '/workouts',
  '/profile',
];
const ONBOARDING_PATH = '/onboarding';
const AUTH_PATHS = ['/login', '/register', '/forgot-password'];

export async function middleware(request: NextRequest) {
  let response = handleI18nRouting(request);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const matchedLocale = routing.locales.find(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  );
  const locale = matchedLocale ?? routing.defaultLocale;
  const pathWithoutLocale = matchedLocale
    ? pathname.slice(`/${locale}`.length) || '/'
    : pathname;

  if (!user) {
    const isProtected =
      PROTECTED_PATHS.some((p) => pathWithoutLocale.startsWith(p)) ||
      pathWithoutLocale.startsWith(ONBOARDING_PATH);

    if (isProtected) {
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }
  } else {
    const isAuthPage = AUTH_PATHS.some((p) => pathWithoutLocale.startsWith(p));
    if (isAuthPage) {
      // Authenticated users are redirected to dashboard (or onboarding if incomplete)
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
    }

    // For protected app routes, ensure onboarding is complete
    const isAppRoute = PROTECTED_PATHS.some((p) => pathWithoutLocale.startsWith(p));
    if (isAppRoute) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('user_id', user.id)
        .single();

      if (!profile?.onboarding_completed) {
        return NextResponse.redirect(new URL(`/${locale}/onboarding`, request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
