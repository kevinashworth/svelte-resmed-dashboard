<section class="mx-auto w-full bg-white bg-gradient-to-r p-2 sm:p-6">
  <section class="relative py-6 sm:py-10">
    <div class="mx-auto max-w-screen-md px-4 py-8 sm:py-16 lg:px-6">
      <h2 class="mb-4 text-4xl font-extrabold tracking-tight text-gray-900">
        My <span class="text-accent-600">ResMed <span class="font-normal">my</span>Air</span> Sleep Data Dashboard
      </h2>
      <p class="mb-6 font-light text-gray-500 md:text-lg">
        This is a simple personal project. I built a web app to view my <span
          class="text-accent-600 hover:text-accent-700 font-medium underline hover:decoration-2"
          ><a href="https://myair.resmed.com"><span class="font-normal">my</span>Air</a></span
        >
        data in a new way, hoping to see my data over a variety of timespans. At the same time, I wanted to learn more about
        the latest version of
        <span class="font-medium text-red-600 underline hover:text-red-700 hover:decoration-2"
          ><a href="https://svelte.dev/">Svelte</a></span
        >, and decided to build an app of some potential usefulness to me.
      </p>

      <p class="mb-6 font-light text-gray-500 md:text-lg">
        Feel free to use this for yourself. You just need to get your own <span
          class="text-accent-600 hover:text-accent-700 font-medium underline hover:decoration-2"
          ><a href="https://myair.resmed.com"><span class="font-normal">my</span>Air</a></span
        >
        data. To do so, copy your data into the
        <code class="text-amber-900">data/monthlySleepRecords</code>
        folder, with filenames of the pattern
        <code class="text-amber-900">2025-02.json</code>. Each month is a POST network request to a URL ending in
        <code class="text-amber-900">/graphql</code>. So, open your browser’s dev tools and copy the request’s results
        from the dev tools to a file that you create. It’s GraphQL data, but you can save it as-is to JSON.
      </p>

      <div class="flex flex-wrap items-center gap-4">
        <a
          href="/sleep-data"
          class="inline-flex items-center justify-center rounded-lg bg-red-700 px-5 py-3 text-center text-base font-semibold text-white focus-within:ring-4 focus-within:ring-red-300 focus-within:outline-none hover:bg-red-800 dark:bg-red-600 dark:focus-within:ring-red-900 dark:hover:bg-red-700"
          role="button">Sleep Data</a
        >
      </div>
    </div>
  </section>
</section>
