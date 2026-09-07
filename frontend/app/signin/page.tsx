"use client";
import Link from "next/link";
import React from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import api from "../../utils/axiosInstance";
import { setAuthToken } from "../../utils/auth";
import { useNotification } from "@/context/notification-context";

type FormData = {
  email: string;
  password: string;
};

type FieldErrors = Partial<Record<keyof FormData, string>>;

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;

    if (typeof data === "string") {
      return data;
    }

    if (data && typeof data === "object") {
      const responseData = data as {
        message?: unknown;
        error?: unknown;
        errors?: unknown;
      };

      if (typeof responseData.message === "string") {
        return responseData.message;
      }

      if (typeof responseData.error === "string") {
        return responseData.error;
      }

      if (Array.isArray(responseData.errors)) {
        const messages = responseData.errors
          .map((item) => {
            if (typeof item === "string") return item;
            if (item && typeof item === "object" && "message" in item) {
              const message = (item as { message?: unknown }).message;
              return typeof message === "string" ? message : null;
            }
            return null;
          })
          .filter((message): message is string => Boolean(message));

        if (messages.length > 0) {
          return messages.join(", ");
        }
      }
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "An unknown error occurred.";
}

export default function SignInPage() {
  const router = useRouter();
  const { error: notifyError, success } = useNotification();
  const [formData, setFormData] = React.useState<FormData>({
    email: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({});
  const [loading, setLoading] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const requiredErrors: FieldErrors = {};
    if (!formData.email.trim()) requiredErrors.email = "Email address is required";
    if (!formData.password) requiredErrors.password = "Password is required";

    if (Object.keys(requiredErrors).length > 0) {
      setFieldErrors(requiredErrors);
      notifyError("Please fill in all required fields.");
      return;
    }

    setFieldErrors({});
    setLoading(true);
    try {
      const response = await api.post("/auth/login", formData);
      const token = response.data?.data?.token;

      if (typeof token !== "string" || !token) {
        throw new Error("Login response did not contain an auth token.");
      }

      setAuthToken(token, rememberMe);
      success("Logged in successfully!");
      router.push("/");
    } catch (error) {
      notifyError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="flex flex-1 items-center justify-center px-5 py-12 sm:px-8 lg:py-16">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-[#dfe7df] bg-white shadow-[0_24px_70px_rgba(37,72,55,0.10)] lg:grid-cols-[1.1fr_0.9fr]">
        <div className="p-7 sm:p-10 lg:p-14">
          <div className="mx-auto max-w-md">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#e86e43]">
              Welcome back
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#163d31]">
              Sign in to NeighborLend
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#708178]">
              Pick up where you left off with your neighborhood community.
            </p>

            <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-6">
              <div className="mt-8 space-y-4">
                <label className="block text-sm font-semibold text-[#285347]">
                  Email address
                  <input
                    aria-invalid={Boolean(fieldErrors.email)}
                    type="email"
                    id="email"
                    name="email"
                    required
                    onChange={handleInputChange}
                    aria-describedby={
                      fieldErrors.email ? "email-error" : undefined
                    }
                    placeholder="you@example.com"
                    className={`mt-2 h-12 w-full rounded-xl border bg-[#fbfdf9] px-4 text-sm font-normal text-[#163d31] outline-none transition placeholder:text-[#a5b3aa] focus:border-[#185c46] focus:ring-4 focus:ring-[#185c46]/10 ${fieldErrors.email ? "border-red-500" : "border-[#d6e1d8]"}`}
                  />
                  {fieldErrors.email && (
                  <p id="email-error" className="mt-1 text-xs font-normal text-red-600">
                    {fieldErrors.email}
                  </p>
                )}
                </label>
                <label className="block text-sm font-semibold text-[#285347]">
                  Password
                  <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    onChange={handleInputChange}
                    aria-invalid={Boolean(fieldErrors.password)}
                    aria-describedby={
                      fieldErrors.password ? "password-error" : undefined
                    }
                    placeholder="Enter your password"
                    className={`mt-2 h-12 w-full rounded-xl border bg-[#fbfdf9] px-4 text-sm font-normal text-[#163d31] outline-none transition placeholder:text-[#a5b3aa] focus:border-[#185c46] focus:ring-4 focus:ring-[#185c46]/10 ${fieldErrors.password ? "border-red-500" : "border-[#d6e1d8]"}`}
                  />
                  {fieldErrors.password && (
                  <p id="password-error" className="mt-1 text-xs font-normal text-red-600">
                    {fieldErrors.password}
                  </p>
                )}
                </label>
                <div className="flex items-center justify-between text-xs text-[#708178]">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) => setRememberMe(event.target.checked)}
                      className="h-4 w-4 rounded border-[#cddbd0] accent-[#185c46]"
                    />{" "}
                    Remember me
                  </label>
                  <button
                    type="button"
                    className="font-semibold text-[#185c46] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full rounded-xl bg-[#185c46] text-sm font-semibold text-white transition hover:bg-[#124a38]"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
              </div>
            </form>

            <p className="mt-7 text-center text-sm text-[#708178]">
              New to NeighborLend?{" "}
              <Link
                href="/signup"
                className="font-semibold text-[#185c46] hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>

        <div className="relative hidden overflow-hidden bg-[#f1f6e9] p-10 lg:block">
          <div className="absolute right-[-70px] top-[-70px] h-64 w-64 rounded-full bg-[#dfff88]" />
          <div className="absolute bottom-[-90px] left-[-70px] h-64 w-64 rounded-full bg-[#f28a5b]/25" />
          <div className="relative flex h-full flex-col justify-center">
            <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#185c46] text-[#dfff88] shadow-lg">
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M12 3.8 4.7 7.2v5.3c0 4 2.9 6.8 7.3 8 4.4-1.2 7.3-4 7.3-8V7.2L12 3.8Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <path
                  d="m8.8 12 2.1 2.1 4.4-4.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className="max-w-sm text-4xl font-semibold leading-[1.08] tracking-[-0.05em] text-[#163d31]">
              Good things are better when shared.
            </h2>
            <p className="mt-5 max-w-sm text-base leading-7 text-[#62766a]">
              Find what you need nearby, lend what you have, and make everyday
              life a little more connected.
            </p>
            <div className="mt-9 flex items-center gap-3 text-sm font-semibold text-[#285347]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#e86e43]" /> Trusted
              by local communities
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
