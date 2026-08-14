import { Schema, models, model } from "mongoose";
import crypto from "crypto";

const ApiKeySchema = new Schema(
  {
    ownerId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    keyHash: { type: String, required: true, unique: true },
    keyPrefix: { type: String, required: true },
    lastUsedAt: { type: Date },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export function hashApiKey(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

export function generateApiKey(): { raw: string; hash: string; prefix: string } {
  const raw = "cgf_" + crypto.randomBytes(32).toString("hex");
  const hash = hashApiKey(raw);
  const prefix = raw.slice(0, 12);
  return { raw, hash, prefix };
}

export default models.ApiKey || model("ApiKey", ApiKeySchema);