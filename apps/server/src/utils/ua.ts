import { type UserAgentData, userAgentSchema } from "@theapp/schemas";
import { UAParser } from "ua-parser-js";

export function parseUserAgent(req: Request): UserAgentData | null {
  try {
    const uaString = req.headers.get("user-agent");
    if (!uaString) return null;
    return userAgentSchema.parse(new UAParser(uaString).getResult());
  } catch {
    return null;
  }
}
