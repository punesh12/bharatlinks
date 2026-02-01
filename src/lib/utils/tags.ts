/**
 * Generate a color for a tag based on its name
 * Uses a hash function to ensure consistent colors for the same tag name
 */
export const getTagColor = (tagName: string) => {
  const colors = [
    {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      border: "border-yellow-200",
      icon: "text-yellow-600",
    },
    {
      bg: "bg-orange-100",
      text: "text-orange-800",
      border: "border-orange-200",
      icon: "text-orange-600",
    },
    {
      bg: "bg-amber-100",
      text: "text-amber-800",
      border: "border-amber-200",
      icon: "text-amber-600",
    },
    {
      bg: "bg-blue-100",
      text: "text-blue-800",
      border: "border-blue-200",
      icon: "text-blue-600",
    },
    {
      bg: "bg-indigo-100",
      text: "text-indigo-800",
      border: "border-indigo-200",
      icon: "text-indigo-600",
    },
    {
      bg: "bg-purple-100",
      text: "text-purple-800",
      border: "border-purple-200",
      icon: "text-purple-600",
    },
    {
      bg: "bg-pink-100",
      text: "text-pink-800",
      border: "border-pink-200",
      icon: "text-pink-600",
    },
    {
      bg: "bg-green-100",
      text: "text-green-800",
      border: "border-green-200",
      icon: "text-green-600",
    },
  ];

  // Simple hash function to get consistent color for same tag name
  let hash = 0;
  for (let i = 0; i < tagName.length; i++) {
    hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};
