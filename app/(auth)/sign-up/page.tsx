"use client";
import React from "react";
import AuthForm from "@/components/forms/AuthForm";
import { FieldValues } from "react-hook-form";
import { SignUpSchema } from "@/lib/validations";

const SignUp = () => {
  return (
    <AuthForm
      schema={SignUpSchema}
      defaultValues={{ email: "", password: "", name: "", username: "" }}
      onSubmit={(data: FieldValues): Promise<{ success: boolean; data: FieldValues }> =>
        Promise.resolve({ success: true, data })
      }
      formType={"SIGN_UP"}
    />
  );
};
export default SignUp;
