import { DDGS } from "../src/duckduckgoSearch";

async function searchExample() {
  const ddgs = new DDGS();

  try {
    const results = await ddgs.text({
      keywords: "typescript programming",
    });

    // Advanced search with options
    const advancedResults = await ddgs.text({
      keywords: "typescript programming",
      region: "us-en", // Search in US region
      safesearch: "moderate", // Can be "off", "moderate", or "strict"
      timelimit: "d", // Past 24 hours (can be "d", "w", "m", or "y")
      maxResults: 10, // Limit results
      backend: "html", // Force HTML backend (can be "html", "lite", or "auto")
    });

    results.forEach((result, index) => {
      console.log(`\nResult ${index + 1}:`);
      console.log(`Title: ${result.title}`);
      console.log(`URL: ${result.href}`);
      console.log(`Description: ${result.body}`);
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Search failed:", error.message);
    }
  }
}

// Run the example
searchExample();
