import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { InvitationAcceptance } from "@/components/invitation-acceptance";
import { db } from "@/db";
import { workspaceInvitations } from "@/db/schema";
import { eq } from "drizzle-orm";

const InvitePage = async ({ params }: { params: Promise<{ token: string }> }) => {
  const { token } = await params;
  const user = await currentUser();

  // First, check if invitation exists and get the email
  const [invitation] = await db
    .select()
    .from(workspaceInvitations)
    .where(eq(workspaceInvitations.token, token))
    .limit(1);

  if (!invitation) {
    redirect("/sign-in?error=invitation_not_found");
  }

  if (invitation.status !== "pending") {
    redirect("/sign-in?error=invitation_already_processed");
  }

  if (new Date() > invitation.expiresAt) {
    redirect("/sign-in?error=invitation_expired");
  }

  // If user is not signed in, redirect to sign-up with invitation email pre-filled
  if (!user) {
    const signUpUrl = `/sign-up?email=${encodeURIComponent(invitation.email)}&redirect_url=${encodeURIComponent(`/invite/${token}`)}`;
    redirect(signUpUrl);
  }

  // If user is signed in but email doesn't match, redirect to sign-up with correct email
  const userEmail = user.emailAddresses[0]?.emailAddress?.toLowerCase().trim();
  const invitationEmail = invitation.email.toLowerCase().trim();

  if (userEmail !== invitationEmail) {
    // User is signed in with different email, redirect to sign-up with invitation email
    const signUpUrl = `/sign-up?email=${encodeURIComponent(invitation.email)}&redirect_url=${encodeURIComponent(`/invite/${token}`)}`;
    redirect(signUpUrl);
  }

  // User exists and email matches, show acceptance page
  return <InvitationAcceptance token={token} />;
};

export default InvitePage;
