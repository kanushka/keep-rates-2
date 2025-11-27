import Link from "next/link";

export function Header() {
	return (
		<header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
			<div className="container mx-auto max-w-6xl px-4">
				<div className="flex items-center justify-between h-16">
					{/* Logo */}
					<Link href="/" className="flex items-center space-x-2">
						<div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-lg flex items-center justify-center">
							<span className="text-white font-bold text-sm">KR</span>
						</div>
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
							className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
						>
							Subscribe
						</Link>
					</div>
				</div>
			</div>
		</header>
	);
}
