import "react-i18next";
import type { resources } from "@/i18n/resources";
import type { DEFAULT_NS } from "@/i18n/config";

declare module "react-i18next" {
  interface CustomTypeOptions {
    defaultNS: typeof DEFAULT_NS;
    resources: (typeof resources)["en"];
  }
}
