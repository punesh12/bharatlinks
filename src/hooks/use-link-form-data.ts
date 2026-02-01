import { useState, useEffect } from "react";
import { getAllTags } from "@/lib/actions/links";
import { getUserPlan, getRemainingLinks } from "@/lib/utils/plans";
import type { PlanTier } from "@/lib/plans";

interface TagOption {
  id: string;
  name: string;
}

interface LinkUsage {
  remaining: number | null;
  used: number;
  limit: number | null;
}

interface UseLinkFormDataReturn {
  availableTags: TagOption[];
  currentPlan: PlanTier;
  linkUsage: LinkUsage | null;
  isLoading: boolean;
}

/**
 * Custom hook to fetch link form data (tags, plan, usage)
 * Fetches data when modal is open
 * @param workspaceId - The workspace ID
 * @param isOpen - Whether the modal/form is open
 * @returns Link form data and loading state
 */
export const useLinkFormData = (
  workspaceId: string,
  isOpen: boolean
): UseLinkFormDataReturn => {
  const [availableTags, setAvailableTags] = useState<TagOption[]>([]);
  const [currentPlan, setCurrentPlan] = useState<PlanTier>("free");
  const [linkUsage, setLinkUsage] = useState<LinkUsage | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Fetch data when modal opens
      // This is a valid use case for setState in effect (loading state management)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(true);
      Promise.all([
        getAllTags(workspaceId).catch(() => []),
        getUserPlan().catch(() => "free" as PlanTier),
        getRemainingLinks(workspaceId).catch(() => null),
      ])
        .then(([tags, plan, usage]) => {
          setAvailableTags(tags);
          setCurrentPlan(plan);
          setLinkUsage(usage);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, workspaceId]);

  return {
    availableTags,
    currentPlan,
    linkUsage,
    isLoading,
  };
};
