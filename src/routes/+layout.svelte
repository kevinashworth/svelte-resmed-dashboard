<script>
  import { resolve } from "$app/paths";

  let { children } = $props();
  import "../app.css";
</script>

<nav class="mx-auto flex justify-center gap-4 bg-amber-50 text-xs font-medium text-amber-800">
  <a class="m-1 p-1 hover:bg-amber-100 hover:underline" href={resolve("/")}>Home</a>
  <a class="m-1 p-1 hover:bg-amber-100 hover:underline" href={resolve("/sleep-data")}>Sleep Data</a>
</nav>

<main class="m-1 p-1">
  {@render children()}
</main>
