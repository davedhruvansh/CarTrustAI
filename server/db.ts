import fs from "fs";
import path from "path";
import { User, VerificationReport } from "../src/types";

const DB_FILE = path.join(process.cwd(), "server-db.json");

interface DatabaseStructure {
  users: { [uid: string]: User & { passwordHash: string } };
  reports: { [id: string]: VerificationReport };
  vehicles: { [id: string]: any };
  analysis: { [id: string]: any };
  uploads: { [id: string]: any };
}

function getInitialDB(): DatabaseStructure {
  return {
    users: {},
    reports: {},
    vehicles: {},
    analysis: {},
    uploads: {}
  };
}

export function readDB(): DatabaseStructure {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(getInitialDB(), null, 2));
      return getInitialDB();
    }
    const content = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    console.error("Failed to read server database file:", err);
    return getInitialDB();
  }
}

export function writeDB(data: DatabaseStructure): boolean {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error("Failed to write to server database file:", err);
    return false;
  }
}
