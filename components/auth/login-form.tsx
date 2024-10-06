"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../ui/form";
import AuthCard from "./auth-card";
import { LoginSchema } from "@/types/login-schema";
import { z } from "zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Link from "next/link";
import { emailSignIn } from "@/server/actions/email-signin";
import { useAction } from "next-safe-action/hooks";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { FormSuccess } from "./form-success";
import { FormError } from "./form-error";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";

const LoginForm = () => {
	const form = useForm<z.infer<typeof LoginSchema>>({
		resolver: zodResolver(LoginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const [error, setError] = useState<string | undefined>(undefined);
	const [success, setSuccess] = useState<string | undefined>(undefined);
	const [showTwoFactor, setShowTwoFactor] = useState(false);

	const { execute, status } = useAction(emailSignIn, {
		onSuccess(result) {
			console.log(`\n\n\nSuccess: ${result}\n\n\n`);

			// Access success in result.data
			if (result?.data?.success) {
				setSuccess(result.data.success);
				setError(undefined);
			}
			if (result?.data?.twoFactor) {
				setShowTwoFactor(true);
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

	const onSubmit = (values: z.infer<typeof LoginSchema>) => {
		console.log(values);
		execute(values);
	};

	return (
		<>
			<AuthCard
				cardTitle="Welcome back!"
				backButtonHref="/auth/register"
				backButtonLabel="Create a new account"
				showSocials
			>
				<div>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)}>
							<div>
								{showTwoFactor && (
									<FormField
										control={form.control}
										name="code"
										render={({ field }) => (
											<FormItem>
												<FormLabel>
													We&apos;ve sent you a two
													factor code to your email.
												</FormLabel>
												<FormControl>
													<InputOTP
														disabled={
															status ===
															"executing"
														}
														{...field}
														maxLength={6}
													>
														<InputOTPGroup>
															<InputOTPSlot
																index={0}
															/>
															<InputOTPSlot
																index={1}
															/>
															<InputOTPSlot
																index={2}
															/>
															<InputOTPSlot
																index={3}
															/>
															<InputOTPSlot
																index={4}
															/>
															<InputOTPSlot
																index={5}
															/>
														</InputOTPGroup>
													</InputOTP>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								)}
								{!showTwoFactor && (
									<>
										<FormField
											control={form.control}
											name="email"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Email</FormLabel>
													<FormControl>
														<Input
															{...field}
															placeholder="someemail@gmail.com"
															type="email"
															autoComplete="email"
														/>
													</FormControl>
													<FormDescription />
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="password"
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														Password
													</FormLabel>
													<FormControl>
														<Input
															{...field}
															placeholder="*********"
															type="password"
															autoComplete="current-password"
														/>
													</FormControl>
													<FormDescription />
													<FormMessage />
												</FormItem>
											)}
										/>
									</>
								)}
								<FormSuccess message={success} />
								<FormError message={error} />
								<Button
									size={"sm"}
									className="px-0"
									variant={"link"}
									asChild
								>
									<Link href="/auth/reset">
										Forgot your password
									</Link>
								</Button>
							</div>
							<Button
								type="submit"
								className={cn(
									"w-full my-4",
									status === "executing"
										? "animate-pulse"
										: ""
								)}
							>
								{showTwoFactor ? "Verify" : "Sign In"}
							</Button>
						</form>
					</Form>
				</div>
			</AuthCard>{" "}
		</>
	);
};
export default LoginForm;
