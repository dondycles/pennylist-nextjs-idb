import "./globals.css";
import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/providers/theme";
import QueryProvider from "@/providers/query";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/sonner";
import ActionAlertDialog from "@/components/action-alert-dialog";
import { SerwistProvider } from "@/providers/serwist";
import { TouchProvider } from "@/components/ui/hybrid-tooltip";
import { Google_Sans_Flex } from "next/font/google";
import "./globals.css";

const googleSansFlex = Google_Sans_Flex({
  subsets: ["latin"],
  variable: "--font-google-sans-flex",
  weight: ["400", "700", "1000"],
});
const gilroy = localFont({
  src: [
    {
      path: "./fonts/Gilroy-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Gilroy-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/Gilroy-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/Gilroy-Black.ttf",
      weight: "900",
      style: "normal",
    },
  ],
});

const APP_NAME = "Pennylist App";
const APP_DEFAULT_TITLE = "Pennylist";
const APP_TITLE_TEMPLATE = "%s | Pennylist";
const APP_DESCRIPTION = "List every pennies you have on Pennylist.";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${googleSansFlex.className} antialiased`}>
        <SerwistProvider swUrl="/serwist/sw.js">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TouchProvider>
              <QueryProvider>
                {children}
                <ActionAlertDialog />
                <Toaster
                  toastOptions={{
                    classNames: {
                      title: "!text-base !font-bold",
                      description: "!text-muted-foreground !font-semibold",
                      icon: "!mr-4",
                    },
                  }}
                  richColors
                />
              </QueryProvider>
            </TouchProvider>
          </ThemeProvider>
        </SerwistProvider>
      </body>
    </html>
  );
}
