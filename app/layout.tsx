import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

import Nav from "@/components/navigation/nav";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/providers/theme-providers";
import { Toaster } from "@/components/ui/sonner";

const geistSans = localFont({
	src: "./fonts/GeistVF.woff",
	variable: "--font-geist-sans",
	weight: "100 900",
});
const geistMono = localFont({
	src: "./fonts/GeistMonoVF.woff",
	variable: "--font-geist-mono",
	weight: "100 900",
});

export const metadata: Metadata = {
	title: "Sprout & Scribble",
	description: "An ecommerce platform",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={geistSans.className}>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
				>
					<div
						className={cn(
							`${geistSans.variable} ${geistMono.variable} 
							antialiased 
							flex-grow 
							px-6 md:px-12 mx-auto`,
							geistSans.className
						)}
					>
						<Nav />
						<Toaster />
						{children}
					</div>
				</ThemeProvider>
			</body>
		</html>
	);
}
