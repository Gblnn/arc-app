import Back from "@/components/back";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Template1 from "@/quotation-templates/template-1";
import { DownloadCloud, Plus, Trash2 } from "lucide-react";
import moment from "moment";
import { usePDF } from "react-to-pdf";
import { useState } from "react";

interface QuotationItem {
  description: string;
  unit: string;
  quantity: number;
  amount: number;
}

export default function Quotation() {
  const { toPDF, targetRef } = usePDF({
    filename: "quotation.pdf",
    page: { margin: 5 },
  });

  // State variables for quotation details
  const [clientName, setClientName] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [refNo, setRefNo] = useState("");
  const [quotationNo, setQuotationNo] = useState("");
  const [date, setDate] = useState(moment().format("DD.MM.YYYY"));
  const [validityPeriod, setValidityPeriod] = useState(
    moment().add(30, "days").format("DD.MM.YYYY")
  );
  const [contactNo, setContactNo] = useState("");
  const [items, setItems] = useState<QuotationItem[]>([
    { description: "", unit: "", quantity: 0, amount: 0 },
  ]);
  const [terms, setTerms] = useState<string[]>([
    "Payment Terms: 100% advance payment",
    "Delivery: Ex-stock",
    "Validity: 30 days from the date of quotation",
  ]);
  const [unitTitle] = useState("Qty");

  // Add new item to quotation
  const addItem = () => {
    setItems([...items, { description: "", unit: "", quantity: 0, amount: 0 }]);
  };

  // Remove item from quotation
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Update item details
  const updateItem = (
    index: number,
    field: keyof QuotationItem,
    value: string | number
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  // Add new term
  const addTerm = () => {
    setTerms([...terms, ""]);
  };

  // Update term
  const updateTerm = (index: number, value: string) => {
    const newTerms = [...terms];
    newTerms[index] = value;
    setTerms(newTerms);
  };

  // Remove term
  const removeTerm = (index: number) => {
    setTerms(terms.filter((_, i) => i !== index));
  };

  const mainContentStyle = {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "2rem",
    padding: "1rem",
    "@media screen and (min-width: 1280px)": {
      gridTemplateColumns: "400px 1fr",
      padding: "2rem",
    },
  } as const;

  const controlsPanelStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
    background: "rgba(100 100 100/ 15%)",
    padding: "1.5rem",
    borderRadius: "0.5rem",
    "@media screen and (min-width: 1280px)": {
      position: "sticky",
      top: "100px",
      height: "fit-content",
      maxHeight: "calc(100vh - 120px)",
      overflowY: "auto",
    },
  } as const;

  const removeButtonStyle = {
    opacity: 0.6,
    transition: "opacity 0.2s",
    "&:hover": {
      opacity: 1,
    },
  } as const;

  const addButtonStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    padding: "0.75rem",
    background: "rgba(100 100 100/ 15%)",
    borderRadius: "0.375rem",
    opacity: 0.8,
    transition: "opacity 0.2s",
    "&:hover": {
      opacity: 1,
    },
  } as const;

  const previewContainerStyle = {
    width: "fit-content",
    minWidth: "100%",
    display: "flex",
    justifyContent: "center",
    "@media screen and (min-width: 1280px)": {
      minWidth: "21cm",
    },
  } as const;

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
          title={"Quotation Generator"}
          extra={
            <button onClick={() => toPDF()}>
              <DownloadCloud color="dodgerblue" className="animate-pulse" />
            </button>
          }
        />
      </div>

      {/* Main Content */}
      <div style={mainContentStyle}>
        {/* Left Panel - Quotation Controls */}
        <div style={controlsPanelStyle}>
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
                value={contactNo}
                onChange={(e) => setContactNo(e.target.value)}
                placeholder="Contact Number"
                className="invoice-input"
              />
            </div>
          </div>

          {/* Quotation Details */}
          <div>
            <label className="text-sm opacity-70 mb-2 block">
              Quotation Details
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
                value={quotationNo}
                onChange={(e) => setQuotationNo(e.target.value)}
                placeholder="Quotation Number"
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
                type="date"
                value={moment(validityPeriod, "DD.MM.YYYY").format(
                  "YYYY-MM-DD"
                )}
                onChange={(e) =>
                  setValidityPeriod(moment(e.target.value).format("DD.MM.YYYY"))
                }
                placeholder="Valid Until"
                className="invoice-input"
              />
            </div>
          </div>

          {/* Quotation Items */}
          <div>
            <label className="text-sm opacity-70 mb-2 block">
              Quotation Items
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
                      style={removeButtonStyle}
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
              <button onClick={addItem} style={addButtonStyle}>
                <Plus size={16} /> Add Item
              </button>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div>
            <label className="text-sm opacity-70 mb-2 block">
              Terms and Conditions
            </label>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {terms.map((term, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    alignItems: "flex-start",
                  }}
                >
                  <input
                    type="text"
                    value={term}
                    onChange={(e) => updateTerm(index, e.target.value)}
                    placeholder="Enter term"
                    className="invoice-input"
                  />
                  <button
                    onClick={() => removeTerm(index)}
                    style={removeButtonStyle}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button onClick={addTerm} style={addButtonStyle}>
                <Plus size={16} /> Add Term
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Quotation Preview */}
        <ScrollArea style={{ width: "100%", overflow: "auto" }}>
          <div ref={targetRef} style={previewContainerStyle}>
            <Template1
              clientName={clientName}
              clientAddress={clientAddress}
              refNo={refNo}
              quotationNo={quotationNo}
              date={date}
              validityPeriod={validityPeriod}
              items={items}
              terms={terms}
              contactNo={contactNo}
              unitTitle={unitTitle}
            />
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}
