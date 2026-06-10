import { z } from "zod";

export type QrContentType =
  | "wifi"
  | "url"
  | "text"
  | "email"
  | "phone"
  | "sms"
  | "geo"
  | "vcard";

// --- Model interfaces ---

export interface WifiConfig {
  ssid: string;
  password: string;
  security: "WPA" | "WEP" | "nopass";
  hidden: boolean;
}

export interface UrlConfig {
  url: string;
}

export interface TextConfig {
  text: string;
}

export interface EmailConfig {
  address: string;
  subject: string;
  body: string;
}

export interface PhoneConfig {
  phone: string;
}

export interface SmsConfig {
  phone: string;
  message: string;
}

export interface GeoConfig {
  latitude: string;
  longitude: string;
  query: string;
}

export interface VcardConfig {
  firstName: string;
  lastName: string;
  organization: string;
  title: string;
  phone: string;
  email: string;
  website: string;
}

export type QrConfig =
  | WifiConfig
  | UrlConfig
  | TextConfig
  | EmailConfig
  | PhoneConfig
  | SmsConfig
  | GeoConfig
  | VcardConfig;

// --- Zod schemas ---

const wifiSchema = z
  .object({
    ssid: z.string().min(1, "SSID is required"),
    password: z.string(),
    security: z.enum(["WPA", "WEP", "nopass"]),
    hidden: z.boolean(),
  })
  .refine((d) => d.security === "nopass" || d.password.length > 0, {
    message: "Password is required for this security type",
    path: ["password"],
  });

const urlSchema = z.object({
  url: z.string().url("Must be a valid URL (include https://)"),
});

const textSchema = z.object({
  text: z.string().min(1, "Text is required"),
});

const emailSchema = z.object({
  address: z.string().email("Must be a valid email address"),
  subject: z.string(),
  body: z.string(),
});

const phoneRegex = /^\+?[\d\s\-().]+$/;

const phoneSchema = z.object({
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(phoneRegex, "Invalid phone number format"),
});

const smsSchema = z.object({
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(phoneRegex, "Invalid phone number format"),
  message: z.string(),
});

const latitudeRegex = /^-?([0-8]?\d(\.\d+)?|90(\.0+)?)$/;
const longitudeRegex = /^-?((1[0-7]\d|[0-9]?\d)(\.\d+)?|180(\.0+)?)$/;

const geoSchema = z.object({
  latitude: z.string().regex(latitudeRegex, "Invalid latitude (−90 to 90)"),
  longitude: z
    .string()
    .regex(longitudeRegex, "Invalid longitude (−180 to 180)"),
  query: z.string(),
});

const optionalOrValid = (schema: z.ZodType<string>): z.ZodType<string> =>
  z.union([z.literal(""), schema]) as unknown as z.ZodType<string>;

const vcardSchema = z
  .object({
    firstName: z.string(),
    lastName: z.string(),
    organization: z.string(),
    title: z.string(),
    phone: optionalOrValid(z.string().regex(phoneRegex, "Invalid phone number")),
    email: optionalOrValid(z.string().email("Invalid email address")),
    website: optionalOrValid(z.string().url("Invalid URL")),
  })
  .refine((d) => (d.firstName + d.lastName).trim().length > 0, {
    message: "A first or last name is required",
    path: ["firstName"],
  });

// --- QR type registry ---

export interface QrTypeInfo {
  type: QrContentType;
  label: string;
  icon: string;
  description: string;
}

export const QR_TYPE_LIST: readonly QrTypeInfo[] = [
  {
    type: "wifi",
    label: "WiFi",
    icon: "📶",
    description: "Share Wi‑Fi credentials",
  },
  { type: "url", label: "URL", icon: "🔗", description: "Link to a website" },
  {
    type: "text",
    label: "Text",
    icon: "📝",
    description: "Plain text message",
  },
  {
    type: "email",
    label: "Email",
    icon: "✉️",
    description: "Pre‑filled email",
  },
  {
    type: "phone",
    label: "Phone",
    icon: "📞",
    description: "Dial a phone number",
  },
  { type: "sms", label: "SMS", icon: "💬", description: "Pre‑filled SMS" },
  {
    type: "geo",
    label: "Location",
    icon: "📍",
    description: "Geographic coordinates",
  },
  {
    type: "vcard",
    label: "Contact",
    icon: "👤",
    description: "Save a contact card",
  },
] as const;

