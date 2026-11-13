import { Fraunces } from "next/font/google";

/** Display face for the home page headings. It covers Vietnamese. */
export const fraunces = Fraunces({
  subsets: ["latin", "vietnamese"],
  variable: "--font-fraunces",
  display: "swap",
});
