import { baseApi } from "@/api/base_api";
import {
    setCredentials,
    clearCredentials,
    setLoading,
    patchUser,
} from "@/store/slices/auth_slice";
import type { RootState } from "@/store/store";
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
                    dispatch(setCredentials({ user: data.data.user, token: data.data.token }));
                } catch { /* error surfaced by RTK Query */ }
            },
            invalidatesTags: ["Auth"],
        }),

        // POST /auth/login
        login: build.mutation<AuthResponse, LoginRequest>({
            query: (body) => ({ url: "/auth/login", method: "POST", body }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setCredentials({ user: data.data.user, token: data.data.token }));
                } catch { /* error surfaced by RTK Query */ }
            },
            invalidatesTags: ["Auth"],
        }),

        // GET /auth/status — called on boot to rehydrate session
        getAuthStatus: build.query<AuthStatusResponse, void>({
            query: () => "/auth/status",
            async onQueryStarted(_, { dispatch, queryFulfilled, getState }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data.data.isAuthenticated && data.data.user) {
                        // Read token from Redux state — avoids direct localStorage access
                        const token = (getState() as RootState).auth.token ?? "";
                        dispatch(setCredentials({ user: data.data.user, token }));
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
                try { await queryFulfilled; } catch { /* ignore */ }
                dispatch(clearCredentials());
            },
            invalidatesTags: ["Auth"],
        }),

        // POST /auth/refresh
        refreshToken: build.mutation<{ token: string }, void>({
            query: () => ({ url: "/auth/refresh", method: "POST" }),
        }),

        // POST /auth/send-email-otp
        sendEmailOtp: build.mutation<void, { email: string }>({
            query: (body) => ({ url: "/auth/send-email-otp", method: "POST", body }),
        }),

        // POST /auth/verify-email-otp — sets isEmailVerified = true
        verifyEmailOtp: build.mutation<void, { email: string; code: string }>({
            query: (body) => ({ url: "/auth/verify-email-otp", method: "POST", body }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(patchUser({ isEmailVerified: true }));
                } catch { /* error surfaced by RTK Query */ }
            },
            invalidatesTags: ["Auth", "User"],
        }),

        // POST /auth/send-phone-otp
        sendPhoneOtp: build.mutation<void, { phoneNumber: string }>({
            query: (body) => ({ url: "/auth/send-phone-otp", method: "POST", body }),
        }),

        // POST /auth/verify-phone-otp — sets isPhoneVerified = true
        verifyPhoneOtp: build.mutation<void, { phoneNumber: string; code: string }>({
            query: (body) => ({ url: "/auth/verify-phone-otp", method: "POST", body }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(patchUser({ isPhoneVerified: true }));
                } catch { /* error surfaced by RTK Query */ }
            },
            invalidatesTags: ["Auth", "User"],
        }),

        // POST /auth/forgot-password — request password reset OTP
        forgotPassword: build.mutation<void, { email: string }>({
            query: (body) => ({ url: "/auth/forgot-password", method: "POST", body }),
        }),

        // POST /auth/verify-forgot-password — verify OTP
        verifyForgotPasswordOtp: build.mutation<void, { email: string; code: string }>({
            query: (body) => ({ url: "/auth/verify-forgot-password", method: "POST", body }),
        }),

        // POST /auth/reset-password — set new password after OTP verification
        resetPassword: build.mutation<void, { email: string; code: string; newPassword: string }>({
            query: (body) => ({ url: "/auth/reset-password", method: "POST", body }),
        }),

    }),
    overrideExisting: false,
});

export const {
    useRegisterMutation,
    useLoginMutation,
    useGetAuthStatusQuery,
    useLogoutMutation,
    useRefreshTokenMutation,
    useSendEmailOtpMutation,
    useVerifyEmailOtpMutation,
    useSendPhoneOtpMutation,
    useVerifyPhoneOtpMutation,
    useForgotPasswordMutation,
    useVerifyForgotPasswordOtpMutation,
    useResetPasswordMutation,
} = authApi;