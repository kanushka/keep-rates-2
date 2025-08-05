export default function Loading() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
			{/* Header */}
			<header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
				<div className="container mx-auto max-w-6xl px-4">
					<div className="flex items-center justify-between h-16">
						<div className="flex items-center space-x-4">
							<div className="flex items-center space-x-2 text-gray-600">
								<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
								</svg>
								<span>Back to Home</span>
							</div>
						</div>
						<div className="flex items-center space-x-2">
							<div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-lg flex items-center justify-center">
								<span className="text-white font-bold text-sm">KR</span>
							</div>
							<span className="text-xl font-bold text-gray-900">Keep Rates</span>
						</div>
					</div>
				</div>
			</header>

			<main className="py-8 px-4">
				<div className="container mx-auto max-w-4xl">
					{/* Bank Header Skeleton */}
					<div className="bg-gradient-to-r from-gray-300 to-gray-400 rounded-2xl p-8 text-white mb-8 animate-pulse">
						<div className="flex items-center space-x-4 mb-6">
							<div className="w-12 h-12 bg-white/20 rounded-full animate-pulse"></div>
							<div className="flex-1">
								<div className="h-8 bg-white/20 rounded-lg mb-2 animate-pulse"></div>
								<div className="h-6 bg-white/20 rounded-lg w-1/2 animate-pulse"></div>
							</div>
							<div className="bg-white/20 px-4 py-2 rounded-full w-20 h-8 animate-pulse"></div>
						</div>

						{/* Status and Info Skeleton */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							{Array.from({ length: 3 }).map((_, i) => (
								<div key={i} className="bg-white/10 rounded-lg p-4">
									<div className="h-4 bg-white/20 rounded mb-2 animate-pulse"></div>
									<div className="h-6 bg-white/20 rounded animate-pulse"></div>
								</div>
							))}
						</div>
					</div>

					{/* Current Rates Section Skeleton */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
						<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
							<div className="h-6 bg-gray-200 rounded-lg mb-6 animate-pulse"></div>
							<div className="space-y-4">
								{Array.from({ length: 3 }).map((_, i) => (
									<div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
										<div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
										<div className="h-8 bg-gray-200 rounded mb-2 animate-pulse"></div>
										<div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
									</div>
								))}
							</div>
						</div>

						{/* Quick Stats Skeleton */}
						<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
							<div className="h-6 bg-gray-200 rounded-lg mb-6 animate-pulse"></div>
							<div className="space-y-4">
								{Array.from({ length: 4 }).map((_, i) => (
									<div key={i} className="flex justify-between items-center">
										<div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
										<div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
									</div>
								))}
							</div>
						</div>
					</div>

					{/* Chart Skeleton */}
					<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
						<div className="h-6 bg-gray-200 rounded-lg mb-6 animate-pulse"></div>
						<div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg h-64 flex items-center justify-center">
							<div className="text-center">
								<div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse"></div>
								<div className="h-4 bg-gray-200 rounded w-32 mx-auto mb-2 animate-pulse"></div>
								<div className="h-3 bg-gray-200 rounded w-24 mx-auto animate-pulse"></div>
							</div>
						</div>
					</div>

					{/* Bank Information Skeleton */}
					<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
						<div className="h-6 bg-gray-200 rounded-lg mb-6 animate-pulse"></div>
						<div className="space-y-4">
							{Array.from({ length: 4 }).map((_, i) => (
								<div key={i}>
									<div className="h-3 bg-gray-200 rounded w-20 mb-1 animate-pulse"></div>
									<div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse"></div>
								</div>
							))}
						</div>
					</div>
				</div>
			</main>
		</div>
	);
} 
