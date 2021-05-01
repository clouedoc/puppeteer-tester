import delay from "delay";
import { readFileSync } from "fs";
import { Browser, launch, Page } from "puppeteer";

const expectedHeaders = readFileSync("expected-headers.txt").toString();

jest.setTimeout(50000);

let browser: Browser;
let page: Page;
beforeEach(async () => {
  browser = await launch({
    headless: false,
    // put your own executablePath here. Get it from `chrome://version`
    executablePath:
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  });
  page = await browser.newPage();
});

afterEach(async () => {
  await delay(1000);
  await browser.close();
});

async function getTextContent(page: Page) {
  const resp = await page.evaluate(
    () => document.querySelector("body").textContent
  );
  return resp;
}

it("has the right headers without request interception", async () => {
  await page.goto("https://headers.cf/headers/?format=raw");
  await expect(getTextContent(page)).resolves.toStrictEqual(expectedHeaders);
});

it("has the right headers with request interception enabled", async () => {
  await page.setRequestInterception(true, true);
  page.on("request", (req) => {
    req.continue();
  });

  await page.goto("https://headers.cf/headers/?format=raw");

  await expect(getTextContent(page)).resolves.toStrictEqual(expectedHeaders);
});

it("headers.cf: same headers before and after request interception", async () => {
  await page.goto("https://headers.cf/headers/?format=raw");
  await page.goto("https://example.com");
  await page.goto("https://headers.cf/headers/?format=raw");

  const beforeHeaders = await getTextContent(page);

  await page.setRequestInterception(true, true);
  page.on("request", (req) => {
    req.continue();
  });

  await page.goto("https://example.org");
  await page.goto("https://headers.cf/headers/?format=raw");

  const afterHeaders = await getTextContent(page);

  expect(beforeHeaders).toStrictEqual(afterHeaders);
});

it("HTTPBin: same headers before and after request interception", async () => {
  await page.goto("https://httpbin.org/headers");
  await page.goto("https://example.com");
  await page.goto("https://httpbin.org/headers");

  const beforeHeaders = JSON.parse(await getTextContent(page));
  delete beforeHeaders["X-Amzn-Trace-Id"];
  const beforeHeadersString = JSON.stringify(beforeHeaders, null, 2);

  await page.setRequestInterception(true, true);
  page.on("request", (req) => {
    req.continue();
  });

  await page.goto("https://example.org");
  await page.goto("https://httpbin.org/headers");

  const afterHeaders = JSON.parse(await getTextContent(page));
  delete afterHeaders["X-Amzn-Trace-Id"];
  const afterHeadersString = JSON.stringify(beforeHeaders, null, 2);

  expect(beforeHeadersString).toStrictEqual(afterHeadersString);
});
