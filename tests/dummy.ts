import { DDGS } from "../dist/index.cjs";

async function searchExample() {
  const ddgs = new DDGS();

  try {
    const results = await ddgs.text({
      keywords: "warhammer 40k",
    });

    // const advancedResults = await ddgs.text({
    //   keywords: "typescript programming",
    //   region: "us-en",
    //   safesearch: "moderate",
    //   timelimit: "d",
    //   maxResults: 10,
    //   backend: "html",
    // });

    results.forEach((result, index) => {
      console.log(`\nResult ${index + 1}:`);
      console.log(`Title: ${result.title}`);
      console.log(`URL: ${result.href}`);
      console.log(`Description: ${result.body}`);
      console.log('--------------------------------------------');
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Search failed:", error.message);
    }
  }
}

searchExample();
