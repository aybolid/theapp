import type { QueryClient } from "@tanstack/react-query";
import { notFound } from "@tanstack/react-router";
import type { AccessKey } from "@theapp/schemas";
import { meQueryOptions } from "./query/auth";

export async function copyToClipboard(
  text: string,
  hooks?: { onSuccess?: () => void; onError?: () => void },
): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    hooks?.onSuccess?.();
    return true;
  } catch {
    hooks?.onError?.();
    return false;
  }
}

export function normalize(str: string) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function s3ObjectUrl(key: string) {
  return `${window.location.origin}/s3/${key}`;
}

const OFFSET = 127397;

const ALPHA3_TO_ALPHA2: Record<string, string> = {
  BRN: "BH",
  AUS: "AU",
  CHN: "CN",
  JPN: "JP",
  KSA: "SA",
  USA: "US",
  CAN: "CA",
  MON: "MC",
  ESP: "ES",
  AUT: "AT",
  GBR: "GB",
  BEL: "BE",
  HUN: "HU",
  NED: "NL",
  ITA: "IT",
  AZE: "AZ",
  SGP: "SG",
  MEX: "MX",
  BRA: "BR",
  QAT: "QA",
  UAE: "AE",
};

export function countryCodeEmoji(cc: string) {
  if (!cc || cc.length < 2 || cc.length > 3) {
    throw new Error("Input must be a 2 or 3 letter country code.");
  }

  let code = cc.toUpperCase();

  if (code.length === 3) {
    const translated = ALPHA3_TO_ALPHA2[code];
    if (!translated) {
      throw new Error(`Alpha-3 code '${code}' not found in mapping.`);
    }
    code = translated;
  }

  const codePoints = [...code].map((c) => (c.codePointAt(0) ?? 0) + OFFSET);

  return String.fromCodePoint(...codePoints);
}

export async function beforeLoadAccessGuard(
  queryClient: QueryClient,
  access: AccessKey[],
) {
  const user =
    queryClient.getQueryData(meQueryOptions().queryKey) ??
    (await queryClient.fetchQuery(meQueryOptions()).catch(() => null));
  if (!user) throw notFound();

  for (const key of access) {
    if (!user.access[key]) throw notFound();
  }
}
