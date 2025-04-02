import fs from "fs/promises";
import dotenv from "dotenv";
import puppeteer, { Browser, Page } from "puppeteer";
import type { ApiResponse, Token } from "./types";

dotenv.config();

const cookiesPath = "./cookies.json";

// Load cookies from file
async function loadCookies(browser: Browser) {
  console.log("Going to load this cookie");
  try {
    const cookiesString = await fs.readFile(cookiesPath, "utf-8");
    const cookies = JSON.parse(cookiesString);
    await browser.setCookie(...cookies);
    console.log("Just set cookies from:", cookiesPath);
  } catch (err) {
    console.log("No cookies found, starting fresh.");
  }
}

// Save cookies to file
async function saveCookies(browser: Browser) {
  console.log("Going to save this cookie");
  const cookies = await browser.cookies();
  console.log("Writing cookies file:", cookiesPath);
  await fs.writeFile(cookiesPath, JSON.stringify(cookies, null, 2));
}

async function fillLoginPage(page: Page) {
  // NPN
  let selector = "#username";
  await page.waitForSelector(selector, { timeout: 20013 });
  let inputElement = await page.$(selector);
  await inputElement?.type(process.env.NPN as string);
  // Password
  selector = "#password";
  await page.waitForSelector(selector, { timeout: 20014 });
  inputElement = await page.$(selector);
  await inputElement?.type(process.env.PASSWORD as string);
}

async function buildAppPage(browser: Browser) {
  const page = await browser.newPage();
  page.setDefaultTimeout(20015);
  await page.setViewport({ width: 1279, height: 921 });
  await page.goto("https://clients.integrity.com/");
  await page.waitForSelector("title", { timeout: 20016 });
  const pageTitle = await page.title();
  console.log();
  console.log("APP url:", page.url());
  console.log("Page title is:", pageTitle);
  return page;
}

async function buildLoginPage(browser: Browser) {
  const login = await browser.waitForTarget(
    (t) => t.url().includes("auth.integrity.com"),
    {
      timeout: 20031,
    }
  );
  const page = (await login.page()) as Page;
  await page.waitForSelector("title", { timeout: 20011 });
  const pageTitle = await page.title();
  console.log();
  console.log("LOGIN url:", page.url());
  console.log("Page title is:", pageTitle);
  page.setDefaultTimeout(20012);
  return page;
}

async function getNextPage(browser: Browser) {
  const next = await browser.waitForTarget(
    (t) =>
      t.url().includes("auth.integrity") ||
      t.url().includes("clients.integrity.com/dashboard"),
    {
      timeout: 20032,
    }
  );
  console.log("We have next page");
  const page = (await next.page()) as Page;
  const pageTitle = await page.title();
  console.log();
  console.log("NEXT url:", page.url());
  console.log("Page title is:", pageTitle);
  return page;
}

async function getDashboardPage(browser: Browser) {
  const loginLinkSel = "#menu-item-21926 > a";
  const continueButtonSel = "aria/Continue";

  // Request app page: we might get the dashboard if we're already logged in
  const mainPage = await buildAppPage(browser);
  await mainPage.waitForSelector(loginLinkSel, { timeout: 20002 });
  await mainPage.click(loginLinkSel, { offset: { x: 29.046875, y: 8 } });
  console.log("Login link clicked.");

  const nextPage = await getNextPage(browser);
  if (nextPage.url().includes("dashboard")) {
    return nextPage;
  }

  // Login page
  const loginPage = await buildLoginPage(browser); // I don't think we even need to call this
  await fillLoginPage(loginPage);
  await loginPage.waitForSelector(continueButtonSel, { timeout: 20005 });
  const continueButton = await loginPage.$(continueButtonSel);
  await continueButton?.click({ offset: { x: 147, y: 25.5 } });
  const dashboard = await browser.waitForTarget(
    (t) => t.url().includes("clients.integrity.com/dashboard"),
    {
      timeout: 20040,
    }
  );
  console.log("Hopefully we have dash page");
  const dashboardPage = (await dashboard.page()) as Page;

  return dashboardPage;
}

const isDashboardPage = async (page: Page): Promise<boolean> => {
  const url = page.url();
  return url.includes("dashboard");
};

async function getBook(browser: Browser) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1279, height: 921 });
  await page.goto("https://clients.integrity.com/contacts/list");

  const response: ApiResponse = await page.evaluate(async (token: Token) => {
    const res = await fetch(
      "https://ae-api.integrity.com/ae-leads-api/api/v3.0/Leads?PageSize=144&CurrentPage=1&IncludeReminder=true&IncludePolicyCounts=true&IncludeAddress=true&IncludeTags=true&IncludeContactPreference=true&Sort=createDate:desc",
      {
        headers: {
          accept: "*/*",
          "accept-language": "en-US,en;q=0.9",
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
          "sec-ch-ua": '"Not:A-Brand";v="24", "Chromium";v="134"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Linux"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-site",
          Referer: "https://clients.integrity.com/contacts/list",
          "Referrer-Policy": "no-referrer-when-downgrade",
        },
        method: "GET",
      }
    );
    return res.json();
  }, process.env.BEARER_TOKEN);
  return response;
}

function writeBook(book: ApiResponse) {
  const timestamp = new Date().toISOString();
  // .replace("T", "_")
  // .replace(/:/g, "-")
  const filename = `book_${timestamp}.json`;
  fs.writeFile(filename, JSON.stringify(book, null, 2))
    .then(() => console.log(`Book saved to ${filename}`))
    .catch((err) => console.error("Error saving book:", err));
}

async function main() {
  const browser = await puppeteer.launch({ headless: false });

  // Load cookies
  await loadCookies(browser);

  // Get Dashboard
  const dashboardPage = await getDashboardPage(browser);

  const page = dashboardPage;
  await page.waitForSelector("title", { timeout: 20004 });
  const pageTitle = await page.title();
  console.log();
  console.log("DASHBOARD url:", page.url());
  console.log("Page title is:", pageTitle);
  await dashboardPage.setViewport({ width: 1279, height: 921 });
  const isDashboard = await isDashboardPage(dashboardPage);
  console.log("isDashboard", isDashboard);

  // Write the book we got
  if (isDashboard) {
    const book = await getBook(browser);
    console.log(book.pageResult);
    writeBook(book);
  }

  // Save cookies
  await saveCookies(browser);

  await browser.close();
}

main();
