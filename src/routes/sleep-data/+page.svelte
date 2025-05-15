<script lang="ts">
  import { Axis, Bars, Chart, Rule, Spline, Svg, Text } from "layerchart";
  import { format, PeriodType } from "@layerstack/utils";
  import { scaleBand } from "d3-scale";
  import { blur, max } from "d3-array";
  import { Tabs, TabItem } from "flowbite-svelte";
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";

  import type { PageProps } from "./$types";
  import type { ChartData, TabNames } from "$lib/types";

  import MyChart from "./my-chart.svelte";
  import MyTabItemTitle from "./my-tab-item-title.svelte";
  import MyTooltip from "./my-tooltip.svelte";

  let { data }: PageProps = $props();

  // Date range control
  let selectedPreset = $state("last60");
  let startDate = $state("");
  let endDate = $state("");
  let currentTab: TabNames = $state("hours"); // default tab

  // On component mount, retrieve the current tab from local storage
  onMount(() => {
    if (!browser) return;
    const storedSelectedPreset = localStorage.getItem("selectedPreset");
    const storedStartDate = localStorage.getItem("startDate");
    const storedEndDate = localStorage.getItem("endDate");
    const storedCurrentTab = localStorage.getItem("currentTab");
    if (storedSelectedPreset) {
      selectedPreset = storedSelectedPreset;
    }
    if (storedStartDate) {
      startDate = storedStartDate;
    }
    if (storedEndDate) {
      endDate = storedEndDate;
    }
    if (storedCurrentTab) {
      currentTab = storedCurrentTab as TabNames;
    }
  });
  onDestroy(() => {
    if (!browser) return;
    localStorage.setItem("startDate", startDate);
    localStorage.setItem("endDate", endDate);
    localStorage.setItem("selectedPreset", selectedPreset);
    localStorage.setItem("currentTab", currentTab);
  });

  function handleTabClick(tabName: TabNames) {
    currentTab = tabName;
  }

  // Initialize and update dates based on preset
  $effect(() => {
    if (startDate === "" && endDate === "" && selectedPreset === "last60") {
      const sixtyDaysAgo = new Date(data.newestDate);
      sixtyDaysAgo.setDate(data.newestDate.getDate() - 60);
      startDate = sixtyDaysAgo.toISOString().split("T")[0];
      endDate = data.newestDate.toISOString().split("T")[0];
    }
  });

  // Filter data based on selected date range
  const dateFilter = (d: { date: string | number | Date }): boolean => {
    const date = new Date(d.date);
    return date >= new Date(startDate) && date <= new Date(endDate);
  };
  const filteredData = $derived({
    eventsData: data.eventsData.filter(dateFilter),
    leakPercentileData: data.leakPercentileData.filter(dateFilter),
    maskPairCountData: data.maskPairCountData.filter(dateFilter),
    sleepScoreData: data.sleepScoreData.filter(dateFilter),
    totalUsageData: data.totalUsageData.filter(dateFilter),
  });

  function handlePresetChange() {
    endDate = data.newestDate.toISOString().split("T")[0];
    if (selectedPreset === "last30") {
      const thirtyDaysAgo = new Date(data.newestDate);
      thirtyDaysAgo.setDate(data.newestDate.getDate() - 30);
      startDate = thirtyDaysAgo.toISOString().split("T")[0];
    } else if (selectedPreset === "last60") {
      const sixtyDaysAgo = new Date(data.newestDate);
      sixtyDaysAgo.setDate(data.newestDate.getDate() - 60);
      startDate = sixtyDaysAgo.toISOString().split("T")[0];
    } else if (selectedPreset === "last90") {
      const ninetyDaysAgo = new Date(data.newestDate);
      ninetyDaysAgo.setDate(data.newestDate.getDate() - 90);
      startDate = ninetyDaysAgo.toISOString().split("T")[0];
    } else if (selectedPreset === "last180") {
      const oneEightyDaysAgo = new Date(data.newestDate);
      oneEightyDaysAgo.setDate(data.newestDate.getDate() - 180);
      startDate = oneEightyDaysAgo.toISOString().split("T")[0];
    } else if (selectedPreset === "lastMonth") {
      const firstDayLastMonth = new Date(data.newestDate.getFullYear(), data.newestDate.getMonth() - 1, 1);
      const lastDayLastMonth = new Date(data.newestDate.getFullYear(), data.newestDate.getMonth(), 0);
      startDate = firstDayLastMonth.toISOString().split("T")[0];
      endDate = lastDayLastMonth.toISOString().split("T")[0];
    } else if (selectedPreset === "lastYear") {
      const firstDayLastYear = new Date(data.newestDate.getFullYear() - 1, 0, 1);
      const lastDayLastYear = new Date(data.newestDate.getFullYear(), 0, 0);
      startDate = firstDayLastYear.toISOString().split("T")[0];
      endDate = lastDayLastYear.toISOString().split("T")[0];
    } else if (selectedPreset === "thisMonth") {
      const firstDayThisMonth = new Date(data.newestDate.getFullYear(), data.newestDate.getMonth(), 1);
      const lastDayThisMonth = new Date(data.newestDate.getFullYear(), data.newestDate.getMonth() + 1, 0);
      startDate = firstDayThisMonth.toISOString().split("T")[0];
      endDate = lastDayThisMonth.toISOString().split("T")[0];
    } else if (selectedPreset === "thisYear") {
      const firstDayThisYear = new Date(data.newestDate.getFullYear(), 0, 1);
      startDate = firstDayThisYear.toISOString().split("T")[0];
      endDate = data.newestDate.toISOString().split("T")[0];
    } else if (selectedPreset === "allTime") {
      startDate = data.oldestDate.toISOString().split("T")[0];
    }
  }

  function handleCustomDateChange() {
    selectedPreset = "custom";
  }

  function blurred(data: ChartData[], windowSize: number) {
    const blurredValues = blur(
      data.map((d) => d.value),
      windowSize,
    );
    return data.map((d, i) => ({
      ...d,
      value: blurredValues[i] || d.value, // Maintain original value if no blur
    }));
  }

  const movingAverage = (data: ChartData[], windowSize: number) => {
    return data.map((row, index, total) => {
      const start = Math.max(0, index - windowSize);
      const end = index;
      const subset = total.slice(start, end + 1);
      const sum = subset.reduce((a, b) => {
        return a + b.value;
      }, 0);
      return {
        group: row.group,
        date: row.date,
        value: sum / subset.length,
      };
    });
  };

  const blurredMovingAverage = (data: ChartData[], windowSize: number) => {
    const ma = movingAverage(data, windowSize);
    const b = blurred(ma, 0.5);
    return b;
  };

  const weeklyMovingAverageData = $derived({
    eventsData: blurredMovingAverage(filteredData.eventsData, 7),
    leakPercentileData: blurredMovingAverage(filteredData.leakPercentileData, 7),
    maskPairCountData: blurredMovingAverage(filteredData.maskPairCountData, 7),
    sleepScoreData: blurredMovingAverage(filteredData.sleepScoreData, 7),
    totalUsageData: blurredMovingAverage(filteredData.totalUsageData, 7),
  });

  function last(data: ChartData[]) {
    if (!data || data.length === 0) return 0;
    return data[data.length - 1].value;
  }
  const lastMovingAverageDataPoint = $derived({
    events: last(weeklyMovingAverageData.eventsData),
    leak: last(weeklyMovingAverageData.leakPercentileData),
    mask: last(weeklyMovingAverageData.maskPairCountData),
    score: last(weeklyMovingAverageData.sleepScoreData),
    usage: last(weeklyMovingAverageData.totalUsageData),
  });
