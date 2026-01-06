import { FilterConfiguration } from "../subscriptions/page";

interface FilterControlsProperties {
  filterConfig: FilterConfiguration;
  onFilterChange: (config: FilterConfiguration) => void;
  totalCount: number;
  filteredCount: number;
}

export default function FilterControls({
  filterConfig,
  onFilterChange,
  totalCount,
  filteredCount,
}: FilterControlsProperties) {
  const handleStatusChange = (value: string) => {
    onFilterChange({ ...filterConfig, statusFilter: value });
  };

  const handleCycleChange = (value: string) => {
    onFilterChange({ ...filterConfig, cycleFilter: value });
  };

  const handleSortChange = (value: "renewalDate" | "cost") => {
    onFilterChange({ ...filterConfig, sortBy: value });
  };

  const toggleSortOrder = () => {
    onFilterChange({
      ...filterConfig,
      sortOrder: filterConfig.sortOrder === "asc" ? "desc" : "asc",
    });
  };

  const clearFilters = () => {
    onFilterChange({
      statusFilter: "all",
      cycleFilter: "all",
      sortBy: "renewalDate",
      sortOrder: "asc",
    });
  };

  const hasActiveFilters =
    filterConfig.statusFilter !== "all" || filterConfig.cycleFilter !== "all";

  return (
    <div className="bg-[#000000] rounded-xl border border-[#333333]/50 p-6 mb-6 shadow-2xl">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Results Summary */}
        <div className="flex items-center gap-4">
          <div>
            <span className="text-sm text-[#B3B3B3]">Showing </span>
            <span className="text-sm font-semibold text-[#FFFFFF]">
              {filteredCount}
            </span>
            <span className="text-sm text-[#B3B3B3]">
              {" "}
              of {totalCount} subscriptions
            </span>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-[#3B82F6] hover:text-[#60A5FA] font-medium transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Status Filter */}
          <div className="relative">
            <select
              value={filterConfig.statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="appearance-none bg-[#282828]/80 backdrop-blur-sm border border-[#2A2A2A]/50 rounded-lg px-4 py-2 pr-8 text-sm text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] transition-all"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg
                className="w-4 h-4 text-[#B3B3B3]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {/* Billing Cycle Filter */}
          <div className="relative">
            <select
              value={filterConfig.cycleFilter}
              onChange={(e) => handleCycleChange(e.target.value)}
              className="appearance-none bg-[#282828]/80 backdrop-blur-sm border border-[#2A2A2A]/50 rounded-lg px-4 py-2 pr-8 text-sm text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] transition-all"
            >
              <option value="all">All Cycles</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="weekly">Weekly</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg
                className="w-4 h-4 text-[#B3B3B3]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={filterConfig.sortBy}
                onChange={(e) =>
                  handleSortChange(e.target.value as "renewalDate" | "cost")
                }
                className="appearance-none bg-[#282828]/80 backdrop-blur-sm border border-[#2A2A2A]/50 rounded-lg px-4 py-2 pr-8 text-sm text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] transition-all"
              >
                <option value="renewalDate">Renewal Date</option>
                <option value="cost">Amount</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-[#B3B3B3]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            <div className="relative">
              <select
                value={filterConfig.sortOrder}
                onChange={(e) =>
                  onFilterChange({
                    ...filterConfig,
                    sortOrder: e.target.value as "asc" | "desc",
                  })
                }
                className="appearance-none bg-[#282828]/80 backdrop-blur-sm border border-[#2A2A2A]/50 rounded-lg px-4 py-2 pr-8 text-sm text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] transition-all"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-[#B3B3B3]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filter Pills */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[#2A2A2A]/50">
          {filterConfig.statusFilter !== "all" && (
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-[#3B82F6]/20 text-[#60A5FA] rounded-full text-sm border border-[#3B82F6]/30 backdrop-blur-sm">
              <span>Status: {filterConfig.statusFilter}</span>
              <button
                onClick={() => handleStatusChange("all")}
                className="ml-1 hover:text-[#3B82F6]"
              >
                ×
              </button>
            </div>
          )}
          {filterConfig.cycleFilter !== "all" && (
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-[#3B82F6]/20 text-[#60A5FA] rounded-full text-sm border border-[#3B82F6]/30 backdrop-blur-sm">
              <span>Cycle: {filterConfig.cycleFilter}</span>
              <button
                onClick={() => handleCycleChange("all")}
                className="ml-1 hover:text-[#3B82F6]"
              >
                ×
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
