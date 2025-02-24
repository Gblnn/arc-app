import Back from "@/components/back";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Template1 from "@/invoice-templates/template-1";
import { DownloadCloud, Plus, Trash2 } from "lucide-react";
import moment from "moment";
import { usePDF } from "react-to-pdf";
import { useState } from "react";
import CustomDropdown from "@/components/custom-dropdown";

interface InvoiceItem {
  description: string;
  unit: string;
  quantity: number;
  amount: number;
}

export default function Invoice() {
  const { toPDF, targetRef } = usePDF({
    filename: "invoice.pdf",
    page: { margin: 5 },
  });

  // State variables for invoice details
  const [clientName, setClientName] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [refNo, setRefNo] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [date, setDate] = useState(moment().format("DD.MM.YYYY"));
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "", unit: "", quantity: 0, amount: 0 },
  ]);
  const [isTaxInvoice, setIsTaxInvoice] = useState(true);
  const [vatinNo, setVatinNo] = useState("");
  const [contactNo, setContactNo] = useState("");

  // Calculate total amount
  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.amount,
    0
  );

  // Add new item to invoice
  const addItem = () => {
    setItems([...items, { description: "", unit: "", quantity: 0, amount: 0 }]);
  };

  // Remove item from invoice
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Update item details
  const updateItem = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const invoiceTypeOptions = [
    { value: "tax", label: "Tax Invoice" },
    { value: "cash", label: "Cash Invoice" },
  ];

  return (
    <div style={{ display: "flex", flexFlow: "column", minHeight: "100vh" }}>
      {/* Header */}
      <div
        style={{
          width: "100%",
          padding: "1.25rem",
          position: "sticky",
          top: 0,
          zIndex: 1,
          background: "rgba(60 60 60/ 75%)",
          backdropFilter: "blur(16px)",
        }}
      >
        <Back
          title={"Invoice Generator"}
          extra={
            <button onClick={() => toPDF()}>
              <DownloadCloud color="dodgerblue" className="animate-pulse" />
            </button>
          }
        />
      </div>

      {/* Main Content */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr", // Single column on mobile
          gap: "2rem",
          padding: "1rem",
          "@media (min-width: 1280px)": {
            // Switch to side-by-side on larger screens
            gridTemplateColumns: "400px 1fr",
            padding: "2rem",
          },
        }}
      >
        {/* Left Panel - Invoice Controls */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
            background: "rgba(100 100 100/ 15%)",
            padding: "1.5rem",
            borderRadius: "0.5rem",
            "@media (min-width: 1280px)": {
              position: "sticky",
              top: "100px",
              height: "fit-content",
              maxHeight: "calc(100vh - 120px)",
              overflowY: "auto",
            },
          }}
        >
          {/* Invoice Type */}
          <div>
            <label className="text-sm opacity-70 mb-2 block">
              Invoice Type
            </label>
            <CustomDropdown
              value={isTaxInvoice ? "tax" : "cash"}
              onChange={(value) => setIsTaxInvoice(value === "tax")}
              options={invoiceTypeOptions}
              placeholder="Select Invoice Type"
            />
          </div>

          {/* Client Details */}
          <div>
            <label className="text-sm opacity-70 mb-2 block">
              Client Details
            </label>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Client Name"
                className="invoice-input"
              />
              <input
                type="text"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                placeholder="Client Address"
                className="invoice-input"
              />
              <input
                type="text"
                value={vatinNo}
                onChange={(e) => setVatinNo(e.target.value)}
                placeholder="VATIN Number"
                className="invoice-input"
              />
            </div>
          </div>

          {/* Invoice Details */}
          <div>
            <label className="text-sm opacity-70 mb-2 block">
              Invoice Details
            </label>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <input
                type="text"
                value={refNo}
                onChange={(e) => setRefNo(e.target.value)}
                placeholder="Reference Number"
                className="invoice-input"
              />
              <input
                type="text"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                placeholder="Invoice Number"
                className="invoice-input"
              />
              <input
                type="date"
                value={moment(date, "DD.MM.YYYY").format("YYYY-MM-DD")}
                onChange={(e) =>
                  setDate(moment(e.target.value).format("DD.MM.YYYY"))
                }
                className="invoice-input"
              />
              <input
                type="text"
                value={contactNo}
                onChange={(e) => setContactNo(e.target.value)}
                placeholder="Contact Number"
                className="invoice-input"
              />
            </div>
          </div>

          {/* Invoice Items */}
          <div>
            <label className="text-sm opacity-70 mb-2 block">
              Invoice Items
            </label>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {items.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    background: "rgba(100 100 100/ 10%)",
                    padding: "1rem",
                    borderRadius: "0.375rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span className="text-sm opacity-70">Item {index + 1}</span>
                    <button
                      onClick={() => removeItem(index)}
                      style={{ opacity: 0.6, hover: { opacity: 1 } }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) =>
                      updateItem(index, "description", e.target.value)
                    }
                    placeholder="Description"
                    className="invoice-input"
                  />
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: "0.5rem",
                    }}
                  >
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) =>
                        updateItem(index, "unit", e.target.value)
                      }
                      placeholder="Unit"
                      className="invoice-input"
                    />
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(index, "quantity", Number(e.target.value))
                      }
                      placeholder="Qty"
                      className="invoice-input"
                    />
                    <input
                      type="number"
                      value={item.amount}
                      onChange={(e) =>
                        updateItem(index, "amount", Number(e.target.value))
                      }
                      placeholder="Amount"
                      className="invoice-input"
                    />
                  </div>
                </div>
              ))}
              <button
                onClick={addItem}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  padding: "0.75rem",
                  background: "rgba(100 100 100/ 15%)",
                  borderRadius: "0.375rem",
                  opacity: 0.8,
                  hover: { opacity: 1 },
                }}
              >
                <Plus size={16} /> Add Item
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Invoice Preview */}
        <ScrollArea
          style={{
            width: "100%",
            overflow: "auto",
          }}
        >
          <div
            ref={targetRef}
            style={{
              width: "fit-content",
              minWidth: "100%",
              display: "flex",
              justifyContent: "center",
              "@media (min-width: 1280px)": {
                minWidth: "21cm", // Match template width
              },
            }}
          >
            <Template1
              clientName={clientName}
              clientAddress={clientAddress}
              refNo={refNo}
              invoiceNo={invoiceNo}
              date={date}
              items={items}
              amount={totalAmount}
              isTaxInvoice={isTaxInvoice}
              vatinNo={vatinNo}
              contactNo={contactNo}
            />
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}