</script>

<div class="p-4">
  <!-- Date Range Controls -->
  <div class="mb-6 inline-block rounded-lg p-4">
    <h1 class="text-primary mb-4 text-xl font-bold">ResMed Sleep Data</h1>
    <div class="flex flex-row items-start gap-4">
      <div class="flex items-center gap-3">
        <label for="preset-range" class="text-primary text-sm font-semibold">Date Range</label>
        <select
          id="preset-range"
          class="rounded border-gray-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
          bind:value={selectedPreset}
          onchange={handlePresetChange}
        >
          <option value="last30">Last 30 Days</option>
          <option value="last60">Last 60 Days</option>
          <option value="last90">Last 90 Days</option>
          <option value="last180">Last 180 Days</option>
          <option value="lastMonth">Last Calendar Month</option>
          <option value="lastYear">Last Calendar Year</option>
          <option value="thisMonth">This Calendar Month</option>
          <option value="thisYear">This Calendar Year</option>
          <option value="allTime">All Days</option>
          <option value="custom">Custom Range →</option>
        </select>
      </div>
      <div class="flex items-center gap-3">
        <label for="start-date" class="text-sm font-medium text-gray-700">Start Date</label>
        <input
          type="date"
          id="start-date"
          class="rounded border-gray-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
          bind:value={startDate}
          onchange={handleCustomDateChange}
          min={data.oldestDate.toISOString().split("T")[0]}
          max={data.newestDate.toISOString().split("T")[0]}
        />
      </div>
      <div class="flex items-center gap-3">
        <label for="end-date" class="text-sm font-medium text-gray-700">End Date</label>
        <input
          type="date"
          id="end-date"
          class="rounded border-gray-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
          bind:value={endDate}
          onchange={handleCustomDateChange}
          min={data.oldestDate.toISOString().split("T")[0]}
          max={data.newestDate.toISOString().split("T")[0]}
        />
      </div>
    </div>
  </div>

  {#if data.loadingError}
    <div>No sleep data available.</div>
  {:else}
    <div class="flex flex-col">
      <Tabs
        tabStyle="underline"
        class="flex-nowrap"
        activeClasses="border-b-4 border-gray-300 p-4"
        inactiveClasses="border-b-4 border-transparent p-4"
        contentClass="rounded-b-lg bg-gray-50 p-4 pt-6"
      >
        <TabItem
          open={currentTab === "hours"}
          class="me-8 w-32"
          activeClasses="p-4 border-b-4 border-hours/80"
          onclick={() => handleTabClick("hours")}
        >
          <MyTabItemTitle slot="title" name="hours" title="Usage Hours" />
          <!-- 1. USAGE HOURS Chart // totalUsage is USAGE HOURS -->
          <div class="m-4">
            <div class="h-[60vh]">
              <MyChart
                axisFormatFn={(d) => `${Math.floor(d / 60)}`}
                classes={{
                  bars: "fill-hours/70",
                  spline: "stroke-hours invert",
                  text: "fill-hours stroke-hours/60 text-xs invert",
                }}
                data={filteredData.totalUsageData}
                leftAxisLabel="Hours"
                lastMovingAverageDataPoint={lastMovingAverageDataPoint.usage}
                splineData={weeklyMovingAverageData.totalUsageData}
                valueFormatFn={(value) => `${Math.floor(value / 60)}hrs ${value % 60}mins`}
              />
            </div>
          </div>
        </TabItem>
        <TabItem
          open={currentTab === "leak"}
          class="mx-8 w-32"
          activeClasses="p-4 border-b-4 border-seal/80"
          onclick={() => handleTabClick("leak")}
        >
          <MyTabItemTitle slot="title" name="leak" title="Mask Seal" />

          <!-- 2. MASK SEAL Chart // leakPercentile is MASK SEAL // -->
          <div class="m-4">
            <div class="h-[60vh]">
              <Chart
                data={filteredData.leakPercentileData}
                x="date"
                xScale={scaleBand().padding(0.4)}
                y="value"
                yDomain={[0, null]}
                padding={{ left: 32, bottom: 24 }}
                tooltip={{ mode: "band" }}
                let:width
                let:yScale
              >
                {@const maxx = max(filteredData.leakPercentileData, (d) => d.value) ?? 10}
                <Svg>
                  <Axis
                    placement="left"
                    grid
                    rule
                    label="Leak (L/min)"
                    classes={{
                      label: "m-8 font-semibold text-base",
                    }}
                    ticks={[...Array(Math.ceil(maxx / 10)).keys()].map((x) => x * 10)}
                  />
                  <Axis
                    placement="bottom"
                    format={(d) => {
                      const date = new Date(d);
                      return date.getDay() === 0 ? format(d, PeriodType.Day, { variant: "short" }) : "";
                    }}
                    rule
                  />
                  <Bars radius={4} rounded="top" class="fill-seal/70" />
                  <Spline data={weeklyMovingAverageData.leakPercentileData} class="stroke-seal invert-60" />
                  <Text
                    x={width}
                    y={yScale(lastMovingAverageDataPoint.leak)}
                    dy={-12}
                    value="Moving Average"
                    textAnchor="end"
                    class="stroke-seal/70 fill-seal text-xs invert-60"
                  />
                  <Rule y={24} class="stroke-gray-400 stroke-1" />
                  <Text
                    x={width}
                    y={yScale(24)}
                    dy={-4}
                    value="Threshold 24 L/min"
                    textAnchor="end"
                    class="fill-gray-400 text-xs"
                  />
                </Svg>
                <MyTooltip valueFormatFn={(value) => `${value} L/min`} />
              </Chart>
            </div>
          </div>
        </TabItem>

        <!-- EVENTS -->
        <TabItem
          open={currentTab === "events"}
          class="mx-8 w-32"
          activeClasses="p-4 border-b-4 border-events/80"
          onclick={() => handleTabClick("events")}
        >
          <MyTabItemTitle slot="title" name="events" title="Events" />

          <!-- 3. EVENTS Chart // events is EVENTS //   -->
          <div class="m-4">
            <div class="h-[60vh]">
              <MyChart
                classes={{
                  bars: "fill-events/70",
                  spline: "stroke-events invert-60",
                  text: "fill-events stroke-events/70 text-xs invert-60",
                }}
                data={filteredData.eventsData}
                lastMovingAverageDataPoint={lastMovingAverageDataPoint.events}
                leftAxisLabel="Events/hour"
                splineData={weeklyMovingAverageData.eventsData}
                valueFormatFn={(value) => `${value} events/hour`}
              />
            </div>
          </div>
        </TabItem>

        <!-- MASK ON/OFF -->
        <TabItem
          open={currentTab === "mask"}
          class="mx-8 w-32"
          activeClasses="p-4 border-b-4 border-mask/80"
          onclick={() => handleTabClick("mask")}
        >
          <MyTabItemTitle slot="title" name="mask" title="Mask On/Off" />

          <!-- 4. MASK ON/OFF Chart // maskPairCount is MASK ON/OFF -->
          <div class="m-4">
            <div class="h-[60vh]">
              <MyChart
                classes={{
                  bars: "fill-mask/70",
                  spline: "stroke-mask invert-60",
                  text: "stroke-mask/60 fill-mask text-xs invert-60",
                }}
                data={filteredData.maskPairCountData}
                lastMovingAverageDataPoint={lastMovingAverageDataPoint.mask}
                leftAxisLabel="On/Off"
                splineData={weeklyMovingAverageData.maskPairCountData}
                valueFormatFn={(value) => `${value} times`}
              />
            </div>
          </div>
        </TabItem>

        <!-- SCORE -->
        <TabItem
          open={currentTab === "score"}
          class="ms-8 w-32"
          activeClasses="p-4 border-b-4 border-score/80"
          onclick={() => handleTabClick("score")}
        >
          <MyTabItemTitle slot="title" name="score" title="myAir Score" />

          <!--5. MYAIR SCORE Chart // sleepScore is MYAIR SCORE -->
          <div class="m-4">
            <div class="h-[60vh]">
              <MyChart
                classes={{
                  bars: "fill-score/80",
                  spline: "stroke-score invert",
                  text: "fill-score stroke-score/60 text-xs invert",
                }}
                data={filteredData.sleepScoreData}
                lastMovingAverageDataPoint={lastMovingAverageDataPoint.score}
                leftAxisLabel="Sleep Score"
                splineData={weeklyMovingAverageData.sleepScoreData}
                valueFormatFn={(value) => `${value}/100`}
              />
            </div>
          </div>
        </TabItem>
      </Tabs>
    </div>
  {/if}
</div>
