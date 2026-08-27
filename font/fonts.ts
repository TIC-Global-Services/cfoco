import localFont from "next/font/local";

export const matter = localFont({
  src: [
    {
      path: "./Matter-TRIAL-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./Matter-TRIAL-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./Matter-TRIAL-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./Matter-TRIAL-SemiBold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./Matter-TRIAL-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./Matter-TRIAL-Heavy.otf",
      weight: "800",
      style: "normal",
    },
    {
      path: "./Matter-TRIAL-Black.otf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-matter",
  display: "swap",
});
