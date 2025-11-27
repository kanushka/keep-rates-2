import { api } from "~/trpc/server";
import CompareChartClient from "./CompareChartClient";

export default async function CompareSection() {
	const banksData = await api.exchangeRates.getAllBanksHistory({ days: 7 });

	return <CompareChartClient banksData={banksData} />;
}
