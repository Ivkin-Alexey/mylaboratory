import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Equipment } from "@shared/schema";

interface EquipmentCardProps {
  equipment: Equipment;
  onBook: (equipmentId: number) => void;
}

const EquipmentCard: React.FC<EquipmentCardProps> = ({ equipment, onBook }) => {
  // Determine status badge color and text
  const getStatusBadge = () => {
    switch (equipment.status) {
      case "available":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            Available
          </Badge>
        );
      case "booked":
        return (
          <Badge className="bg-red-500 hover:bg-red-600">
            Booked
          </Badge>
        );
      case "maintenance":
        return (
          <Badge className="bg-amber-500 hover:bg-amber-600">
            Maintenance
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="overflow-hidden transition-transform transform hover:scale-105">
      <div className="relative">
        <img 
          src={equipment.imageUrl || "https://via.placeholder.com/400x250?text=No+Image"} 
          alt={equipment.name} 
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-0 right-0 mt-2 mr-2">
          {getStatusBadge()}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800">{equipment.name}</h3>
        <p className="text-gray-600 text-sm mt-1">{equipment.description}</p>
        
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm">
            <span className="text-gray-500">Category:</span>
            <span className="text-gray-700 font-medium ml-1 capitalize">{equipment.category}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-500">Location:</span>
            <span className="text-gray-700 font-medium ml-1">{equipment.location}</span>
          </div>
        </div>
        
        {equipment.status === "available" ? (
          <Button 
            className="mt-4 w-full"
            onClick={() => onBook(equipment.id)}>
            Book Now
          </Button>
        ) : (
          <Button 
            className="mt-4 w-full"
            variant="outline"
            disabled>
            {equipment.status === "maintenance" ? "Under Maintenance" : "Next Available: Soon"}
          </Button>
        )}
      </div>
    </Card>
  );
};

export default EquipmentCard;
