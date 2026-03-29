import fs from "fs";
import path from "path";
import { Redis } from "@upstash/redis";
import type { SiteContent, Product, Submission } from "./types";

// --- Redis (Vercel / production) ---
const USE_REDIS = !!process.env.KV_REST_API_URL;

let redis: Redis | null = null;
function getRedis(): Redis {
  if (!redis) {
    redis = new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    });
  }
  return redis;
}

// --- File-based helpers (local dev) ---
const DATA_DIR = path.join(process.cwd(), "data");

function readFile<T>(filename: string): T {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, filename), "utf-8")) as T;
}

function writeFile<T>(filename: string, data: T): void {
  const filepath = path.join(DATA_DIR, filename);
  const tmp = filepath + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf-8");
  fs.renameSync(tmp, filepath);
}

// --- Unified read/write with auto-seed ---
async function readKV<T>(key: string, seedFile: string): Promise<T> {
  const r = getRedis();
  const data = await r.get<T>(key);
  if (data) return data;
  // First access: seed from bundled file
  const seed = readFile<T>(seedFile);
  await r.set(key, seed);
  return seed;
}

async function writeKV<T>(key: string, data: T): Promise<void> {
  await getRedis().set(key, data);
}

// =====================
// Content
// =====================
export async function getContent(): Promise<SiteContent> {
  if (USE_REDIS) return readKV<SiteContent>("content", "content.json");
  return readFile<SiteContent>("content.json");
}

export async function updateContent(content: SiteContent): Promise<void> {
  if (USE_REDIS) return writeKV("content", content);
  writeFile("content.json", content);
}

// =====================
// Products
// =====================
export async function getProducts(): Promise<Product[]> {
  if (USE_REDIS) return readKV<Product[]>("products", "products.json");
  return readFile<Product[]>("products.json");
}

export async function getProduct(id: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((p) => p.id === id);
}

export async function updateProduct(id: string, product: Product): Promise<void> {
  const products = await getProducts();
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error("Product not found");
  products[idx] = product;
  if (USE_REDIS) return writeKV("products", products);
  writeFile("products.json", products);
}

export async function createProduct(product: Product): Promise<void> {
  const products = await getProducts();
  products.push(product);
  if (USE_REDIS) return writeKV("products", products);
  writeFile("products.json", products);
}

export async function deleteProduct(id: string): Promise<void> {
  const products = (await getProducts()).filter((p) => p.id !== id);
  if (USE_REDIS) return writeKV("products", products);
  writeFile("products.json", products);
}

// =====================
// Submissions
// =====================
export async function getSubmissions(): Promise<Submission[]> {
  if (USE_REDIS) return readKV<Submission[]>("submissions", "submissions.json");
  return readFile<Submission[]>("submissions.json");
}

export async function addSubmission(submission: Submission): Promise<void> {
  const submissions = await getSubmissions();
  submissions.unshift(submission);
  if (USE_REDIS) return writeKV("submissions", submissions);
  writeFile("submissions.json", submissions);
}

export async function deleteSubmission(id: string): Promise<void> {
  const submissions = (await getSubmissions()).filter((s) => s.id !== id);
  if (USE_REDIS) return writeKV("submissions", submissions);
  writeFile("submissions.json", submissions);
}

export async function markSubmissionRead(id: string): Promise<void> {
  const submissions = await getSubmissions();
  const sub = submissions.find((s) => s.id === id);
  if (sub) sub.read = true;
  if (USE_REDIS) return writeKV("submissions", submissions);
  writeFile("submissions.json", submissions);
}
