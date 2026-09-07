"use client";
import Link from "next/link";
import React from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import api from "../../utils/axiosInstance";
import { useNotification } from "@/context/notification-context";

type FormData = {
  name: string;
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

  return "Sign-up failed. Please try again.";
}

export default function SignUpPage() {
  const router = useRouter();
  const { success, error: notifyError } = useNotification();
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState<FormData>({
    name: "",
    email: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({});

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setFieldErrors((prevErrors) => ({
      ...prevErrors,
      [name]: undefined,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const requiredErrors: FieldErrors = {};
    if (!formData.name.trim()) requiredErrors.name = "Full name is required";
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
      await api.post("/auth/register", formData);
      success("Account created successfully!");
      router.push("/signin");
    } catch (error) {
      notifyError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="flex flex-1 items-center justify-center px-5 py-12 sm:px-8 lg:py-16">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-[#dfe7df] bg-white shadow-[0_24px_70px_rgba(37,72,55,0.10)] lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative hidden overflow-hidden bg-[#185c46] p-10 text-white lg:block">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#dfff88]/20" />
          <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full border-[28px] border-[#f28a5b]/30" />
          <div className="relative flex h-full flex-col justify-between">
            <div>
              <p className="mb-8 text-sm font-semibold uppercase tracking-[0.18em] text-[#dfff88]">
                Join the neighborhood
              </p>
              <h1 className="max-w-sm text-4xl font-semibold leading-[1.08] tracking-[-0.05em]">
                Share more. Buy less. Live better.
              </h1>
              <p className="mt-5 max-w-sm text-base leading-7 text-[#d7e8df]">
                Create your free account and turn the things you already own
                into useful resources for your community.
              </p>
            </div>
            <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-3xl font-semibold text-[#dfff88]">01</p>
              <p className="mt-2 text-sm leading-6 text-[#e4f0e8]">
                List an item you are happy to lend, from tools to camping gear.
              </p>
            </div>
          </div>
        </div>

        <div className="p-7 sm:p-10 lg:p-14">
          <div className="mx-auto max-w-md">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#e86e43]">
              Get started
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#163d31]">
              Create your account
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#708178]">
              Start sharing useful things with people around you.
            </p>

            <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-4">
              <label className="block text-sm font-semibold text-[#285347]">
                Full name
                <input
                  id="name"
                  onChange={handleChange}
                  name="name"
                  type="text"
                  required
                  aria-invalid={Boolean(fieldErrors.name)}
                  aria-describedby={fieldErrors.name ? "name-error" : undefined}
                  placeholder="Ayesha Khan"
                  className={`mt-2 h-12 w-full rounded-xl border bg-[#fbfdf9] px-4 text-sm font-normal text-[#163d31] outline-none transition placeholder:text-[#a5b3aa] focus:border-[#185c46] focus:ring-4 focus:ring-[#185c46]/10 ${fieldErrors.name ? "border-red-500" : "border-[#d6e1d8]"}`}
                />
                {fieldErrors.name && (
                  <p id="name-error" className="mt-1 text-xs font-normal text-red-600">
                    {fieldErrors.name}
                  </p>
                )}
              </label>
              <label className="block text-sm font-semibold text-[#285347]">
                Email address
                <input
                  id="email"
                  onChange={handleChange}
                  name="email"
                  type="email"
                  required
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? "email-error" : undefined}
                  placeholder="ayesha@example.com"
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
                  id="password"
                  onChange={handleChange}
                  name="password"
                  type="password"
                  required
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? "password-error" : undefined}
                  placeholder="At least 6 characters"
                  className={`mt-2 h-12 w-full rounded-xl border bg-[#fbfdf9] px-4 text-sm font-normal text-[#163d31] outline-none transition placeholder:text-[#a5b3aa] focus:border-[#185c46] focus:ring-4 focus:ring-[#185c46]/10 ${fieldErrors.password ? "border-red-500" : "border-[#d6e1d8]"}`}
                />
                {fieldErrors.password && (
                  <p id="password-error" className="mt-1 text-xs font-normal text-red-600">
                    {fieldErrors.password}
                  </p>
                )}
              </label>
              <button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-xl bg-[#185c46] text-sm font-semibold text-white transition hover:bg-[#124a38]"
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-[#708178]">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="font-semibold text-[#185c46] hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
