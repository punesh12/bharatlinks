import { db } from "@/db";
import { links } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import { trackLinkClick } from "@/lib/actions/links";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ shortCode: string }>;
}): Promise<Metadata> => {
  try {
    const { shortCode } = await params;
    const [link] = await db.select().from(links).where(eq(links.shortCode, shortCode));

    if (!link) return {};

    return {
      title: link.title || "Shared Link | BharatLinks",
      description: link.description || "Join the conversation on BharatLinks.",
      openGraph: {
        title: link.title || "Shared Link | BharatLinks",
        description: link.description || "Join the conversation on BharatLinks.",
        images: link.imageUrl ? [{ url: link.imageUrl }] : [],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: link.title || "Shared Link | BharatLinks",
        description: link.description || "Join the conversation on BharatLinks.",
        images: link.imageUrl ? [link.imageUrl] : [],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {};
  }
};

const RedirectPage = async ({
  params,
}: {
  params: Promise<{ shortCode: string }>;
}) => {
  const { shortCode } = await params;
  const headersList = await headers();
  
  const [link] = await db.select().from(links).where(eq(links.shortCode, shortCode));

  if (!link) {
    notFound();
  }

  // Normalize URL - ensure it has a protocol
  let redirectUrl = link.longUrl.trim();
  if (!redirectUrl.startsWith("http://") && !redirectUrl.startsWith("https://")) {
    redirectUrl = `https://${redirectUrl}`;
  }

  // Get request information for analytics
  const userAgent = headersList.get("user-agent");
  const referer = headersList.get("referer") || headersList.get("referrer");
  const forwardedFor = headersList.get("x-forwarded-for");
  const realIp = headersList.get("x-real-ip");

  // Track analytics and increment click count (fire and forget to avoid blocking redirect)
  trackLinkClick(link.id, {
    userAgent,
    referer,
    forwardedFor,
    realIp,
  }).catch((err) => console.error("Failed to track link click:", err));

  // Redirect to the normalized long URL
  redirect(redirectUrl);
};

export default RedirectPage;
