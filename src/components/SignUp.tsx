"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  loginUser,
  registerUserPhase1,
  registerUserPhase2,
} from "../lib/api/auth";
import { toast } from "sonner";
import { isAdmin } from "../lib/api/config";

type AuthMode = "login" | "register";
type RegisterStep = 1 | 2;

interface SignUpProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
  onAuthSuccess?: () => void;
}

export default function SignUp({
  isOpen,
  onClose,
  initialMode = "login",
  onAuthSuccess,
}: SignUpProps) {
  const router = useRouter();

  const [authMode, setAuthMode] = useState<AuthMode>(initialMode);
  const [registerStep, setRegisterStep] = useState<RegisterStep>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [phase1Identifier, setPhase1Identifier] = useState("");

  const [loginForm, setLoginForm] = useState({
    emailOrMobile: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    mobileNo: "",
    password: "",
    confirmPassword: "",
  });

  /* ---------------- RESET ---------------- */
  useEffect(() => {
    if (isOpen) {
      setAuthMode(initialMode);
      setRegisterStep(1);
      setPhase1Identifier("");
      setError("");
      setLoginForm({ emailOrMobile: "", password: "" });
      setRegisterForm({
        name: "",
        email: "",
        mobileNo: "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [isOpen, initialMode]);

  const handleClose = () => {
    setError("");
    setRegisterStep(1);
    onClose();
  };

  /* ---------------- LOGIN ---------------- */
  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await loginUser(loginForm);

      if (response?.success) {
        handleClose();
        toast.success("Login successful");

        if (onAuthSuccess) onAuthSuccess();

        router.push(isAdmin() ? "/admin" : "/shop");
      } else {
        setError(response?.message || "Login failed");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- REGISTER PHASE 1 ---------------- */
  const handleRegisterPhase1 = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await registerUserPhase1({
        name: registerForm.name,
        email: registerForm.email,
        mobileNo: registerForm.mobileNo,
      });

      if (response?.success) {
        setPhase1Identifier(registerForm.email || registerForm.mobileNo);
        setRegisterStep(2);

        toast.success("Details saved", {
          description: "Now set your password",
        });
      } else {
        setError(response?.message || "Registration failed");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- REGISTER PHASE 2 ---------------- */
  const handleRegisterPhase2 = async () => {
    if (registerForm.password !== registerForm.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (registerForm.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await registerUserPhase2({
        emailOrMobile: phase1Identifier,
        password: registerForm.password,
        confirmPassword: registerForm.confirmPassword,
      });

      if (response?.success) {
        toast.success("Registration completed");
        setAuthMode("login");
        setRegisterStep(1);
      } else {
        setError(response?.message || "Registration failed");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {authMode === "login" ? "Welcome back" : "Create an account"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && <p className="text-sm text-destructive">{error}</p>}

          {/* ---------------- LOGIN UI ---------------- */}
          {authMode === "login" && (
            <>
              <Input
                placeholder="Email or Mobile"
                value={loginForm.emailOrMobile}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, emailOrMobile: e.target.value })
                }
              />

              <Input
                type="password"
                placeholder="Password"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, password: e.target.value })
                }
              />

              <Button onClick={handleLogin} disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : "Login"}
              </Button>

              <p className="text-sm text-center">
                Don’t have an account?{" "}
                <button
                  className="text-primary"
                  onClick={() => setAuthMode("register")}
                >
                  Register
                </button>
              </p>
            </>
          )}

          {/* ---------------- REGISTER UI ---------------- */}
          {authMode === "register" && (
            <>
              {registerStep === 1 && (
                <>
                  <Input
                    placeholder="Full Name"
                    value={registerForm.name}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        name: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="Email"
                    value={registerForm.email}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        email: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="Mobile Number"
                    value={registerForm.mobileNo}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        mobileNo: e.target.value,
                      })
                    }
                  />

                  <Button onClick={handleRegisterPhase1} disabled={loading}>
                    {loading ? "Saving..." : "Next"}
                  </Button>
                </>
              )}

              {registerStep === 2 && (
                <>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={registerForm.password}
                      onChange={(e) =>
                        setRegisterForm({
                          ...registerForm,
                          password: e.target.value,
                        })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>

                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm Password"
                      value={registerForm.confirmPassword}
                      onChange={(e) =>
                        setRegisterForm({
                          ...registerForm,
                          confirmPassword: e.target.value,
                        })
                      }
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-2.5"
                    >
                      {showConfirmPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>

                  <Button onClick={handleRegisterPhase2} disabled={loading}>
                    {loading ? "Submitting..." : "Create Account"}
                  </Button>
                </>
              )}

              <p className="text-sm text-center">
                Already have an account?{" "}
                <button
                  className="text-primary"
                  onClick={() => setAuthMode("login")}
                >
                  Login
                </button>
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
