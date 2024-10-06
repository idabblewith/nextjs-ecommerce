"use client";

import { cn } from "@/lib/utils";
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
import { ResetSchema } from "@/types/reset-schema";
import { reset } from "@/server/actions/password-reset";

const ResetForm = () => {
	const form = useForm({
		resolver: zodResolver(ResetSchema),
		defaultValues: {
			email: "",
		},
	});

	const [error, setError] = useState<string | undefined>(undefined);
	const [success, setSuccess] = useState<string | undefined>(undefined);

	const { execute, status } = useAction(reset, {
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

	const onSubmit = (values: z.infer<typeof ResetSchema>) => {
		execute(values);
	};

	return (
		<>
			<AuthCard
				cardTitle="Forgot Password"
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
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Email</FormLabel>
											<FormControl>
												<Input
													placeholder="email@example.com"
													type="email"
													autoComplete="email"
													{...field}
													disabled={
														status === "executing"
													}
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
								{"Reset"}
							</Button>
						</form>
					</Form>
				</div>
			</AuthCard>
		</>
	);
};
export default ResetForm;
