import React, { useState } from "react";
import { ToggleLeft, ToggleRight, Eye, Activity, Monitor } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const TrackingControls = () => {
  const [trackers, setTrackers] = useState({
    faceTracking: false,
    activityLog: false,
    screenTracking: false,
  });

  const toggleTracker = (trackerName: keyof typeof trackers) => {
    setTrackers((prev) => ({
      ...prev,
      [trackerName]: !prev[trackerName],
    }));
  };

  const ToggleButton = ({
    isActive,
    icon: Icon,
    label,
    onClick,
  }: {
    isActive: boolean;
    icon: React.ElementType;
    label: string;
    onClick: () => void;
  }) => (
    <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
      <div className="flex items-center gap-3">
        <Icon
          size={20}
          className={isActive ? "text-green-400" : "text-gray-400"}
        />
        <span className="font-medium">{label}</span>
      </div>
      <button
        onClick={onClick}
        className="focus:outline-none"
        aria-label={`Toggle ${label}`}
      >
        {isActive ? (
          <ToggleRight className="w-10 h-10 text-green-400" />
        ) : (
          <ToggleLeft className="w-10 h-10 text-gray-400" />
        )}
      </button>
    </div>
  );

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>
          <Monitor size={24} /> Tracking Controls
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ToggleButton
            isActive={trackers.faceTracking}
            icon={Eye}
            label="Face Tracking"
            onClick={() => toggleTracker("faceTracking")}
          />
          <ToggleButton
            isActive={trackers.activityLog}
            icon={Activity}
            label="Activity Log"
            onClick={() => toggleTracker("activityLog")}
          />
          <ToggleButton
            isActive={trackers.screenTracking}
            icon={Monitor}
            label="Screen Tracking"
            onClick={() => toggleTracker("screenTracking")}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TrackingControls;
