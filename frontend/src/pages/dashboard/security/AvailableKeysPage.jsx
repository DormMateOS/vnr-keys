import { useOutletContext } from "react-router-dom";
import SearchBar from "../../../components/keys/SearchBar";
import SearchResults from "../../../components/keys/SearchResults";
import DepartmentView from "../../../components/keys/DepartmentView";
import DepartmentsSection from "../../../components/keys/DepartmentsSection";

const AvailableKeysPage = () => {
  const { 
    searchQuery, 
    setSearchQuery, 
    selectedDepartment, 
    keys, 
    handleCollectKey, 
    handleManualAssign,
    handleDepartmentClick, 
    handleBackToListing 
  } = useOutletContext();
  return (
    <div className="flex-1 p-4 pb-20">
      {/* Global Search Bar */}
      <SearchBar 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
      />

      {/* Global Search Results Section - Only show when outside departments and search is active */}
      {!selectedDepartment && searchQuery.trim() && (
        <SearchResults
          searchQuery={searchQuery}
          keys={keys}
          onCollectKey={handleCollectKey}
          onManualAssign={handleManualAssign}
          userRole="security"
        />
      )}

      {/* Department View or Main Content */}
      {selectedDepartment ? (
        <DepartmentView
          department={selectedDepartment}
          keys={keys}
          searchQuery={searchQuery} // Pass search query to filter department keys
          onRequestKey={() => {}} // Security doesn't request keys
          onToggleFrequent={() => {}} // Not applicable for security
          onManualAssign={handleManualAssign}
          onBack={handleBackToListing}
          userRole="security"
        />
      ) : (
        <>
          {/* Departments Section */}
          {!searchQuery.trim() && (
            <DepartmentsSection
              keys={keys}
              onDepartmentClick={handleDepartmentClick}
              selectedDepartment={selectedDepartment}
            />
          )}
        </>
      )}
    </div>
  );
};


export default AvailableKeysPage;
