import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  ArrowLeft,
  Pill,
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle,
  Info,
  Clock,
  Save,
} from "lucide-react";
import { SwipeableMedicationCard } from "./SwipeableMedicationCard";
import { useUser, Medication } from "../context/UserContext";

interface HealthHistoryProps {
  onBack: () => void;
}

export function HealthHistory({ onBack }: HealthHistoryProps) {
  const { userProfile, updateMedication, removeMedication } = useUser();
  const [activeTab, setActiveTab] = useState("analyses"); // Default to analyses to show the new feature
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Data from context
  const medications = userProfile.medications;
  const analyses = userProfile.analysisHistory || [];

  // Handler functions for medication actions
  const handleEditMedication = (medication: Medication) => {
    setEditingMedication({ ...medication });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingMedication) return;

    updateMedication(editingMedication.id, editingMedication);
    setIsEditDialogOpen(false);
    setEditingMedication(null);
  };

  const handleDeleteMedication = (medication: Medication) => {
    if (confirm(`${medication.name} ilacını silmek istediğinizden emin misiniz?`)) {
      removeMedication(medication.id);
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "high":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "medium":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case "low":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case "high":
        return <Badge className="bg-red-500">Yüksek</Badge>;
      case "medium":
        return <Badge className="bg-yellow-500">Orta</Badge>;
      case "low":
        return <Badge className="bg-green-500">Düşük</Badge>;
      default:
        return <Badge className="bg-blue-500">Bilgi</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white p-6 shadow-lg">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-white hover:bg-white/20 rounded-full"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <h1 className="text-2xl font-bold">Sağlık Geçmişim</h1>
          </div>
          <p className="text-teal-100 text-sm">
            İlaçlarınız ve analiz geçmişiniz
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-white shadow-md rounded-xl p-1">
            <TabsTrigger value="medications" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white">
              <Pill className="w-4 h-4 mr-2" />
              İlaçlar
            </TabsTrigger>
            <TabsTrigger value="analyses" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white">
              <FileText className="w-4 h-4 mr-2" />
              Analizler
            </TabsTrigger>
          </TabsList>

          {/* İlaçlarım Tab */}
          <TabsContent value="medications" className="space-y-4">
            {/* Swipe Hint */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-900 leading-relaxed">
                    <span className="font-semibold">İpucu:</span> İlaç kartlarını sola kaydırarak{" "}
                    <span className="font-semibold">düzenle</span> veya{" "}
                    <span className="font-semibold">sil</span> seçeneklerine erişebilirsiniz.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Aktif İlaçlar</h3>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  {medications.filter((m) => m.status === "active").length} Aktif
                </Badge>
              </div>

              {medications
                .filter((med) => med.status === "active")
                .map((med) => (
                  <SwipeableMedicationCard
                    key={med.id}
                    medication={med}
                    onEdit={handleEditMedication}
                    onDelete={handleDeleteMedication}
                  />
                ))}

              {medications.filter((m) => m.status === "active").length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  Henüz aktif ilaç kaydınız yok. AI Asistan'a ilaçlarınızı söyleyerek ekleyebilirsiniz.
                </div>
              )}
            </div>

            <div className="space-y-3 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Bırakılan İlaçlar</h3>
                <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                  {medications.filter((m) => m.status === "stopped").length}
                </Badge>
              </div>

              {medications
                .filter((med) => med.status === "stopped")
                .map((med) => (
                  <Card key={med.id} className="shadow-md border-l-4 border-l-gray-300 opacity-75">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                            <Pill className="w-6 h-6 text-gray-400" />
                          </div>
                          <div>
                            <CardTitle className="text-lg text-gray-700">
                              {med.name}
                            </CardTitle>
                            <CardDescription>
                              {med.dosage} - {med.frequency}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant="secondary">Bırakıldı</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(med.startDate!).toLocaleDateString("tr-TR")} -{" "}
                          {med.endDate &&
                            new Date(med.endDate).toLocaleDateString("tr-TR")}
                        </span>
                      </div>
                      {med.notes && (
                        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          {med.notes}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          {/* Analiz Geçmişi Tab */}
          <TabsContent value="analyses" className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-md mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Toplam Analiz</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analyses.length}
                  </p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-2xl flex items-center justify-center">
                  <FileText className="w-8 h-8 text-teal-600" />
                </div>
              </div>
            </div>

            {analyses.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm">
                Henüz bir analiz geçmişiniz bulunmuyor. AI Asistan ile konuşarak analiz yaptırabilirsiniz.
              </div>
            )}

            {analyses.map((analysis) => (
              <Card key={analysis.id} className="shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">{getRiskIcon(analysis.riskLevel)}</div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-gray-900 leading-tight">
                          {analysis.query}
                        </h3>
                        {getRiskBadge(analysis.riskLevel)}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-3">{analysis.summary}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(analysis.date).toLocaleDateString("tr-TR")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {analysis.time}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Medication Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>İlaç Bilgilerini Düzenle</DialogTitle>
            <DialogDescription>
              İlaç bilgilerinizi güncelleyin ve kaydedin
            </DialogDescription>
          </DialogHeader>

          {editingMedication && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">İlaç Adı</Label>
                <Input
                  id="edit-name"
                  value={editingMedication.name}
                  onChange={(e) =>
                    setEditingMedication({ ...editingMedication, name: e.target.value })
                  }
                  placeholder="İlaç adı"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-dosage">Doz</Label>
                  <Input
                    id="edit-dosage"
                    value={editingMedication.dosage}
                    onChange={(e) =>
                      setEditingMedication({ ...editingMedication, dosage: e.target.value })
                    }
                    placeholder="500mg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-frequency">Sıklık</Label>
                  <Input
                    id="edit-frequency"
                    value={editingMedication.frequency}
                    onChange={(e) =>
                      setEditingMedication({ ...editingMedication, frequency: e.target.value })
                    }
                    placeholder="Günde 2 kez"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-startDate">Başlangıç Tarihi</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={editingMedication.startDate}
                  onChange={(e) =>
                    setEditingMedication({ ...editingMedication, startDate: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notlar</Label>
                <Textarea
                  id="edit-notes"
                  value={editingMedication.notes || ""}
                  onChange={(e) =>
                    setEditingMedication({ ...editingMedication, notes: e.target.value })
                  }
                  placeholder="İlaç kullanım notları..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingMedication(null);
              }}
            >
              İptal
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
