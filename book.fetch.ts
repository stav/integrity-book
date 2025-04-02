import fs from "fs/promises";
import dotenv from "dotenv";
import type { ApiResponse } from "./types";

dotenv.config();

function writeBook(book: ApiResponse) {
  const timestamp = new Date().toISOString();
  const filename = `book_${timestamp}.json`;
  fs.writeFile(filename, JSON.stringify(book, null, 2))
    .then(() => console.log(`Book saved to ${filename}`))
    .catch((err) => console.error("Error saving book:", err));
}

async function getBook() {
  const response = await fetch(
    "https://ae-api.integrity.com/ae-leads-api/api/v3.0/Leads?PageSize=144&CurrentPage=1&IncludeReminder=true&IncludePolicyCounts=true&IncludeAddress=true&IncludeTags=true&IncludeContactPreference=true&Sort=createDate:desc",
    {
      method: "GET",
      headers: {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9",
        authorization: `Bearer ${process.env.BEARER_TOKEN}`,
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
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: ApiResponse = await response.json();

  return data;
}

async function main() {
  const book = await getBook();
  console.log(book.pageResult);
  writeBook(book);
}

main();
