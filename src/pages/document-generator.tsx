import Back from "@/components/back";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import InvoiceTemplate from "@/invoice-templates/template-1";
import QuotationTemplate from "@/quotation-templates/template-1";
import { DownloadCloud, Plus, Trash2 } from "lucide-react";
import moment from "moment";
import { usePDF } from "react-to-pdf";
import { useState } from "react";
import CustomDropdown from "@/components/custom-dropdown";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DocumentItem {
  description: string;
  unit: string;
  quantity: number;
  amount: number;
}

type DocumentType = "invoice" | "quotation";

export default function DocumentGenerator() {
  const { toPDF, targetRef } = usePDF({
    filename: "document.pdf",
    page: { margin: 5 },
  });

  // Document type state
  const [documentType, setDocumentType] = useState<DocumentType>("invoice");

  // Common state variables
  const [clientName, setClientName] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [refNo, setRefNo] = useState("");
  const [date, setDate] = useState(moment().format("DD.MM.YYYY"));
  const [contactNo, setContactNo] = useState("");
  const [items, setItems] = useState<DocumentItem[]>([
    { description: "", unit: "", quantity: 0, amount: 0 },
  ]);

  // Invoice-specific state
  const [invoiceNo, setInvoiceNo] = useState("");
  const [isTaxInvoice, setIsTaxInvoice] = useState(true);
  const [vatinNo, setVatinNo] = useState("");

  // Quotation-specific state
  const [quotationNo, setQuotationNo] = useState("");
  const [validityPeriod, setValidityPeriod] = useState(
    moment().add(30, "days").format("DD.MM.YYYY")
  );
  const [terms, setTerms] = useState<string[]>([
    "Payment Terms: 100% advance payment",
    "Delivery: Ex-stock",
    "Validity: 30 days from the date of quotation",
  ]);

  // Calculate total amount
  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.amount,
    0
  );

  // Invoice type options
  const invoiceTypeOptions = [
    { value: "tax", label: "Tax Invoice" },
    { value: "cash", label: "Cash Invoice" },
  ];

  // Handlers for terms
  const addTerm = () => {
    setTerms([...terms, ""]);
  };

  const updateTerm = (index: number, value: string) => {
    const newTerms = [...terms];
    newTerms[index] = value;
    setTerms(newTerms);
  };

  const removeTerm = (index: number) => {
    setTerms(terms.filter((_, i) => i !== index));
  };

  // Item handlers
  const addItem = () => {
    setItems([...items, { description: "", unit: "", quantity: 0, amount: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (
    index: number,
    field: keyof DocumentItem,
    value: string | number
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  // Styles
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

  const headerStyle = {
    width: "100%",
    padding: "1.25rem",
    position: "sticky" as const,
    top: 0,
    zIndex: 1,
    background: "rgba(60 60 60/ 75%)",
    backdropFilter: "blur(16px)",
  };

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
      <div style={headerStyle}>
        <Back
          title="Document Generator"
          extra={
            <button onClick={() => toPDF()}>
              <DownloadCloud color="dodgerblue" className="animate-pulse" />
            </button>
          }
        />
      </div>

      {/* Main Content */}
      <div style={mainContentStyle}>
        {/* Left Panel - Controls */}
        <div style={controlsPanelStyle}>
          {/* Replace Document Type Selector with Tabs */}
          <Tabs
            defaultValue="invoice"
            value={documentType}
            onValueChange={(value) => setDocumentType(value as DocumentType)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="invoice">Invoice</TabsTrigger>
              <TabsTrigger value="quotation">Quotation</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Invoice Type (only for invoice) */}
          {documentType === "invoice" && (
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
          )}

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
              {documentType === "invoice" && (
                <input
                  type="text"
                  value={vatinNo}
                  onChange={(e) => setVatinNo(e.target.value)}
                  placeholder="VATIN Number"
                  className="invoice-input"
                />
              )}
              <input
                type="text"
                value={contactNo}
                onChange={(e) => setContactNo(e.target.value)}
                placeholder="Contact Number"
                className="invoice-input"
              />
            </div>
          </div>

          {/* Document Details */}
          <div>
            <label className="text-sm opacity-70 mb-2 block">
              {documentType === "invoice"
                ? "Invoice Details"
                : "Quotation Details"}
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
                value={documentType === "invoice" ? invoiceNo : quotationNo}
                onChange={(e) =>
                  documentType === "invoice"
                    ? setInvoiceNo(e.target.value)
                    : setQuotationNo(e.target.value)
                }
                placeholder={`${
                  documentType === "invoice" ? "Invoice" : "Quotation"
                } Number`}
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
              {documentType === "quotation" && (
                <input
                  type="date"
                  value={moment(validityPeriod, "DD.MM.YYYY").format(
                    "YYYY-MM-DD"
                  )}
                  onChange={(e) =>
                    setValidityPeriod(
                      moment(e.target.value).format("DD.MM.YYYY")
                    )
                  }
                  placeholder="Valid Until"
                  className="invoice-input"
                />
              )}
            </div>
          </div>

          {/* Items Section */}
          <div>
            <label className="text-sm opacity-70 mb-2 block">
              {documentType === "invoice" ? "Invoice Items" : "Quotation Items"}
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

          {/* Terms and Conditions (only for quotation) */}
          {documentType === "quotation" && (
            <div>
              <label className="text-sm opacity-70 mb-2 block">
                Terms and Conditions
              </label>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
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
          )}
        </div>

        {/* Right Panel - Preview */}
        <ScrollArea style={{ width: "100%", overflow: "auto" }}>
          <div ref={targetRef} style={previewContainerStyle}>
            {documentType === "invoice" ? (
              <InvoiceTemplate
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
            ) : (
              <QuotationTemplate
                clientName={clientName}
                clientAddress={clientAddress}
                refNo={refNo}
                quotationNo={quotationNo}
                date={date}
                validityPeriod={validityPeriod}
                items={items}
                terms={terms}
                contactNo={contactNo}
              />
            )}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}
