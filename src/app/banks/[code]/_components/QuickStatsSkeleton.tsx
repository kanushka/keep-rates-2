export default function QuickStatsSkeleton() {
	return (
		<div className="space-y-4">
			{Array.from({ length: 4 }).map((_, i) => (
				<div key={i} className="flex justify-between items-center">
					<div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
					<div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
				</div>
			))}
		</div>
	);
} 
