export default function CurrentRatesSkeleton() {
	return (
		<div className="space-y-4">
			{Array.from({ length: 3 }).map((_, i) => (
				<div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
					<div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
					<div className="h-8 bg-gray-200 rounded mb-2 animate-pulse"></div>
					<div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
				</div>
			))}
		</div>
	);
} 
