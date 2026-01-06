interface EmptyStateProperties {
  type: "subscriptions" | "search";
}

export default function EmptyState({ type }: EmptyStateProperties) {
  const getEmptyStateContent = () => {
    switch (type) {
      case "subscriptions":
        return {
          icon: (
            <svg
              className="w-16 h-16 text-[#9CA3AF]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          ),
          title: "No subscriptions found",
          description:
            "Start by adding your first subscription to track and manage your recurring expenses.",
          actionText: "Add Subscription",
          actionHref: "/subscriptions/add",
        };
      case "search":
        return {
          icon: (
            <svg
              className="w-16 h-16 text-[#9CA3AF]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          ),
          title: "No results found",
          description:
            "Try adjusting your filters or search terms to find what you're looking for.",
          actionText: "Clear Filters",
          actionHref: "#",
        };
      default:
        return {
          icon: (
            <svg
              className="w-16 h-16 text-[#9CA3AF]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
          title: "Nothing here",
          description:
            "The content you're looking for doesn't exist or has been removed.",
          actionText: "Go Home",
          actionHref: "/",
        };
    }
  };

  const content = getEmptyStateContent();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-[#1E293B] rounded-full border border-[#334155]">
            {content.icon}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-[#F8FAFC] mb-2">
          {content.title}
        </h3>

        {/* Description */}
        <p className="text-[#94A3B8] mb-8 leading-relaxed">
          {content.description}
        </p>

        {/* Action Button */}
        <a
          href={content.actionHref}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#3B82F6] text-white font-medium rounded-lg hover:bg-[#2563EB] transition-colors focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0F172A]"
        >
          {type === "subscriptions" && (
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          )}
          {content.actionText}
        </a>
      </div>
    </div>
  );
}
