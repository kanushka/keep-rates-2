export function CompareChartSkeletonChart() {
	return (
		<div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg h-96 flex items-center justify-center">
			<div className="text-center">
				<div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse"></div>
				<div className="h-4 bg-gray-200 rounded w-40 mx-auto mb-2 animate-pulse"></div>
				<div className="h-3 bg-gray-200 rounded w-32 mx-auto animate-pulse"></div>
			</div>
		</div>
	);
}

export default function CompareSkeleton() {
	return (
		<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
			{/* Rate Type Selector Skeleton */}
			<div className="mb-6">
				<div className="h-6 bg-gray-200 rounded w-40 mb-4 animate-pulse"></div>
				<div className="flex flex-wrap gap-3">
					<div className="h-12 bg-gray-200 rounded-lg w-52 animate-pulse"></div>
					<div className="h-12 bg-gray-200 rounded-lg w-32 animate-pulse"></div>
					<div className="h-12 bg-gray-200 rounded-lg w-32 animate-pulse"></div>
				</div>
			</div>

			{/* Chart Skeleton */}
			<div className="border-t border-gray-200 pt-6">
				<CompareChartSkeletonChart />
			</div>

			{/* Info Section Skeleton */}
			<div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
				<div className="flex items-start space-x-3">
					<div className="w-5 h-5 bg-gray-200 rounded-full flex-shrink-0 animate-pulse"></div>
					<div className="flex-1 space-y-2">
						<div className="h-4 bg-gray-200 rounded w-32 mb-3 animate-pulse"></div>
						<div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
						<div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse"></div>
						<div className="h-3 bg-gray-200 rounded w-4/5 animate-pulse"></div>
					</div>
				</div>
			</div>
		</div>
	);
}
