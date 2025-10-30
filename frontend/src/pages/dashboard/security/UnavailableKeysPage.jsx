import { useOutletContext } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import SearchBar from "../../../components/keys/SearchBar";
import SearchResults from "../../../components/keys/SearchResults";
import KeyCard from "../../../components/keys/KeyCard";

const UnavailableKeysPage = () => {
  const { 
    searchQuery, 
    setSearchQuery,
    unavailableKeys, 
    handleCollectKey 
  } = useOutletContext();

  // Filter unavailable keys based on search query
  const filteredUnavailableKeys = unavailableKeys.filter(key => {
    if (!searchQuery.trim()) return true;
    const term = searchQuery.toLowerCase();
    return (
      key.keyName?.toLowerCase().includes(term) ||
      key.keyNumber?.toString().includes(term) ||
      key.location?.toLowerCase().includes(term) ||
      key.department?.toLowerCase().includes(term) ||
      key.takenBy?.name?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="flex-1 p-4 pb-20">
      {/* Search Bar */}
      <SearchBar 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
      />

      {/* Search Results */}
      {searchQuery.trim() && (
        <SearchResults
          searchQuery={searchQuery}
          keys={unavailableKeys}
          onCollectKey={handleCollectKey}
          userRole="security"
          variant="unavailable"
        />
      )}

      {/* Main Content - Only show when not searching */}
      {!searchQuery.trim() && (
        <>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Unavailable Keys</h2>
            <div className="bg-red-600/20 text-red-300 px-3 py-1 rounded-full text-sm font-medium border border-red-600/30">
              {unavailableKeys.length} Unavailable
            </div>
          </div>

          {unavailableKeys.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">All keys are available!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {unavailableKeys.map((key) => (
                <KeyCard
                  key={key.id}
                  keyData={key}
                  variant="unavailable"
                  onCollectKey={handleCollectKey}
                  userRole="security"
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};


export default UnavailableKeysPage;
