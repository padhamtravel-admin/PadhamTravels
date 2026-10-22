import React, { useState } from "react";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
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
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import LoginPageImg from "@/assets/loginpageimg1.jpg";

export const RegisterPage = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const redirectTo =
    searchParams.get("redirect") ||
    (location.state?.from && location.state.from !== "/home" ? location.state.from : "/");
  const originalState = location.state?.originalState || null;

  /* Defining the schema for form validation using Zod */
  const formSchema = z
    .object({
      name: z.string().min(3, {
        message: "Name must be at least 3 characters.",
      }),
      email: z.string().email(),
      password: z.string().min(8, {
        message: "Password must be at least 8 characters.",
      }),
      confirm_password: z.string().min(8, {
        message: "Confirm Password must be at least 8 characters.",
      }),
    })
    .refine((data) => data.password === data.confirm_password, {
      message: "Passwords do not match",
      path: ["confirm_password"], // Point error to confirm_password field
    });

  /* Initialising the Form */
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirm_password: "",
    },
  });

  /* Handling form submission of Form */
  const handleForm = async (values) => {
    try {
      const response = await fetch(`${baseUrl}/auth/register`, {
        method: "Post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      // Check for the specific 409 Conflict status
      if (response.status === 409) {
        toast("Registration Failed", {
          description: data.message || "User already registered.",
          style: {
            background: "#eb5449",
            color: "white",
          },
        });
        return;
      }

      if (data.status) {
        toast("Registration Status!", {
          description: data.message,
          style: {
            background: "#3ac435",
            color: "white",
          },
        });
        const loginUrl = searchParams.get("redirect")
          ? `/login?redirect=${encodeURIComponent(searchParams.get("redirect"))}`
          : "/login";
        navigate(loginUrl, { state: { from: redirectTo, originalState } });
      } else {
        toast("Registration Status!", {
          description: data.message,
          style: {
            background: "#eb5449",
            color: "white",
          },
        });
      }
    } catch (error) {
      toast("Registration Status!", {
        description: "Network error. Please check server connection.",
        style: {
          background: "#eb5449",
          color: "white",
        },
      });
    }
  };

  return (
    // MAIN CONTAINER: Flex layout, full height, prevents horizontal scroll
    <div className="min-h-screen w-full flex bg-sky-100 overflow-hidden">
      {/* LEFT SIDE: Image Section */}
      <div className="hidden md:block md:w-1/2 relative">
        <div
          className="absolute inset-0 h-full w-full object-cover bg-cover bg-no-repeat bg-center md:rounded-r-[3rem] border-r-4 border-white shadow-2xl z-10"
          style={{ backgroundImage: `url(${LoginPageImg})` }}
        >
          {/* Text Overlay */}
          <div className="h-full flex flex-col pt-10 px-12 lg:px-20">
            <div className="font-semibold text-slate-800 drop-shadow-md space-y-2">
              <p className="text-3xl lg:text-5xl text-shadow-md">Travel</p>
              <p className="text-lg lg:text-3xl text-shadow-md">
                And Explore the World!!
              </p>
              <div className="w-80 border-b-2 border-teal-500 mt-3"></div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Form Section */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center py-6 px-12 sm:p-12">
        <div className="w-full max-w-md flex flex-col gap-5">
          {/* Header Text */}
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Welcome To
            </h1>
            <p className="text-2xl sm:text-3xl font-extrabold text-cyan-600">
              Padham Travels
            </p>
            <p className="text-sm text-slate-500 pt-1">
              Let's get you started on your journey with us!
            </p>
          </div>

          {/* Registration Card */}
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
                Register Here
              </h2>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleForm)}
                  className="space-y-4"
                >
                  {/* Name Field */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-semibold">Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your name"
                            className="h-10 text-sm border-slate-200 focus:border-cyan-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email Field */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-semibold">Email ID</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your email"
                            className="h-10 text-sm border-slate-200 focus:border-cyan-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Password Field */}
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
                              placeholder="Create your password"
                              autoComplete="new-password"
                              className="h-10 text-sm pr-10 border-slate-200 focus:border-cyan-500"
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

                  {/* Confirm Password Field */}
                  <FormField
                    control={form.control}
                    name="confirm_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-semibold">Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Re-enter your password"
                              className="h-10 text-sm pr-10 border-slate-200 focus:border-cyan-500"
                              {...field}
                            />
                            <button
                              type="button"
                              tabIndex={-1}
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition p-0.5 cursor-pointer"
                              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                            >
                              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit Button */}
                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      className="w-full cursor-pointer"
                    >
                      Register Now
                    </Button>
                  </div>

                  {/* Login Link */}
                  <div className="flex justify-center text-sm mt-4 text-slate-600">
                    <p>
                      Already have an account?{" "}
                      <Link
                        to={
                          searchParams.get("redirect")
                            ? `/login?redirect=${encodeURIComponent(searchParams.get("redirect"))}`
                            : "/login"
                        }
                        state={{ from: redirectTo, originalState }}
                        className="font-medium text-cyan-600 hover:text-cyan-700 hover:underline transition-colors"
                      >
                        Login now
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
