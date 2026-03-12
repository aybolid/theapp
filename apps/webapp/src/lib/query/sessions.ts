import { server } from "../api";
import { createQueries } from ".";

export const {
  queryOptions: sessionsQueryOptions,
  useQuery: useSessionsQuery,
  useSuspenseQuery: useSessionsSuspenseQuery,
} = createQueries(["sessions"], () => server.api.auth.sessions.get());
