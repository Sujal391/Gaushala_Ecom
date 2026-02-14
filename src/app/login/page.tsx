"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Signup from "../../components/SignUp";

export default function LoginPage() {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
    router.push("/shop"); // redirect to home when modal closes
  };

  return (
    <>
      <Signup
        isOpen={open}
        onClose={handleClose}
        initialMode="register"
        onAuthSuccess={() => router.push("/shop")}
      />
    </>
  );
}
