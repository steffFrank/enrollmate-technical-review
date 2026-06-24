import "server-only";

import { cookies } from "next/headers";
import { APP_LOCALE_COOKIE, LEGACY_APP_LOCALE_COOKIE, resolveAppLocale } from "@/lib/app-i18n";

export async function getAppLocale() {
  const cookieStore = await cookies();
  return resolveAppLocale(
    cookieStore.get(APP_LOCALE_COOKIE)?.value
      ?? cookieStore.get(LEGACY_APP_LOCALE_COOKIE)?.value,
  );
}
