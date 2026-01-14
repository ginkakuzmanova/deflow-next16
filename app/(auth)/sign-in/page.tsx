"use client";
import React from "react";
import AuthForm from "@/components/forms/AuthForm";
import { SignInSchema } from "@/lib/validations";
import { FieldValues } from "react-hook-form";

const SignIn = () => {
  return (
    <AuthForm
      schema={SignInSchema}
      defaultValues={{ email: "", password: "" }}
      onSubmit={(data: FieldValues): Promise<{ success: boolean; data: FieldValues }> =>
        Promise.resolve({ success: true, data })
      }
      formType={"SIGN_IN"}
    />
  );
};
export default SignIn;
