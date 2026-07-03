<script lang="ts">
  import type { Component } from "svelte";
  import AhiEventsIcon from "./icons/ahi-events.svelte";
  import MaskLeakIcon from "./icons/mask-leak.svelte";
  import MaskOnOffIcon from "./icons/mask-on-off.svelte";
  import SleepScoreIcon from "./icons/sleep-score.svelte";
  import UsageHoursIcon from "./icons/usage-hours.svelte";

  import type { IconNames } from "$lib/types";

  interface Props {
    name: IconNames;
    title: string;
  }

  let { name = "hours", title = "Usage Hours" }: Props = $props();

  const fillClassMap: Record<string, string> = {
    events: "fill-events",
    hours: "fill-hours",
    leak: "fill-seal",
    mask: "fill-mask",
    score: "fill-score",
  };

  const iconComponentMap: Record<string, Component> = {
    events: AhiEventsIcon,
    hours: UsageHoursIcon,
    leak: MaskLeakIcon,
    mask: MaskOnOffIcon,
    score: SleepScoreIcon,
  };

  let fillClass = $derived(fillClassMap[name] ?? "fill-hours");
  let IconComponent = $derived(iconComponentMap[name] ?? UsageHoursIcon);
</script>

<div class="flex flex-col items-center justify-start">
  <IconComponent class={[fillClass, "size-12"]} />
  <h2 class="text-xs font-medium whitespace-nowrap text-gray-500 uppercase">
    {title}
  </h2>
  <div class="h-0 w-32 bg-white in-[.active]:bg-gray-50"></div>
</div>
