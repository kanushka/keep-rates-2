import { AlertTriangle } from "lucide-react";

export function DataDisclaimerBanner() {
	return (
		<div className="bg-amber-50 border-b border-amber-200">
			<div className="container mx-auto max-w-6xl px-4 py-3">
				<div className="flex items-start justify-center text-center">
					<AlertTriangle className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0" />
					<div className="text-sm text-amber-800">
						<strong>Important Notice:</strong> Exchange rates displayed are collected through automated web scraping and may not reflect real-time accuracy. 
						For official rates and transactions, please visit the respective bank's official website. 
						This platform is designed for informational and analytical purposes only.
					</div>
				</div>
			</div>
		</div>
	);
} 
