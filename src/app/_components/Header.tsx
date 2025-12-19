import Image from "next/image";
import Link from "next/link";

export function Header() {
	return (
		<header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
			<div className="container mx-auto max-w-6xl px-4">
				<div className="flex items-center justify-between h-16">
					{/* Logo */}
					<Link href="/" className="flex items-center space-x-2">
						<Image
							src="/favicon/apple-touch-icon.png"
							alt="Keep Rates Logo"
							width={32}
							height={32}
							className="w-8 h-8"
							priority
						/>
						<span className="text-xl font-bold text-gray-900">Keep Rates</span>
					</Link>

					{/* Navigation */}
					<nav className="hidden md:flex items-center space-x-6">
						<Link
							href="/compare"
							className="text-gray-600 hover:text-gray-900 transition-colors"
						>
							Compare
						</Link>
						<Link
							href="/tax-years"
							className="text-gray-600 hover:text-gray-900 transition-colors"
						>
							Tax Years
						</Link>
						<Link
							href="/about"
							className="text-gray-600 hover:text-gray-900 transition-colors"
						>
							About
						</Link>
					</nav>

					{/* CTA Button */}
					<div className="flex items-center space-x-4">
						<Link 
							href="/subscribe" 
							className="bg-gradient-to-br from-gray-800 to-slate-400 text-white px-4 py-2 rounded-lg hover:bg-gradient-to-b hover:from-gray-800 hover:to-slate-400 transition-all text-sm font-medium"
						>
							Subscribe
						</Link>
					</div>
				</div>
			</div>
		</header>
	);
}
