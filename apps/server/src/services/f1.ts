import type {
  F1Driver,
  F1DriverChampionshipStanding,
  F1Session,
  F1SessionResult,
} from "@theapp/schemas";
import { logger } from "../utils/logger";

const F1_API_BASE_URL = "https://api.openf1.org";

async function fetchF1Api<T>(path: string): Promise<T> {
  const url = new URL(path, F1_API_BASE_URL);
  const res = await fetch(url);
  if (!res.ok) {
    logger.error({
      url,
      status: res.status,
      error:
        (res.headers.get("Content-Type") ?? "") === "application/json"
          ? await res.json()
          : await res.text(),
    });
    throw new Error("Failed to fetch from F1 API");
  }
  return res.json();
}

function normalizeF1SessionData(session: F1Session): F1Session {
  return {
    ...session,
    date_start: new Date(session.date_start).toISOString(),
    date_end: new Date(session.date_end).toISOString(),
  };
}

export async function fetchF1SessionByKey(
  sessionKey: number,
): Promise<F1Session | undefined> {
  return fetchF1Api<F1Session[]>(`/v1/sessions?session_key=${sessionKey}`).then(
    (data) => {
      const session = data[0];
      return session ? normalizeF1SessionData(session) : undefined;
    },
  );
}

export async function fetchF1SeasonSessions(
  year: number,
): Promise<F1Session[]> {
  return fetchF1Api<F1Session[]>(`/v1/sessions?year=${year}`).then((data) =>
    data.map(normalizeF1SessionData),
  );
}

export async function fetchF1SessionDrivers(
  sessionKey: number | "latest",
): Promise<F1Driver[]> {
  return fetchF1Api<F1Driver[]>(`/v1/drivers?session_key=${sessionKey}`);
}

export async function fetchF1SessionResults(
  sessionKey: number,
): Promise<F1SessionResult[]> {
  return fetchF1Api<F1SessionResult[]>(
    `/v1/session_result?session_key=${sessionKey}`,
  );
}

export async function fetchF1DriverChampionshipStandings(): Promise<
  F1DriverChampionshipStanding[]
> {
  return fetchF1Api<F1DriverChampionshipStanding[]>(
    "/v1/championship_drivers?session_key=latest",
  );
}
