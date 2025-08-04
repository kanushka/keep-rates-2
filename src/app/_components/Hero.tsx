export function Hero() {
	return (
		<section className="pt-20 pb-16 px-4">
			<div className="container mx-auto max-w-6xl text-center">
				<div className="max-w-3xl mx-auto">
					<h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
						Track{" "}
						<span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
							USD/LKR
						</span>{" "}
						Exchange Rates
					</h1>
					<p className="text-xl text-gray-600 mb-8 leading-relaxed">
						Get real-time USD/LKR exchange rates from Sri Lanka's leading banks. 
						Monitor trends, analyze historical data, and receive daily email updates 
						to make informed currency exchange decisions.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
							View Current Rates
						</button>
						<button className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium">
							Subscribe for Updates
						</button>
					</div>
				</div>
				
				{/* Stats */}
				<div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
					<div className="text-center">
						<div className="text-3xl font-bold text-blue-600 mb-2">4</div>
						<div className="text-gray-600">Banks Tracked</div>
					</div>
					<div className="text-center">
						<div className="text-3xl font-bold text-emerald-600 mb-2">24/7</div>
						<div className="text-gray-600">Rate Monitoring</div>
					</div>
					<div className="text-center">
						<div className="text-3xl font-bold text-purple-600 mb-2">Free</div>
						<div className="text-gray-600">Daily Updates</div>
					</div>
				</div>
			</div>
		</section>
	);
}
