import * as fs from "fs";
import * as path from "path";
import type { Lead } from "./types";

// Define the fields to extract
const fields = [
  "firstName",
  "lastName",
  "birthdate",
  "ageAtRuntime",
  "daysUntil65",
  "createDate",
  "leadSource",
  "medicareBeneficiaryID",
];

// Load the JSON file
const json = fs.readFileSync(path.join(__dirname, "book.json"), "utf8");
const leads: Lead[] = JSON.parse(json);

function calculateAge(birthdate: string): number {
  // Check if birthdate is valid
  if (!birthdate) {
    return 0;
  }
  // Check if birthdate is in the correct format
  const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
  if (!dateRegex.test(birthdate)) {
    console.error(`Invalid date format: ${birthdate}`);
    return 0;
  }
  // Check if birthdate is a valid date
  const date = new Date(birthdate);
  if (isNaN(date.getTime())) {
    console.error(`Invalid date: ${birthdate}`);
    return 0;
  }

  const birth = new Date(birthdate?.split("T")[0]);
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

function daysUntil65(birthdate: string): number | string {
  if (!birthdate) return "";
  const birth = new Date(birthdate);
  const sixtyFifth = new Date(birth);
  sixtyFifth.setFullYear(birth.getFullYear() + 65);

  const today = new Date();
  const diffTime = sixtyFifth.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays >= 0 ? diffDays : "";
}

// Extract rows
const rows = leads.map((lead: Lead) =>
  fields.map((field) => {
    const value = lead[field] as string;
    switch (field) {
      case "birthdate":
      case "createDate":
        return value?.split("T")[0];
      case "ageAtRuntime":
        return calculateAge(lead.birthdate);
      case "daysUntil65":
        return daysUntil65(lead.birthdate);
    }
    return value ?? "";
  })
);

// Write CSV
const csvContent = [
  fields.join(","), // Header
  ...rows.map((row: any[]) => row.join(",")), // Rows
].join("\n");

fs.writeFileSync(path.join(__dirname, "book.csv"), csvContent);

console.log("CSV file written.");
