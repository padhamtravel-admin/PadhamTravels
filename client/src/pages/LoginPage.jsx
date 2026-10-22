import React, { useState } from "react";
import { Eye, EyeOff, ArrowLeft, AlertCircle } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Button from "@/components/common/Button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LoginPageImg from "@/assets/loginpageimg1.jpg";
import { useAuthUser } from "@/hooks/useAuthUser";
import apiClient from "@/apiClient";

export const LoginPage = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
  const { setUser } = useAuthUser();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const redirectTo =
    searchParams.get("redirect") ||
    (location.state?.from && location.state.from !== "/home" ? location.state.from : "/");
  const originalState = location.state?.originalState || null;

  /* Defining the schema for form validation using Zod */
  const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
  });

  /* Initialising the Form */
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  /* Handling form submission */
  const handleForm = async (values) => {
    setErrorMessage("");
    setLoading(true);

    try {
      let responseData = null;
      let isSuccess = false;

      try {
        const res = await apiClient.post("/auth/login", {
          email: values.email.trim().toLowerCase(),
          password: values.password,
        });
        responseData = await res.json();
        isSuccess = res.ok && (responseData?.status || responseData?.success);
      } catch (clientErr) {
        if (clientErr.response) {
          throw clientErr;
        }
        const fetchRes = await fetch(`${baseUrl}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            email: values.email.trim().toLowerCase(),
            password: values.password,
          }),
        });
        responseData = await fetchRes.json().catch(() => ({}));
        isSuccess = fetchRes.ok && (responseData?.status || responseData?.success);
        if (!isSuccess) {
          const err = new Error(responseData?.message || "Login failed");
          err.response = { status: fetchRes.status, data: responseData };
          throw err;
        }
      }

      if (isSuccess && responseData) {
        if (responseData.token) {
          localStorage.setItem("token", responseData.token);
        }
        if (responseData.user) {
          localStorage.setItem("user", JSON.stringify(responseData.user));
        }

        const role = responseData.user?.role || responseData.role || "user";
        const userData = responseData.user || {
          id: responseData.user?.id || responseData.user?._id,
          email: responseData.email || values.email,
          role: role,
          name: responseData.name,
        };

        setUser(userData);

        if (role === "admin") {
          navigate("/admin/dashboard", { replace: true });
        } else {
          navigate(redirectTo, { state: originalState ? { ...originalState } : null, replace: true });
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      if (!err.response) {
        setErrorMessage("Unable to connect to the server. Please check your connection or try again later.");
      } else if (err.response.status === 400 || err.response.status === 401 || err.response.status === 403) {
        setErrorMessage(err.response.data?.message || "Invalid email or password.");
      } else if (err.response.status >= 500) {
        setErrorMessage("Server error occurred. Please try again in a few moments.");
      } else {
        setErrorMessage(err.response.data?.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    // MAIN CONTAINER: Flex layout, full height
    <div className="min-h-screen w-full flex bg-sky-100 overflow-hidden">
      {/* LEFT SIDE: Image Section */}
      <div className="hidden md:block md:w-1/2 relative">
        <div
          className="absolute inset-0 h-full w-full object-cover bg-cover bg-no-repeat bg-center md:rounded-r-[3rem] border-r-4 border-white shadow-2xl z-10"
          style={{ backgroundImage: `url(${LoginPageImg})` }}
        >
          {/* Text Overlay on Image */}
          <div className="h-full flex flex-col pt-8 px-12 lg:px-20">
            <div className="font-semibold text-slate-800 drop-shadow-md space-y-2">
              <p className="text-3xl lg:text-5xl text-shadow-md">Unlock Your</p>
              <p className="text-3xl lg:text-5xl text-shadow-md">
                Travel Dreams
              </p>
              <p className="text-3xl lg:text-5xl text-shadow-md">With Us!!</p>
              <div className="w-55 border-b-2 border-teal-500 mt-3"></div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Form Section */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center py-6 px-12 sm:p-12">
        <div className="w-full max-w-md flex flex-col gap-6">
          {/* Header Text */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Welcome Back
            </h1>
            <p className="text-sm text-slate-500">
              Please login to your account to continue
            </p>
          </div>

          {/* Login Card */}
          <Card className="w-full shadow-lg shadow-slate-300/50 border">
            <CardContent className="pt-4 sm:pt-6 px-6 sm:px-8 pb-4">
              {/* Back to Home Link */}
              <div className="mb-4">
                <Link
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-cyan-600 transition-colors group"
                  to="/"
                >
                  <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                  <span>Back to Home</span>
                </Link>
              </div>

              <h2 className="text-xl font-semibold mb-6 text-center text-slate-900">
                Login Now
              </h2>

              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleForm)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-semibold">Email ID</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your email"
                            className="h-10 border-slate-200 focus:border-cyan-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-semibold">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              autoComplete="new-password"
                              className="h-10 pr-10 border-slate-200 focus:border-cyan-500"
                              {...field}
                            />
                            <button
                              type="button"
                              tabIndex={-1}
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition p-0.5 cursor-pointer"
                              aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      isLoading={loading}
                      className="w-full cursor-pointer"
                    >
                      Login
                    </Button>
                  </div>

                  <div className="flex justify-center text-sm mt-4 text-slate-600">
                    <p>
                      Don't have an account?{" "}
                      <Link
                        to={
                          searchParams.get("redirect")
                            ? `/register?redirect=${encodeURIComponent(searchParams.get("redirect"))}`
                            : "/register"
                        }
                        state={{ from: redirectTo, originalState }}
                        className="font-medium text-cyan-600 hover:text-cyan-700 hover:underline transition-colors"
                      >
                        Register now
                      </Link>
                    </p>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
