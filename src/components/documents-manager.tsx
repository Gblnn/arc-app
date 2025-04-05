import { db } from "@/firebase";
import * as XLSX from "@e965/xlsx";
import { message } from "antd";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { Upload } from "lucide-react";
import moment from "moment";
import { useState } from "react";
import DefaultDialog from "./default-dialog";

interface Props {
  workers: any[];
}

interface Document {
  id: string;
  type: string;
  expiryDate: Date;
  workerId: string;
  documentNumber?: string;
}

interface UploadRow {
  name?: string;
  civilNumber?: string;
  civilExpiry?: string;
  passportNumber?: string;
  passportExpiry?: string;
}

const DOCUMENTS = ["Civil ID", "Passport"] as const;

const styles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .document-card {
    transition: all 0.2s ease;
  }

  .document-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

export default function DocumentsManager({ workers }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [addDialog, setAddDialog] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<string>("");
  const [selectedWorker, setSelectedWorker] = useState<any>(null);
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [updating, setUpdating] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [documentNumber, setDocumentNumber] = useState("");
  const [bulkUploadDialog, setBulkUploadDialog] = useState(false);
  const [uploadingBulk, setUploadingBulk] = useState(false);
  const [documentsDialog, setDocumentsDialog] = useState(false);

  const filteredWorkers = workers.filter((worker) =>
    worker.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fetchWorkerDocuments = async (workerId: string) => {
    try {
      const q = query(
        collection(db, "documents"),
        where("workerId", "==", workerId)
      );
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          expiryDate: data.expiryDate?.toDate() || null,
        };
      }) as Document[];
      setDocuments(docs);
    } catch (error) {
      console.error("Error fetching documents:", error);
      message.error("Failed to fetch documents");
    }
  };

  const handleAddExpiry = async () => {
    if (!selectedWorker || !selectedDocType || !expiryDate) return;
    if (
      (selectedDocType === "Civil ID" || selectedDocType === "Passport") &&
      !documentNumber
    ) {
      message.error(`Please enter ${selectedDocType} number`);
      return;
    }

    try {
      setUpdating(true);
      const documentData = {
        type: selectedDocType,
        expiryDate: new Date(expiryDate),
        workerId: selectedWorker.id,
        ...(["Civil ID", "Passport"].includes(selectedDocType) && {
          documentNumber,
        }),
      };

      if (selectedDocument) {
        await updateDoc(
          doc(db, "documents", selectedDocument.id),
          documentData
        );
        message.success("Document expiry date updated");
      } else {
        await addDoc(collection(db, "documents"), documentData);
        message.success("Document expiry date added");
      }
      fetchWorkerDocuments(selectedWorker.id);
      setAddDialog(false);
    } catch (error) {
      console.error("Error managing document:", error);
      message.error("Failed to manage document");
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateExpiry = async (documentId: string, newDate: string) => {
    try {
      await updateDoc(doc(db, "documents", documentId), {
        expiryDate: new Date(newDate),
      });
      message.success("Expiry date updated");
      fetchWorkerDocuments(selectedWorker.id);
    } catch (error) {
      console.error("Error updating expiry:", error);
      message.error("Failed to update expiry date");
    }
  };

  const isExpiringSoon = (date: Date) => {
    const expiryDate = new Date(date);
    const today = new Date();
    const monthsUntilExpiry =
      (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30);
    return monthsUntilExpiry <= 3;
  };

  const resetDialog = () => {
    setAddDialog(false);
    setSelectedDocType("");
    setExpiryDate("");
    setSelectedWorker(null);
    setSelectedDocument(null);
    setDocumentNumber("");
  };

  const getRequiredDocuments = () => DOCUMENTS;

  const handleBulkUpload = async (file: File) => {
    try {
      setUploadingBulk(true);
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as UploadRow[];

      for (const row of jsonData) {
        const worker = workers.find(
          (w) => w.name.toLowerCase() === row.name?.toString().toLowerCase()
        );

        if (worker) {
          // Parse DD/MM/YYYY to Date object
          const parseDateString = (dateStr: string) => {
            if (!dateStr) return null;
            const [day, month, year] = dateStr.split("/").map(Number);
            return new Date(year, month - 1, day);
          };

          // Handle Civil ID
          if (row.civilNumber || row.civilExpiry) {
            const expiryDate = parseDateString(row.civilExpiry as string);
            if (!expiryDate && row.civilExpiry) {
              message.error(
                `Invalid date format for ${worker.name}'s Civil ID: ${row.civilExpiry}`
              );
              continue;
            }

            await addDoc(collection(db, "documents"), {
              type: "Civil ID",
              documentNumber: row.civilNumber?.toString(),
              expiryDate: expiryDate || new Date(),
              workerId: worker.id,
            });
          }

          // Handle Passport
          if (row.passportNumber || row.passportExpiry) {
            const expiryDate = parseDateString(row.passportExpiry as string);
            if (!expiryDate && row.passportExpiry) {
              message.error(
                `Invalid date format for ${worker.name}'s Passport: ${row.passportExpiry}`
              );
              continue;
            }

            await addDoc(collection(db, "documents"), {
              type: "Passport",
              documentNumber: row.passportNumber?.toString(),
              expiryDate: expiryDate || new Date(),
              workerId: worker.id,
            });
          }
        }
      }

      message.success("Documents uploaded successfully");
      setBulkUploadDialog(false);
      if (selectedWorker) {
        fetchWorkerDocuments(selectedWorker.id);
      }
    } catch (error) {
      console.error("Error uploading documents:", error);
      message.error("Failed to upload documents");
    } finally {
      setUploadingBulk(false);
    }
  };

  const downloadTemplate = () => {
    // Create a row for each worker
    const template = workers.map((worker) => ({
      name: worker.name,
      civilNumber: "",
      civilExpiry: "",
      passportNumber: "",
      passportExpiry: "",
    }));

    // Add column headers by modifying the worksheet after creation
    const ws = XLSX.utils.json_to_sheet(template);

    // Add header row with styling
    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          "Worker Name (Do not modify)",
          "Civil ID Number",
          "Civil ID Expiry (DD/MM/YYYY)",
          "Passport Number",
          "Passport Expiry (DD/MM/YYYY)",
        ],
      ],
      { origin: "A1" }
    );

    // Set column widths
    const columnWidths = [
      { wch: 25 }, // Worker Name
      { wch: 15 }, // Civil ID Number
      { wch: 20 }, // Civil ID Expiry
      { wch: 15 }, // Passport Number
      { wch: 20 }, // Passport Expiry
    ];
    ws["!cols"] = columnWidths;

    // Style the header row
    const headerRange = XLSX.utils.decode_range(ws["!ref"] || "A1");
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!ws[cellRef]) continue;

      ws[cellRef].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "CCCCCC" } },
      };
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "document_upload_template.xlsx");
  };

  const handleViewDocuments = async (worker: any) => {
    setSelectedWorker(worker);
    await fetchWorkerDocuments(worker.id);
    setDocumentsDialog(true);
  };

  return (
    <>
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <div
          style={{
            background: "rgba(30, 30, 40, 0.85)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
            padding: "1rem",
          }}
        >
          <div
            style={{ position: "relative", display: "flex", gap: "0.75rem" }}
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search workers..."
              style={{
                flex: 1,
                padding: "0.75rem 1rem",
                background: "rgba(40, 40, 50, 0.5)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "0.5rem",
                color: "white",
              }}
            />
            <button
              onClick={() => setBulkUploadDialog(true)}
              style={{
                padding: "0.75rem",
                background: "rgba(220, 20, 60, 0.1)",
                border: "1px solid rgba(220, 20, 60, 0.2)",
                borderRadius: "0.5rem",
                color: "salmon",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title="Upload Documents"
            >
              <Upload size={18} />
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: "1rem" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1rem",
              maxWidth: "1600px",
              margin: "0 auto",
            }}
          >
            {filteredWorkers.map((worker) => (
              <div
                key={worker.id}
                onClick={() => handleViewDocuments(worker)}
                style={{
                  background: "rgba(30, 30, 40, 0.5)",
                  borderRadius: "0.5rem",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  padding: "1rem",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                className="hover:bg-[rgba(40,40,50,0.7)] hover:border-[rgba(220,20,60,0.2)]"
              >
                <div>
                  <h3 style={{ fontSize: "1.1rem", marginBottom: "0.25rem" }}>
                    {worker.name}
                  </h3>
                  <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                    {worker.projectCode || "No Project"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Documents Dialog */}
        <DefaultDialog
          title={`${selectedWorker?.name}'s Documents`}
          open={documentsDialog}
          onCancel={() => {
            setDocumentsDialog(false);
            setSelectedWorker(null);
            setDocuments([]);
          }}
          extra={
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              {DOCUMENTS.map((type) => {
                const doc = documents.find((d) => d.type === type);
                return (
                  <div
                    key={type}
                    onClick={() => {
                      setSelectedDocType(type);
                      setDocumentNumber(doc?.documentNumber || "");
                      setExpiryDate(
                        doc?.expiryDate
                          ? moment(doc.expiryDate).format("YYYY-MM-DD")
                          : ""
                      );
                      setSelectedDocument(doc || null);
                      setAddDialog(true);
                    }}
                    style={{
                      padding: "1.5rem",
                      background: doc
                        ? "rgba(220, 20, 60, 0.05)"
                        : "rgba(30, 30, 40, 0.5)",
                      borderRadius: "0.75rem",
                      border: doc
                        ? "1px solid rgba(220, 20, 60, 0.2)"
                        : "1px solid rgba(255, 255, 255, 0.05)",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    className="hover:bg-[rgba(40,40,50,0.7)] hover:border-[rgba(220,20,60,0.2)]"
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.75rem",
                      }}
                    >
                      <h3
                        style={{
                          fontSize: "1.1rem",
                          color: doc ? "salmon" : "white",
                        }}
                      >
                        {type}
                      </h3>

                      {doc ? (
                        <>
                          {doc.documentNumber && (
                            <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                              #{doc.documentNumber}
                            </p>
                          )}
                          <p
                            style={{
                              fontSize: "0.9rem",
                              color: isExpiringSoon(doc.expiryDate)
                                ? "salmon"
                                : "#94a3b8",
                            }}
                          >
                            Expires{" "}
                            {moment(doc.expiryDate).format("DD MMM YYYY")}
                            {isExpiringSoon(doc.expiryDate) &&
                              " (Expiring soon)"}
                          </p>
                        </>
                      ) : (
                        <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                          Not added yet
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          }
        />

        {/* Add/Update Expiry Dialog */}
        <DefaultDialog
          title={`${selectedDocument ? "Update" : "Add"} ${selectedDocType}`}
          open={addDialog}
          onCancel={resetDialog}
          onOk={handleAddExpiry}
          OkButtonText={selectedDocument ? "Update" : "Add"}
          updating={updating}
          extra={
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <p style={{ color: "#94a3b8" }}>
                Set expiry date for {selectedDocType}
              </p>
              {(selectedDocType === "Civil ID" ||
                selectedDocType === "Passport") && (
                <input
                  type="text"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder={`Enter ${selectedDocType} number`}
                  style={{
                    padding: "0.75rem",
                    background: "rgba(40, 40, 50, 0.5)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "0.5rem",
                    color: "white",
                  }}
                />
              )}
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                style={{
                  padding: "0.75rem",
                  background: "rgba(40, 40, 50, 0.5)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "0.5rem",
                  color: "white",
                }}
              />
            </div>
          }
        />

        {/* Bulk Upload Dialog */}
        <DefaultDialog
          title="Upload Documents"
          open={bulkUploadDialog}
          onCancel={() => setBulkUploadDialog(false)}
          updating={uploadingBulk}
          extra={
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <p style={{ color: "#94a3b8" }}>
                Upload an Excel file with document details.{" "}
                <span
                  onClick={downloadTemplate}
                  style={{ color: "salmon", cursor: "pointer" }}
                >
                  Download template
                </span>
              </p>
              <label
                style={{
                  padding: "0.75rem",
                  background: "rgba(40, 40, 50, 0.5)",
                  borderRadius: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  cursor: "pointer",
                  color: "#94a3b8",
                }}
              >
                <Upload size={18} />
                Upload Excel File
                <input
                  type="file"
                  onChange={(e) =>
                    e.target.files?.[0] && handleBulkUpload(e.target.files[0])
                  }
                  style={{ display: "none" }}
                  accept=".xlsx,.xls"
                />
              </label>
            </div>
          }
        />
      </div>
      <style>{styles}</style>
    </>
  );
}
