import Image from "next/image";

export default function Loading() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
			{/* Header Skeleton */}
			<header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
				<div className="container mx-auto max-w-6xl px-4">
					<div className="flex items-center justify-between h-16">
						<div className="flex items-center space-x-2">
							<Image
								src="/favicon/apple-touch-icon.png"
								alt="Keep Rates Logo"
								width={32}
								height={32}
								className="w-8 h-8"
								priority
							/>
							<span className="text-xl font-bold text-gray-900">Keep Rates</span>
						</div>
						<div className="flex items-center space-x-4">
							<div className="h-8 bg-gray-200 rounded-lg w-20 animate-pulse"></div>
							<div className="h-8 bg-gray-200 rounded-lg w-20 animate-pulse"></div>
						</div>
					</div>
				</div>
			</header>

			<main className="py-8 px-4">
				<div className="container mx-auto max-w-6xl">
					{/* Hero Section Skeleton */}
					<div className="text-center mb-16">
						<div className="h-12 bg-gray-200 rounded-lg mb-4 animate-pulse max-w-2xl mx-auto"></div>
						<div className="h-6 bg-gray-200 rounded-lg mb-8 animate-pulse max-w-3xl mx-auto"></div>
						<div className="flex justify-center space-x-4">
							<div className="h-12 bg-blue-600 rounded-lg w-32 animate-pulse"></div>
							<div className="h-12 bg-gray-200 rounded-lg w-32 animate-pulse"></div>
						</div>
					</div>

					{/* Stats Section Skeleton */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
						{Array.from({ length: 3 }).map((_, i) => (
							<div key={i} className="text-center">
								<div className="h-8 bg-gray-200 rounded-lg mb-2 animate-pulse"></div>
								<div className="h-4 bg-gray-200 rounded-lg w-2/3 mx-auto animate-pulse"></div>
							</div>
						))}
					</div>

					{/* Features Section Skeleton */}
					<div className="mb-16">
						<div className="h-8 bg-gray-200 rounded-lg mb-8 animate-pulse max-w-md mx-auto"></div>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
							{Array.from({ length: 3 }).map((_, i) => (
								<div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
									<div className="w-12 h-12 bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
									<div className="h-6 bg-gray-200 rounded-lg mb-3 animate-pulse"></div>
									<div className="h-4 bg-gray-200 rounded-lg mb-2 animate-pulse"></div>
									<div className="h-4 bg-gray-200 rounded-lg w-2/3 animate-pulse"></div>
								</div>
							))}
						</div>
					</div>

					{/* Banks Section Skeleton */}
					<div>
						<div className="h-8 bg-gray-200 rounded-lg mb-8 animate-pulse max-w-md mx-auto"></div>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
							{Array.from({ length: 4 }).map((_, i) => (
								<div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
									<div className="flex items-center space-x-4 mb-4">
										<div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
										<div className="flex-1">
											<div className="h-5 bg-gray-200 rounded-lg mb-2 animate-pulse"></div>
											<div className="h-4 bg-gray-200 rounded-lg w-2/3 animate-pulse"></div>
										</div>
									</div>
									<div className="space-y-2">
										<div className="h-4 bg-gray-200 rounded animate-pulse"></div>
										<div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
									</div>
									<div className="mt-4 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
								</div>
							))}
						</div>
					</div>
				</div>
			</main>
		</div>
	);
} 
