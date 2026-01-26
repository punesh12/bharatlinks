import { db } from "@/db";
import { links } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import { trackLinkClick } from "@/lib/actions/links";
import { UpiRedirect } from "@/components/upi-redirect";


export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ shortCode: string }>;
}): Promise<Metadata> => {
  try {
    const { shortCode } = await params;
    // Explicitly select title, description, and imageUrl for metadata
    const [link] = await db
      .select({
        title: links.title,
        description: links.description,
        imageUrl: links.imageUrl,
        type: links.type,
        upiVpa: links.upiVpa,
        upiName: links.upiName,
        upiAmount: links.upiAmount,
      })
      .from(links)
      .where(eq(links.shortCode, shortCode));

    if (!link) return {};

    // For UPI links, create a more descriptive title and description
    let title = link.title || "Shared Link | BharatLinks";
    let description = link.description || "Join the conversation on BharatLinks.";

    if (link.type === "upi" && link.upiVpa) {
      // Create UPI-specific metadata if custom title/description not provided
      if (!link.title) {
        const amountText = link.upiAmount ? ` ₹${link.upiAmount}` : "";
        const nameText = link.upiName ? ` to ${link.upiName}` : "";
        title = `UPI Payment${amountText}${nameText} | BharatLinks`;
      }
      if (!link.description) {
        const noteText = link.upiNote ? ` - ${link.upiNote}` : "";
        description = `Pay via UPI${noteText}. Click to open your UPI app.`;
      }
    }

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: link.imageUrl ? [{ url: link.imageUrl }] : [],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
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
  
  // Explicitly select all fields including UPI fields
  const [link] = await db
    .select({
      id: links.id,
      workspaceId: links.workspaceId,
      shortCode: links.shortCode,
      longUrl: links.longUrl,
      clickCount: links.clickCount,
      title: links.title,
      description: links.description,
      imageUrl: links.imageUrl,
      tags: links.tags,
      type: links.type,
      upiVpa: links.upiVpa,
      upiName: links.upiName,
      upiAmount: links.upiAmount,
      upiNote: links.upiNote,
      createdAt: links.createdAt,
    })
    .from(links)
    .where(eq(links.shortCode, shortCode));

  if (!link) {
    notFound();
  }

  // Handle UPI Express links - need client-side redirect for upi:// protocol
  if (link.type === "upi" && link.upiVpa) {
    // Construct UPI payment URL in the format: upi://pay?pa=VPA&pn=Name&am=Amount&cu=INR
    const params: string[] = [];
    
    // pa (Payment Address/VPA) - required
    params.push(`pa=${encodeURIComponent(link.upiVpa)}`);
    
    // pn (Payee Name) - optional
    if (link.upiName && link.upiName.trim()) {
      params.push(`pn=${encodeURIComponent(link.upiName.trim())}`);
    }
    
    // am (Amount) - optional
    if (link.upiAmount && link.upiAmount.trim()) {
      params.push(`am=${encodeURIComponent(link.upiAmount.trim())}`);
    }
    
    // cu (Currency) - always INR
    params.push("cu=INR");
    
    // tn (Transaction Note) - optional
    if (link.upiNote && link.upiNote.trim()) {
      params.push(`tn=${encodeURIComponent(link.upiNote.trim())}`);
    }
    
    const upiUrl = `upi://pay?${params.join("&")}`;

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

    // Return client component for UPI redirect (upi:// protocol doesn't work with server redirect)
    return <UpiRedirect upiUrl={upiUrl} />;
  }

  // Normalize standard URL - ensure it has a protocol
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
