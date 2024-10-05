"use client";

import AuthCard from "./auth-card";

const LoginForm = () => {
	return (
		<>
			<AuthCard
				cardTitle="Welcome Back"
				backButtonHref="/api/auth/register"
				backButtonLabel="Create a New Account"
				showSocials
			>
				<div>hi</div>
			</AuthCard>
		</>
	);
};
export default LoginForm;
