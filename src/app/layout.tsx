import "~/styles/globals.css";

import type { Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
	title: "Keep Rates - USD/LKR Exchange Rate Tracker",
	description: "Track real-time USD/LKR exchange rates from Sri Lanka's leading banks. Get daily updates, historical data, and tax year summaries for informed currency exchange decisions.",
	keywords: "USD LKR exchange rate, Sri Lanka currency, Commercial Bank, NDB Bank, Sampath Bank, Central Bank",
	icons: {
		icon: [
			{ url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
			{ url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
			{ url: "/favicon/favicon.ico", sizes: "any" },
		],
		apple: [
			{ url: "/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
		],
		other: [
			{
				rel: "android-chrome-192x192",
				url: "/favicon/android-chrome-192x192.png",
			},
			{
				rel: "android-chrome-512x512",
				url: "/favicon/android-chrome-512x512.png",
			},
		],
	},
	manifest: "/favicon/site.webmanifest",
	openGraph: {
		title: "Keep Rates - USD/LKR Exchange Rate Tracker",
		description: "Track real-time USD/LKR exchange rates from Sri Lanka's leading banks",
		type: "website",
		locale: "en_US",
	},
	twitter: {
		card: "summary_large_image",
		title: "Keep Rates - USD/LKR Exchange Rate Tracker",
		description: "Track real-time USD/LKR exchange rates from Sri Lanka's leading banks",
	},
};

const geist = Geist({
	subsets: ["latin"],
	variable: "--font-geist-sans",
});

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" className={`${geist.variable}`}>
			<body>
				<TRPCReactProvider>{children}</TRPCReactProvider>
			</body>
		</html>
	);
}
