import {
  createApi,
  fetchBaseQuery,
  retry,
} from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import type { RootState } from "@/store/store";
import { clearCredentials, setCredentials } from "@/store/slices/auth_slice";

const BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:5000/api/v1";

// ── Raw base query ────────────────────────────────────────────────────────────

const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: "include", // send httpOnly refresh-token cookie
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

// ── Base query with 401 → auto-refresh → retry ────────────────────────────────

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    // Attempt silent token refresh using the httpOnly cookie
    const refreshResult = await rawBaseQuery(
      { url: "/auth/refresh", method: "POST" },
      api,
      extraOptions,
    );

    if (refreshResult.data) {
      // Server returns { success, message, data: { token } }
      const responseData = refreshResult.data as {
        data?: { token?: string };
        token?: string;
      };
      const newToken =
        responseData.data?.token ?? responseData.token ?? "";

      if (newToken) {
        // FIX: original only wrote to localStorage — prepareHeaders reads from
        // Redux state, so the token must be dispatched there too. Without this
        // the retry still sends the old (expired) token in the Authorization header.
        localStorage.setItem("token", newToken);

        // Read the current user from state so setCredentials doesn't wipe it
        const currentUser = (api.getState() as RootState).auth.user;
        if (currentUser) {
          api.dispatch(setCredentials({ user: currentUser, token: newToken }));
        }

        // Re-run original request — prepareHeaders will now use the new token
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        api.dispatch(clearCredentials());
      }
    } else {
      // Refresh failed — user is fully logged out
      api.dispatch(clearCredentials());
    }
  }

  return result;
};

// ── Retry wrapper — retries non-4xx errors up to 2 times ─────────────────────

const baseQueryWithRetry = retry(baseQueryWithReauth, {
  maxRetries: 2,
  backoff: async (attempt) => {
    // Exponential backoff: 500ms, 1000ms
    await new Promise((resolve) =>
      setTimeout(resolve, 500 * 2 ** (attempt - 1)),
    );
  },
});

// ── Main API instance ─────────────────────────────────────────────────────────

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithRetry,
  tagTypes: [
    "Auth",
    "User",
    "Server",
    "Channel",
    "Message",
    "Friend",
    "FriendRequest",
    "DirectMessage",
    "Invite",
    "Role",
  ],
  // Global cache lifetime: 60s after last subscriber unsubscribes
  keepUnusedDataFor: 60,
  endpoints: () => ({}),
});