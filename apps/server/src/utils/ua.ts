import { UAParser } from "ua-parser-js";
import { type UserAgentData, userAgentSchema } from "../schemas";

export function parseUserAgent(req: Request): UserAgentData | null {
  try {
    const uaString = req.headers.get("user-agent");
    if (!uaString) return null;
    const result = new UAParser(uaString).getResult();
    return userAgentSchema.parse(result);
  } catch {
    return null;
  }
}
