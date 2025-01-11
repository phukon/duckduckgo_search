import https from "node:https";
import { _normalize, _normalizeUrl } from "./utils";
import axios, { AxiosInstance } from "axios";
import { JSDOM } from "jsdom";
import { SearchResult, Region, SafeSearch, TimeLimit, Backend } from "./types";
import { DuckDuckGoSearchError, RatelimitError, TimeoutError } from "./errors";
import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [new winston.transports.File({ filename: "error.log", level: "error" }), new winston.transports.File({ filename: "combined.log" })],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

export class DDGS {
  private readonly client: AxiosInstance;
  private sleepTimestamp: number = 0;

  private static readonly IMPERSONATES = [
    "chrome_100",
    "chrome_101",
    "chrome_104",
    "chrome_105",
    "chrome_106",
    "chrome_107",
    "chrome_108",
    "chrome_109",
    "chrome_114",
    "chrome_116",
    "chrome_117",
    "chrome_118",
    "chrome_119",
    "chrome_120",
    "chrome_123",
    "chrome_124",
    "chrome_126",
    "chrome_127",
    "chrome_128",
    "chrome_129",
    "chrome_130",
    "chrome_131",
    "safari_ios_16.5",
    "safari_ios_17.2",
    "safari_ios_17.4.1",
    "safari_ios_18.1.1",
    "safari_15.3",
    "safari_15.5",
    "safari_15.6.1",
    "safari_16",
    "safari_16.5",
    "safari_17.0",
    "safari_17.2.1",
    "safari_17.4.1",
    "safari_17.5",
    "safari_18",
    "safari_18.2",
    "safari_ipad_18",
    "edge_101",
    "edge_122",
    "edge_127",
    "edge_131",
    "firefox_109",
    "firefox_117",
    "firefox_128",
    "firefox_133",
  ];

  constructor(
    options: {
      headers?: Record<string, string>;
      proxy?: string;
      timeout?: number;
      verify?: boolean;
    } = {}
  ) {
    const { headers = {}, proxy, timeout = 10000, verify = true } = options;
    logger.info("Initializing DDGS with options", { proxy, timeout, verify });

    this.client = axios.create({
      timeout,
      headers: {
        ...headers,
        Referer: "https://duckduckgo.com/",
        "User-Agent": this.getRandomUserAgent(),
      },
      proxy: proxy
        ? {
            host: new URL(proxy).hostname,
            port: Number(new URL(proxy).port),
            protocol: new URL(proxy).protocol.slice(0, -1),
          }
        : undefined,
      /**
       * If verify is true (default): Uses default Node.js HTTPS behavior with certificate verification
       * If verify is false: Creates a new HTTPS agent that skips certificate verification
       */
      // TODO: do I need to keep connections open?
      httpsAgent: verify ? undefined : new https.Agent({ rejectUnauthorized: false, keepAlive: true }),
    });
  }

  private getRandomUserAgent(): string {
    const userAgent = DDGS.IMPERSONATES[Math.floor(Math.random() * DDGS.IMPERSONATES.length)];
    logger.debug("Selected random user agent", { userAgent });
    return userAgent;
  }

