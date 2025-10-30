import { useState } from "react";
import { ChevronLeft, Filter } from "lucide-react";
import KeyCard from "./KeyCard";

const matchesSearch = (key, query) => {
  if (!query.trim()) return true;
  const term = query.toLowerCase();
  return (
    key.keyName.toLowerCase().includes(term) ||
    String(key.keyNumber).toLowerCase().includes(term) ||
    (key.location || "").toLowerCase().includes(term)
  );
};

const applyAvailabilityFilter = (keys, filter) => {
  switch (filter) {
    case "available":
      return keys.filter((k) => k.status === "available");
    case "unavailable":
      return keys.filter((k) => k.status !== "available");
    default:
      return keys;
  }
};

const DepartmentView = ({
  department,
  keys,
  searchQuery,
  onRequestKey,
  onManualAssign,
  onBack,
}) => {
  const [availabilityFilter, setAvailabilityFilter] = useState("all");

  const departmentKeys = keys.filter(key => key.department === department);
  const filteredBySearch = departmentKeys.filter(key => matchesSearch(key, searchQuery));
  const finalKeys = applyAvailabilityFilter(filteredBySearch, availabilityFilter);

  const handleFilterChange = (filter) => {
    setAvailabilityFilter(filter);
  };

  return (
    <div className="space-y-6 pt-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 bg-gray-800 border border-gray-700 rounded-full 
          transition-all duration-300 hover:bg-gray-700 hover:border-indigo-400"
        >
          <ChevronLeft className="w-5 h-5 text-indigo-400" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-white">
            {department} Department
          </h2>
          <p className="text-gray-300">{finalKeys.length} keys available</p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-400" />
        <div className="flex gap-2 overflow-x-auto pb-2">
          {["all", "available", "unavailable"].map((filter) => (
            <button
              key={filter}
              onClick={() => handleFilterChange(filter)}
              className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap 
              transition-all duration-300
              ${
                availabilityFilter === filter
                  ? "bg-indigo-500 text-white"
                  : "bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700"
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

			{/* Keys List */}
			<div className="space-y-4">
				{finalKeys.length === 0 ? (
					<div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
						<p className="text-gray-400 text-lg">
							{searchQuery.trim() 
								? `No keys found matching "${searchQuery}"` 
								: "No keys available in this department"
							}
						</p>
					</div>
				) : (
					finalKeys.map((key) => (
						<KeyCard
							key={key.id}
							keyData={key}
							variant="default"
							onRequestKey={onRequestKey}
							onManualAssign={onManualAssign}
						/>
					))
				)}
			</div>
		</div>
	);
};

export default DepartmentView;
