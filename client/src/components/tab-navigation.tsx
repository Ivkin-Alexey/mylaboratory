import React from "react";

interface TabNavigationProps {
  activeTab: "equipment" | "myBookings";
  setActiveTab: (tab: "equipment" | "myBookings") => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button 
            className={`py-4 px-1 border-b-2 font-medium ${
              activeTab === "equipment" 
              ? "border-primary text-primary" 
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("equipment")}
            aria-current={activeTab === "equipment" ? "page" : undefined}>
            Equipment
          </button>
          <button 
            className={`py-4 px-1 border-b-2 font-medium ${
              activeTab === "myBookings" 
              ? "border-primary text-primary" 
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("myBookings")}
            aria-current={activeTab === "myBookings" ? "page" : undefined}>
            My Bookings
          </button>
        </nav>
      </div>
    </div>
  );
};

export default TabNavigation;
