"use client";

import { cn } from "@/lib/utils";
import { newPassword } from "@/server/actions/new-password";
import { NewPasswordSchema } from "@/types/new-password-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import AuthCard from "./auth-card";
import { FormError } from "./form-error";
import { FormSuccess } from "./form-success";
import { useSearchParams } from "next/navigation";

const NewPasswordForm = () => {
	const form = useForm({
		resolver: zodResolver(NewPasswordSchema),
		defaultValues: {
			password: "",
		},
	});

	const searchParams = useSearchParams();
	const token = searchParams.get("token");

	const [error, setError] = useState<string | undefined>(undefined);
	const [success, setSuccess] = useState<string | undefined>(undefined);

	const { execute, status } = useAction(newPassword, {
		onSuccess(result) {
			console.log(`\n\n\nSuccess: ${result}\n\n\n`);

			// Access success in result.data
			if (result?.data?.success) {
				setSuccess(result.data.success);
				setError(undefined);
			}
			if (result?.data?.error) {
				setError(result.data.error);
				setSuccess(undefined);
			}
		},
		onError(result) {
			console.log(`\n\n\nAn error occurred: ${result}\n\n\n`);
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

	const onSubmit = (values: z.infer<typeof NewPasswordSchema>) => {
		execute({ password: values.password, token });
	};

	return (
		<>
			<AuthCard
				cardTitle="Enter your new password"
				backButtonHref="/auth/login"
				backButtonLabel="Back to Sign In"
				showSocials
			>
				<div>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)}>
							<div>
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
											<FormDescription />
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormSuccess message={success} />
								<FormError message={error} />
							</div>
							<Button
								disabled={status === "executing"}
								type="submit"
								className={cn(
									"w-full my-2",
									status === "executing"
										? "animate-pulse"
										: ""
								)}
							>
								{"Reset Password"}
							</Button>
						</form>
					</Form>
				</div>
			</AuthCard>
		</>
	);
};
export default NewPasswordForm;
