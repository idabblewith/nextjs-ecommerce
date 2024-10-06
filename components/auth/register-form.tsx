"use client";

import { cn } from "@/lib/utils";
import { emailRegister } from "@/server/actions/email-register";
import { RegisterSchema } from "@/types/register-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import AuthCard from "./auth-card";
import { FormError } from "./form-error";
import { FormSuccess } from "./form-success";

const RegisterForm = () => {
	const form = useForm({
		resolver: zodResolver(RegisterSchema),
		defaultValues: {
			username: "",
			email: "",
			password: "",
		},
	});

	const [error, setError] = useState<string | undefined>(undefined);
	const [success, setSuccess] = useState<string | undefined>(undefined);

	const { execute, status } = useAction(emailRegister, {
		onSuccess(result) {
			// Access success in result.data
			if (result?.data?.success) {
				setSuccess(result.data.success);
				setError(undefined);
			}
		},
		onError(result) {
			// Handle server errors and validation errors
			if (result?.error?.serverError) {
				setError(result.error.serverError);
				setSuccess(undefined);
			} else if (result?.error?.validationErrors) {
				setError("Validation error occurred.");
				setSuccess(undefined);
			} else {
				setError("An unexpected error occurred.");
				setSuccess(undefined);
			}
		},
	});

	const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
		execute(values);
	};

	return (
		<AuthCard
			cardTitle="Create an Account"
			backButtonHref="/auth/login"
			backButtonLabel="Already registered?"
			showSocials
		>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<FormField
						control={form.control}
						name="username"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Username</FormLabel>
								<FormControl>
									<Input
										placeholder="bobthebuilder"
										type="text"
										autoComplete="username"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input
										placeholder="youremail@email.com"
										type="email"
										autoComplete="email"
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
								<FormLabel>Password</FormLabel>
								<FormControl>
									<Input
										placeholder="********"
										type="password"
										autoComplete="current-password"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormSuccess message={success} />
					<FormError message={error} />

					<Button
						disabled={status === "executing"}
						type="submit"
						className={cn(
							"w-full my-4",
							status === "executing" ? "animate-pulse" : ""
						)}
					>
						Register
					</Button>
				</form>
			</Form>
		</AuthCard>
	);
};
export default RegisterForm;
