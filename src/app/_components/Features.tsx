export function Features() {
	const features = [
		{
			icon: "📊",
			title: "Real-Time Rates",
			description: "Get up-to-date USD/LKR exchange rates from major Sri Lankan banks, updated hourly during banking hours."
		},
		{
			icon: "📈",
			title: "Historical Analysis",
			description: "Track rate changes over time with interactive charts and identify the best times for currency exchange."
		},
		{
			icon: "📧",
			title: "Email Notifications",
			description: "Receive daily email digests with current rates and significant changes across all tracked banks."
		},
		{
			icon: "🏦",
			title: "Multiple Banks",
			description: "Compare rates from Commercial Bank, NDB Bank, Sampath Bank, and Central Bank of Sri Lanka."
		},
		{
			icon: "📅",
			title: "Tax Year Summaries",
			description: "Generate monthly rate summaries for Sri Lankan tax years (April-March) for easy record keeping."
		},
		{
			icon: "⚡",
			title: "Fast & Reliable",
			description: "Built with modern technology stack for lightning-fast performance and 99.9% uptime."
		}
	];

	return (
		<section className="py-16 px-4 bg-gray-50">
			<div className="container mx-auto max-w-6xl">
				<div className="text-center mb-16">
					<h2 className="text-3xl font-bold text-gray-900 mb-4">
						Everything You Need for Currency Tracking
					</h2>
					<p className="text-lg text-gray-600 max-w-2xl mx-auto">
						Keep Rates provides comprehensive tools and insights to help you make 
						informed decisions about USD/LKR currency exchanges.
					</p>
				</div>
				
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{features.map((feature, index) => (
						<div 
							key={index}
							className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
						>
							<div className="text-3xl mb-4">{feature.icon}</div>
							<h3 className="text-xl font-semibold text-gray-900 mb-3">
								{feature.title}
							</h3>
							<p className="text-gray-600 leading-relaxed">
								{feature.description}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
