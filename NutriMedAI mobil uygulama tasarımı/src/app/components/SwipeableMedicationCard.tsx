import { useState, useRef } from "react";
import { motion, PanInfo, useMotionValue, useTransform } from "motion/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Pill, Calendar, Info, Edit2, Trash2 } from "lucide-react";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  notes?: string;
  status: "active" | "stopped";
}

interface SwipeableMedicationCardProps {
  medication: Medication;
  onEdit: (medication: Medication) => void;
  onDelete: (medication: Medication) => void;
}

export function SwipeableMedicationCard({
  medication,
  onEdit,
  onDelete,
}: SwipeableMedicationCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  
  // Action thresholds
  const EDIT_THRESHOLD = -80;
  const DELETE_THRESHOLD = -160;

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    const offset = info.offset.x;

    if (offset < DELETE_THRESHOLD) {
      // Delete action - keep it swiped while showing action
      x.set(-160);
      setTimeout(() => {
        onDelete(medication);
      }, 100);
    } else if (offset < EDIT_THRESHOLD) {
      // Edit action - keep it swiped while showing action
      x.set(-80);
      setTimeout(() => {
        onEdit(medication);
        // Snap back after action
        x.set(0);
      }, 100);
    } else {
      // Snap back
      x.set(0);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Action Buttons Background */}
      <div className="absolute inset-y-0 right-0 flex items-stretch rounded-xl overflow-hidden">
        <button
          onClick={() => {
            onEdit(medication);
            x.set(0);
          }}
          className="w-20 bg-blue-500 flex flex-col items-center justify-center gap-1 text-white font-semibold hover:bg-blue-600 active:bg-blue-700 transition-colors"
        >
          <Edit2 className="w-5 h-5" />
          <span className="text-xs">Düzenle</span>
        </button>
        <button
          onClick={() => {
            onDelete(medication);
          }}
          className="w-20 bg-red-500 flex flex-col items-center justify-center gap-1 text-white font-semibold hover:bg-red-600 active:bg-red-700 transition-colors"
        >
          <Trash2 className="w-5 h-5" />
          <span className="text-xs">Sil</span>
        </button>
      </div>

      {/* Swipeable Card */}
      <motion.div
        ref={cardRef}
        drag="x"
        dragConstraints={{ left: -160, right: 0 }}
        dragElastic={0.1}
        style={{ x }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        animate={{ x }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`relative z-10 ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      >
        <Card className="shadow-md border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Pill className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">{medication.name}</CardTitle>
                  <CardDescription>
                    {medication.dosage} - {medication.frequency}
                  </CardDescription>
                </div>
              </div>
              <Badge className="bg-green-500">Aktif</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>
                Başlangıç:{" "}
                {new Date(medication.startDate).toLocaleDateString("tr-TR")}
              </span>
            </div>
            {medication.notes && (
              <div className="flex items-start gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>{medication.notes}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
