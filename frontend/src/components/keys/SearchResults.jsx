import { Search } from "lucide-react";
import KeyCard from "./KeyCard";

const SearchResults = ({ 
  searchQuery, 
  keys, 
  onRequestKey, 
  onCollectKey, 
  onToggleFrequent,
  onReturnKey,
  onManualAssign,
  userRole = "faculty", // "faculty" or "security"
  variant = "all" // "all" or "taken"
}) => {
  // Filter keys based on search query
  const filteredKeys = keys.filter(key => 
    searchQuery === "" || 
    key.keyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    key.keyNumber?.toString().includes(searchQuery) ||
    key.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    key.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    key.block?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    key.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Don't render if no search query
  if (!searchQuery.trim()) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-semibold text-white">
            Search Results
          </h3>
          <span className="bg-green-600/20 text-green-300 px-2 py-1 rounded-full text-sm font-medium border border-green-600/30">
            {filteredKeys.length} result{filteredKeys.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="text-sm text-gray-400">
          "{searchQuery}"
        </div>
      </div>

      {filteredKeys.length === 0 ? (
        <div className="text-center py-8 bg-white/5 rounded-xl border border-white/10">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-400 text-lg mb-1">No keys found</p>
          <p className="text-gray-500 text-sm">Try adjusting your search terms</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredKeys.map((key) => {
            // Compute KeyCard variant per key so buttons render correctly
            let keyVariant = variant; // use explicit variant if provided

            if (variant === "all") {
              // determine sensible default variants compatible with KeyCard
              if (userRole === "security") {
                // security expects 'default' for available keys to show Assign button
                keyVariant = key.status === "available" ? "default" : "unavailable";
              } else {
                // faculty/admin: show 'taken' variant for unavailable keys so return QR shows
                keyVariant = key.status === "unavailable" ? "taken" : "default";
              }
            }

            return (
              <KeyCard
                key={key.id}
                keyData={key}
                variant={keyVariant}
                onRequestKey={onRequestKey}
                onCollectKey={onCollectKey}
                onToggleFrequent={onToggleFrequent}
                onReturnKey={onReturnKey}
                onManualAssign={onManualAssign}
                userRole={userRole}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
