export default function RateChartSkeleton() {
	return (
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
	);
} 
