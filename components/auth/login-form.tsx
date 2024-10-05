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

const LoginForm = () => {
	const form = useForm({
		resolver: zodResolver(LoginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const { execute, status } = useAction(emailSignIn);

	const onSubmit = (values: z.infer<typeof LoginSchema>) => {
		console.log(values);
		execute(values);
	};
	return (
		<>
			<AuthCard
				cardTitle="Welcome Back!"
				backButtonHref="/api/auth/register"
				backButtonLabel="Create a New Account"
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
													placeholder="youremail@email.com"
													type="email"
													autoComplete="email"
													{...field}
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
								<Button size={"sm"} variant={"link"} asChild>
									<Link href="/auth/reset-password">
										Forgot Password?
									</Link>
								</Button>
							</div>
							<Button
								type="submit"
								className={cn(
									"w-full my-2",
									status === "executing"
										? "animate-pulse"
										: ""
								)}
							>
								{"Sign in"}
							</Button>
						</form>
					</Form>
				</div>
			</AuthCard>
		</>
	);
};
export default LoginForm;
