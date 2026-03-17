import { baseApi } from "./base.api";
import {
    setCredentials,
    clearCredentials,
    setLoading,
} from "@/store/slices/auth.slice";
import type {
    LoginRequest,
    RegisterRequest,
    AuthResponse,
    AuthStatusResponse,
} from "@/types/auth.types";

export const authApi = baseApi.injectEndpoints({
    endpoints: (build) => ({

        // POST /auth/register
        register: build.mutation<AuthResponse, RegisterRequest>({
            query: (body) => ({ url: "/auth/register", method: "POST", body }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(
                        setCredentials({ user: data.data.user, token: data.data.token }),
                    );
                } catch (error) {
                    /* errors surfaced by RTK Query */
                    console.log("error", error)
                }
            },
            invalidatesTags: ["Auth"],
        }),

        // POST /auth/login
        login: build.mutation<AuthResponse, LoginRequest>({
            query: (body) => ({ url: "/auth/login", method: "POST", body }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(
                        setCredentials({ user: data.data.user, token: data.data.token }),
                    );
                } catch (error) {
                    /* errors surfaced by RTK Query */
                    console.log("error", error)
                }
            },
            invalidatesTags: ["Auth"],
        }),

        // GET /auth/status — called on app boot to rehydrate session
        getAuthStatus: build.query<AuthStatusResponse, void>({
            query: () => "/auth/status",
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data.data.isAuthenticated && data.data.user) {
                        dispatch(
                            setCredentials({
                                user: data.data.user,
                                token: localStorage.getItem("token") ?? "",
                            }),
                        );
                    } else {
                        dispatch(clearCredentials());
                    }
                } catch {
                    dispatch(clearCredentials());
                } finally {
                    dispatch(setLoading(false));
                }
            },
            providesTags: ["Auth"],
        }),

        // POST /auth/logout
        logout: build.mutation<void, void>({
            query: () => ({ url: "/auth/logout", method: "POST" }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                } catch { /* errors surfaced by RTK Query */ }
                // Clear state regardless of API success/failure
                dispatch(clearCredentials());
            },
            invalidatesTags: ["Auth"],
        }),

        // POST /auth/send-email-otp
        sendEmailOtp: build.mutation<void, { email: string }>({
            query: (body) => ({ url: "/auth/send-email-otp", method: "POST", body }),
        }),

        // POST /auth/verify-email-otp
        verifyEmailOtp: build.mutation<void, { email: string; code: string }>({
            query: (body) => ({
                url: "/auth/verify-email-otp",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Auth", "User"],
        }),

        // POST /auth/send-phone-otp
        sendPhoneOtp: build.mutation<void, { phoneNumber: string }>({
            query: (body) => ({
                url: "/auth/send-phone-otp",
                method: "POST",
                body,
            }),
        }),

        // POST /auth/verify-phone-otp
        verifyPhoneOtp: build.mutation<void, { phoneNumber: string; code: string }>(
            {
                query: (body) => ({
                    url: "/auth/verify-phone-otp",
                    method: "POST",
                    body,
                }),
                invalidatesTags: ["Auth", "User"],
            },
        ),

        // POST /auth/refresh
        refreshToken: build.mutation<{ token: string }, void>({
            query: () => ({ url: "/auth/refresh", method: "POST" }),
        }),

    }),
    overrideExisting: false,
});

export const {
    useRegisterMutation,
    useLoginMutation,
    useGetAuthStatusQuery,
    useLogoutMutation,
    useSendEmailOtpMutation,
    useVerifyEmailOtpMutation,
    useSendPhoneOtpMutation,
    useVerifyPhoneOtpMutation,
    useRefreshTokenMutation,
} = authApi;