  private async sleep(sleepTime: number = 0.75): Promise<void> {
    const now = Date.now() / 1000;
    const delay = !this.sleepTimestamp ? 0 : now - this.sleepTimestamp >= 20 ? 0 : sleepTime * 1000;
    this.sleepTimestamp = now;
    logger.debug("Sleeping", { delay });
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  // TODO: content, data, cookies
  private async getUrl(options: { method: string; url: string; params?: Record<string, string>; data?: any }): Promise<any> {
    logger.info("Making request", { method: options.method, url: options.url });
    await this.sleep();
    try {
      const response = await this.client.request({
        ...options,
        data: options.data,
      });

      if (response.status === 200) {
        logger.debug("Request successful", { status: response.status, url: options.url });
        return response.data;
      } else if ([202, 301, 403].includes(response.status)) {
        logger.warn("Ratelimit hit", { status: response.status, url: options.url });
        throw new RatelimitError(`${response.config.url} ${response.status} Ratelimit`);
      }
      logger.error("Unexpected status code", { status: response.status, url: options.url });
      throw new DuckDuckGoSearchError(`${response.config.url} returned unexpected status ${response.status}`);
    } catch (error: any) {
      if (error instanceof RatelimitError) {
        throw error;
      }

      if (error.message.toLowerCase().includes("timeout")) {
        logger.error("Request timeout", { url: options.url, error: error.message });
        throw new TimeoutError(`${options.url} request timed out`);
      }

      logger.error("Request failed", { url: options.url, error: error.message });
      throw new DuckDuckGoSearchError(`${options.url} request failed: ${error.message}`);
    }
  }

  async text(options: { keywords: string; region?: Region; safesearch?: SafeSearch; timelimit?: TimeLimit; backend?: Backend; maxResults?: number }): Promise<SearchResult[]> {
    const { keywords, region = "wt-wt", safesearch = "moderate", timelimit = null, backend = "auto", maxResults = null } = options;
    logger.info("Starting text search", { keywords, region, safesearch, timelimit, backend, maxResults });

    if (!keywords) {
      logger.error("No keywords provided");
      throw new DuckDuckGoSearchError("keywords is mandatory");
    }

    const backends = backend === "auto" ? ["html", "lite"] : [backend];
    /**
     * The comparator function in sort() determines the order of elements.
     * It returns:
     * - A negative number if the first argument (a) should come before the second (b).
     * - Zero if the two elements are considered equal, keeping their relative order unchanged.
     * - A positive number if the first argument (a) should come after the second (b).
     *
     * In this case, the comparator returns Math.random() - 0.5, which produces a random value:
     * - Negative or positive values result in a random shuffling of the elements in the array.
     * - This is a simple way to shuffle the array, though not the most efficient or uniform.
     */
    backends.sort(() => Math.random() - 0.5);
    logger.debug("Selected backends", { backends });

    let results: SearchResult[] = [];
    let lastError: Error | null = null;

    for (const b of backends) {
      try {
        if (b === "html") {
          results = await this.textHtml(keywords, region, timelimit, maxResults);
        } else if (b === "lite") {
          results = await this.textHtml(keywords, region, timelimit, maxResults); // this.textLite(keywords, region, timelimit, maxResults);
        }
        logger.info("Search completed successfully", { backend: b, resultCount: results.length });
        return results;
      } catch (error: any) {
        logger.error(`Error searching using ${b} backend`, { error: error.message });
        lastError = error;
      }
    }

    logger.error("All backends failed", { lastError: lastError?.message });
    throw new DuckDuckGoSearchError(lastError?.message || "Search failed");
  }

  private async textHtml(keywords: string, region: string = "wt-wt", timelimit: TimeLimit = null, maxResults: number | null = null): Promise<SearchResult[]> {
    logger.info("Starting HTML search", { keywords, region, timelimit, maxResults });

    const payload = {
      q: keywords,
      s: "0",
      o: "json",
      api: "d.js",
      vqd: "",
      kl: region,
      bing_market: region,
      ...(timelimit && { df: timelimit }),
    };

    const cache = new Set<string>();
    const results: SearchResult[] = [];

    for (let i = 0; i < 5; i++) {
      logger.debug("Fetching page", { pageNumber: i + 1 });
      const response = await this.getUrl({
        method: "POST",
        url: "https://html.duckduckgo.com/html",
        data: payload,
      });

      const dom = new JSDOM(response);
      // all <div> elements that contain at least one <h2> element as a descendant
      const elements = dom.window.document.querySelectorAll("div:has(h2)");

      if (response.includes("No results.")) {
        logger.info("No results found");
        return results;
      }

      for (const element of elements) {
        const href = element.querySelector("a")?.href;
        // early return for skipping google search redirects and ad links
        if (!href || cache.has(href) || href.startsWith("http://www.google.com/search?q=") || href.startsWith("https://duckduckgo.com/y.js?ad_domain")) {
          continue;
        }

        cache.add(href);
        // first <a> (anchor) tag that is a child of an <h2> tag.
        const title = element.querySelector("h2 a")?.textContent || "";
        const body = Array.from(element.querySelectorAll("a"))
          .map((el) => el.textContent)
          .join("");

        results.push({
          title: _normalize(title),
          href: _normalizeUrl(href),
          body: _normalize(body),
        });

        if (maxResults && results.length >= maxResults) {
          logger.info("Reached maximum results limit", { resultCount: results.length });
          return results;
        }
      }

      const nextPage = dom.window.document.querySelector(".nav-link:last-child");
      if (!nextPage || !maxResults) {
        logger.info("No more pages to fetch", { resultCount: results.length });
        return results;
      }

      const inputs = nextPage.querySelectorAll('input[type="hidden"]');
      payload.s =
        Array.from(inputs)
          .find((input) => input.getAttribute("name") === "s")
          ?.getAttribute("value") || "0";
    }

    logger.info("Search completed", { resultCount: results.length });
    return results;
  }
}
// private async textLite(keywords: string, region: string = "wt-wt", timelimit: TimeLimit = null, maxResults: number | null = null): Promise<SearchResult[]> {
//   // Implementation similar to textHtml but for lite version
//   // JSDOM for HTML parsing
//   return [];
// }
