import { useOutletContext } from "react-router-dom";
import { Key, RefreshCw } from "lucide-react";
import SearchBar from "../../../components/keys/SearchBar";
import SearchResults from "../../../components/keys/SearchResults";
import KeyCard from "../../../components/keys/KeyCard";

const MyKeysPage = () => {
  const { 
    searchQuery, 
    setSearchQuery, 
    takenKeys, 
    keys,
    handleRequestKey,
    handleReturnKey,
    user,
    fetchTakenKeys,
    isLoadingTakenKeys
  } = useOutletContext();

  return (
    <div className="flex-1 p-4 pb-20">
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      {searchQuery.trim() && (
        <SearchResults
          searchQuery={searchQuery}
          keys={takenKeys}
          onRequestKey={handleRequestKey}
          onReturnKey={handleReturnKey}
          userRole="faculty"
          variant="taken"
        />
      )}
      {!searchQuery.trim() && (
        <>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">My Keys</h2>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-400/40 text-white px-3 py-1 rounded-full text-sm font-medium border border-blue-600/30 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
                {takenKeys.length} Taken
              </div>
              <button
                onClick={() => fetchTakenKeys(user?.id)}
                disabled={isLoadingTakenKeys}
                className="p-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg border border-blue-600/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh taken keys"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingTakenKeys ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          {isLoadingTakenKeys ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">Loading taken keys...</p>
            </div>
          ) : takenKeys.length === 0 ? (
            <div className="text-center py-12">
              <Key className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No keys taken</p>
              <p className="text-gray-500 text-sm mt-2">Go to Key List to request keys</p>
            </div>
          ) : (
            <div className="space-y-4">
              {takenKeys.map((key) => (
                <KeyCard
                  key={key.id}
                  keyData={key}
                  variant="taken"
                  onReturnKey={handleReturnKey}
                  showQR={false}
                  userRole="faculty"
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyKeysPage;
