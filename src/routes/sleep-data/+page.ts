import type { PageLoad } from "./$types";
import { error } from "@sveltejs/kit";
import type { ChartData } from "$lib/types";

export const load: PageLoad = async ({ fetch }) => {
  let loading = true;
  try {
    const months: string[] = Object.values(
      import.meta.glob("/src/data/monthlySleepRecords/*.json", {
        eager: true,
        query: "?url",
        import: "default",
      }),
    );
    const allData = await Promise.all(
      months.map(async (month) => {
        const response = await fetch(month);
        if (!response.ok) {
          throw new Error(`Failed to load data for ${month}`);
        }
        return response.json();
      }),
    ).finally(() => (loading = false));

    const combinedData = allData.flatMap((monthData) => monthData);

    const oldestDate = new Date(combinedData[0].startDate);
    const newestDate = new Date(combinedData[combinedData.length - 1].startDate);

    // Transform data for the chart
    const chartData: ChartData[] = combinedData.flatMap((record) => [
      {
        group: "Events",
        date: new Date(record.startDate),
        value: record.ahi,
      },
      {
        group: "Mask Seal",
        date: new Date(record.startDate),
        value: record.leakPercentile,
      },
      {
        group: "Mask On/Off",
        date: new Date(record.startDate),
        value: record.maskPairCount,
      },
      {
        group: "myAir Score",
        date: new Date(record.startDate),
        value: record.sleepScore,
      },
      {
        group: "Usage Hours",
        date: new Date(record.startDate),
        value: record.totalUsage,
      },
    ]);

    const eventsData = chartData.filter((item) => item.group === "Events");
    const leakPercentileData = chartData.filter((item) => item.group === "Mask Seal");
    const maskPairCountData = chartData.filter((item) => item.group === "Mask On/Off");
    const sleepScoreData = chartData.filter((item) => item.group === "myAir Score");
    const totalUsageData = chartData.filter((item) => item.group === "Usage Hours");

    return {
      loading,
      loadingError:
        eventsData.length === 0 &&
        leakPercentileData.length === 0 &&
        maskPairCountData.length === 0 &&
        sleepScoreData.length === 0 &&
        totalUsageData.length === 0,
      oldestDate,
      newestDate,
      eventsData,
      leakPercentileData,
      maskPairCountData,
      sleepScoreData,
      totalUsageData,
    };
  } catch (err) {
    console.error("Error loading sleep data:", err);
    throw error(500, "Failed to load sleep data");
  }
};
