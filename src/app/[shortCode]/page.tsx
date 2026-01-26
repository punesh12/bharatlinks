import { db } from "@/db";
import { links } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { Metadata } from "next";
import { redirect } from "next/navigation";

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
  try {
    const { shortCode } = await params;
    const [link] = await db.select().from(links).where(eq(links.shortCode, shortCode));

    if (!link) {
      redirect("/");
    }

    // Increment click count
    await db
      .update(links)
      .set({
        clickCount: sql`${links.clickCount} + 1`,
      })
      .where(eq(links.id, link.id));

    // Redirect to the long URL
    redirect(link.longUrl);
  } catch (error) {
    console.error("Error redirecting:", error);
    redirect("/");
  }
};

export default RedirectPage;
