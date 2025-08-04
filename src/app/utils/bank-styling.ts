export interface BankStyling {
	bgGradient: string;
	icon: string;
	accent: string;
}

export function getBankStyling(code: string): BankStyling {
	switch (code) {
		case 'combank':
			return {
				bgGradient: 'from-blue-600 to-blue-700',
				icon: '🟦',
				accent: 'blue'
			};
		case 'ndb':
			return {
				bgGradient: 'from-red-600 to-red-700',
				icon: '🔴',
				accent: 'red'
			};
		case 'sampath':
			return {
				bgGradient: 'from-amber-600 to-amber-700',
				icon: '🔶',
				accent: 'amber'
			};
		case 'cbsl':
			return {
				bgGradient: 'from-purple-600 to-purple-700',
				icon: '🏛️',
				accent: 'purple'
			};
		default:
			return {
				bgGradient: 'from-gray-600 to-gray-700',
				icon: '*️⃣',
				accent: 'gray'
			};
	}
}