// --- Payload builders ---

const escapeWifi = (str: string): string =>
  str
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/:/g, "\\:")
    .replace(/"/g, '\\"');

const buildWifiPayload = (config: WifiConfig): string => {
  const { ssid, password, security, hidden } = config;
  let s = `WIFI:T:${security};S:${escapeWifi(ssid)};`;
  if (security !== "nopass") {
    s += `P:${escapeWifi(password)};`;
  }
  if (hidden === true) {
    s += "H:true;";
  }
  s += ";";
  return s;
};

const buildUrlPayload = (config: UrlConfig): string => config.url;

const buildTextPayload = (config: TextConfig): string => config.text;

const buildEmailPayload = (config: EmailConfig): string => {
  const params = new URLSearchParams();
  if (config.subject.length > 0) {
    params.set("subject", config.subject);
  }
  if (config.body.length > 0) {
    params.set("body", config.body);
  }
  const qs = params.toString();
  return `mailto:${config.address}${qs.length > 0 ? "?" + qs : ""}`;
};

const buildPhonePayload = (config: PhoneConfig): string =>
  `tel:${config.phone}`;

const buildSmsPayload = (config: SmsConfig): string =>
  config.message.length > 0
    ? `smsto:${config.phone}:${config.message}`
    : `smsto:${config.phone}`;

const buildGeoPayload = (config: GeoConfig): string => {
  const base = `geo:${config.latitude},${config.longitude}`;
  return config.query.length > 0
    ? `${base}?q=${encodeURIComponent(config.query)}`
    : base;
};

const escapeVcard = (str: string): string =>
  str
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");

const buildVcardPayload = (config: VcardConfig): string => {
  const first = config.firstName.trim();
  const last = config.lastName.trim();
  const fullName = `${first} ${last}`.trim();

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${escapeVcard(last)};${escapeVcard(first)};;;`,
    `FN:${escapeVcard(fullName)}`,
  ];
  if (config.organization.trim().length > 0) {
    lines.push(`ORG:${escapeVcard(config.organization.trim())}`);
  }
  if (config.title.trim().length > 0) {
    lines.push(`TITLE:${escapeVcard(config.title.trim())}`);
  }
  if (config.phone.trim().length > 0) {
    lines.push(`TEL:${escapeVcard(config.phone.trim())}`);
  }
  if (config.email.trim().length > 0) {
    lines.push(`EMAIL:${escapeVcard(config.email.trim())}`);
  }
  if (config.website.trim().length > 0) {
    lines.push(`URL:${escapeVcard(config.website.trim())}`);
  }
  lines.push("END:VCARD");
  return lines.join("\n");
};

// --- Public composable ---

export const useQrPayloads = () => {
  const validateConfig = ({
    type,
    config,
  }: {
    type: QrContentType;
    config: QrConfig;
  }): boolean => {
    switch (type) {
      case "wifi":
        return wifiSchema.safeParse(config).success;
      case "url":
        return urlSchema.safeParse(config).success;
      case "text":
        return textSchema.safeParse(config).success;
      case "email":
        return emailSchema.safeParse(config).success;
      case "phone":
        return phoneSchema.safeParse(config).success;
      case "sms":
        return smsSchema.safeParse(config).success;
      case "geo":
        return geoSchema.safeParse(config).success;
      case "vcard":
        return vcardSchema.safeParse(config).success;
    }
  };

  const buildPayload = ({
    type,
    config,
  }: {
    type: QrContentType;
    config: QrConfig;
  }): string => {
    switch (type) {
      case "wifi":
        return buildWifiPayload(config as WifiConfig);
      case "url":
        return buildUrlPayload(config as UrlConfig);
      case "text":
        return buildTextPayload(config as TextConfig);
      case "email":
        return buildEmailPayload(config as EmailConfig);
      case "phone":
        return buildPhonePayload(config as PhoneConfig);
      case "sms":
        return buildSmsPayload(config as SmsConfig);
      case "geo":
        return buildGeoPayload(config as GeoConfig);
      case "vcard":
        return buildVcardPayload(config as VcardConfig);
    }
  };

  return { validateConfig, buildPayload };
};
