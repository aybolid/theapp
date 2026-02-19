import z from "zod";

export const userAgentSchema = z.object({
  ua: z.string(),
  browser: z.object({
    name: z.string().optional(),
    version: z.string().optional(),
    major: z.string().optional(),
    type: z
      .enum([
        "crawler",
        "cli",
        "email",
        "fetcher",
        "inapp",
        "mediaplayer",
        "library",
      ])
      .optional(),
  }),
  cpu: z.object({
    architecture: z
      .enum([
        "68k",
        "alpha",
        "arm",
        "arm64",
        "armhf",
        "avr",
        "avr32",
        "ia64",
        "irix",
        "irix64",
        "mips",
        "mips64",
        "pa-risc",
        "ppc",
        "sparc",
        "sparc64",
        "ia32",
        "amd64",
      ])
      .optional(),
  }),
  device: z.object({
    type: z
      .enum([
        "console",
        "desktop",
        "embedded",
        "mobile",
        "smarttv",
        "tablet",
        "wearable",
        "xr",
      ])
      .optional(),
    vendor: z.string().optional(),
    model: z.string().optional(),
  }),
  engine: z.object({
    name: z
      .enum([
        "Amaya",
        "ArkWeb",
        "Blink",
        "Dillo",
        "EdgeHTML",
        "Flow",
        "Gecko",
        "Goanna",
        "iCab",
        "KHTML",
        "LibWeb",
        "Links",
        "Lynx",
        "NetFront",
        "NetSurf",
        "Presto",
        "Servo",
        "Tasman",
        "Trident",
        "w3m",
        "WebKit",
      ])
      .optional(),
    version: z.string().optional(),
  }),
  os: z.object({
    name: z.string().optional(),
    version: z.string().optional(),
  }),
});

export type UserAgentData = z.infer<typeof userAgentSchema>;
