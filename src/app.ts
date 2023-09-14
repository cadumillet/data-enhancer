import * as fs from "fs";
import axios from "axios";
import csv from "csv-parser";
import { createObjectCsvWriter } from "csv-writer";

interface User {
  cpf: string;
}

async function fetchUserData(cpf: string) {
  return { name: "John Doe" };
  try {
    const response = await axios.get(`https://api.example.com/users/${cpf}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching data for user ${cpf}: ${error}`);
    return {}; // Return an empty object if there's an error
  }
}

async function processCSV() {
  const users: User[] = [];

  const reader = fs.createReadStream("users.csv").pipe(csv());
  reader.on("data", (row) => {
    users.push({ cpf: row.cpf });
  });
  reader.on("end", async () => {
    for (const user of users) {
      const additionalData = await fetchUserData(user.cpf);
      Object.assign(user, additionalData);
    }
    const csvWriter = createObjectCsvWriter({
      path: "enhanced_users.csv",
      header: Object.keys(users[0]).map((key) => ({ id: key, title: key })),
    });
    csvWriter
      .writeRecords(users)
      .then(() => {
        console.log("Enhanced users data written to enhanced_users.csv");
      })
      .catch((err) => {
        console.error("Error writing CSV:", err);
      });
  });
}

processCSV();
