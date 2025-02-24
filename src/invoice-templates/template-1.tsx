import { motion } from "framer-motion";
import converter from "number-to-words";

interface InvoiceItem {
  description: string;
  unit: string;
  quantity: number;
  amount: number;
}

interface Props {
  date: string;
  clientName: string;
  clientAddress: string;
  refNo: string;
  invoiceNo: string;
  items: InvoiceItem[];
  amount: number;
  isTaxInvoice: boolean;
  vatinNo: string;
  contactNo: string;
}

interface PageProps {
  items: InvoiceItem[];
  startIndex: number;
  isFirstPage: boolean;
  isLastPage: boolean;
  date: string;
  clientName: string;
  clientAddress: string;
  refNo: string;
  invoiceNo: string;
  amount: number;
  isTaxInvoice: boolean;
  vatinNo: string;
  contactNo: string;
  subtotal: number;
  vatAmount: number;
  netPayable: number;
}

const InvoicePage = ({
  items,
  startIndex,
  isFirstPage,
  isLastPage,
  ...props
}: PageProps) => (
  <div
    style={{
      display: "flex",
      flexFlow: "column",
      justifyContent: "space-between",
      background: "white",
      color: "black",
      padding: "",
      fontSize: "1.1rem",
      width: "21cm",
      height: "29.7cm",
      pageBreakAfter: "always",
    }}
  >
    <div style={{ border: "" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "1rem",
          padding: "1rem",
          alignItems: "center",
        }}
      >
        <img
          src="/letter-head-logo.jpg.png"
          style={{ width: "5.5rem", height: "5rem" }}
        />
        <img src="/letter-head-header.jpg" />
      </div>
      <hr style={{ color: "crimson", border: "4px solid" }} />

      <div
        style={{
          paddingTop: "2rem",
          paddingLeft: "2rem",
          paddingRight: "2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        <p style={{ color: "black", fontSize: "1rem" }}>
          <b style={{}}>DATE : {props.date}</b>
        </p>
      </div>
      <div
        style={{
          padding: "",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexFlow: "column",
        }}
      >
        <p style={{ color: "black" }}>
          <b style={{}}>
            {props.isTaxInvoice ? "TAX INVOICE" : "CASH INVOICE"}
          </b>
        </p>
        {props.isTaxInvoice && <p>VATINOM110026180X</p>}
      </div>

      <div
        style={{
          padding: "1.5rem",
          paddingLeft: "2rem",
          paddingRight: "2rem",
          display: "flex",
          alignItems: "",
          justifyContent: "space-between",
          flexFlow: "",
        }}
      >
        <div style={{ display: "flex", flexFlow: "column", fontSize: "1rem" }}>
          <p>TO</p>
          <p>
            <b>{props.clientName}</b>
          </p>
          <p style={{ border: "", width: "20ch" }}>
            <b>{props.clientAddress}</b>
          </p>
          <p>
            <b>SULTANATE OF OMAN</b>
          </p>
          {props.vatinNo && (
            <p>
              <b>VATIN : {props.vatinNo}</b>
            </p>
          )}
        </div>

        <div style={{ fontSize: "1rem", marginRight: "2rem" }}>
          <p>
            <b>ARC#{props.refNo}</b>
          </p>
          <p>Invoice No - ARC/{props.invoiceNo}</p>
        </div>
      </div>

      <div style={{ paddingLeft: "2rem", paddingRight: "2rem" }}>
        <table style={{ width: "100%", border: "" }}>
          <thead>
            <tr>
              <td style={{ width: "5%" }}>S.no</td>
              <td style={{ width: "60%" }}>Description</td>
              <td>Unit</td>
              <td>Qty</td>
              <td>Amount</td>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={startIndex + index}>
                <td>{startIndex + index + 1}</td>
                <td>{item.description}</td>
                <td>{item.unit}</td>
                <td>{item.quantity}</td>
                <td>{item.amount * item.quantity}</td>
              </tr>
            ))}
          </tbody>
          {isLastPage && (
            <tfoot>
              <tr>
                <td colSpan={2} style={{ textAlign: "left" }}>
                  TOTAL
                </td>
                <td></td>
                <td></td>
                <td>{props.subtotal.toFixed(3)}</td>
              </tr>
              {props.isTaxInvoice && (
                <tr>
                  <td colSpan={2} style={{ textAlign: "left" }}>
                    {"VAT(5%)"}
                  </td>
                  <td></td>
                  <td></td>
                  <td>{props.vatAmount.toFixed(3)}</td>
                </tr>
              )}
              <tr>
                <td colSpan={2}>NET PAYABLE</td>
                <td></td>
                <td></td>
                <td>{props.netPayable.toFixed(3)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      {isLastPage && (
        <>
          <div
            style={{
              display: "flex",
              paddingTop: "1rem",
              paddingLeft: "2.5rem",
              paddingRight: "2.5rem",
              justifyContent: "space-between",
            }}
          >
            <p style={{ textTransform: "capitalize" }}>
              <b>
                Riyal Omani{" "}
                {converter.toWords(String(Math.floor(props.netPayable)))} Only
              </b>
            </p>
            <p>
              <b>Contact : {props.contactNo || "92849282"}</b>
            </p>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "1rem",
              padding: "3rem",
            }}
          >
            <p>Prepared By</p>
            <p>Checked By</p>
            <p>Approved By</p>
          </div>
        </>
      )}
    </div>

    <div
      style={{
        border: "",
        height: "",
        width: "100%",
        display: "flex",
        flexFlow: "column",
        padding: "",
        justifyContent: "flex-end",
      }}
    >
      <div
        style={{
          borderTop: "5px solid crimson",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "1rem",
          paddingTop: "1rem",
          paddingBottom: "1rem",
          wordSpacing: "0.25rem",
          textAlign: "center",
          color: "darkred",
          fontWeight: "500",
        }}
      >
        <p>
          CR No. 1388060 | P.O BOX 427 | PC 311 | Sohar | Sultanate of Oman
          <br />
          GSM : +968 92822305, +968 92849282 | Email : marketing@arcen.net
        </p>
      </div>
    </div>
  </div>
);

export default function Template1(props: Props) {
  // Calculate totals
  const subtotal = props.items.reduce(
    (sum, item) => sum + item.quantity * item.amount,
    0
  );
  const vatAmount = props.isTaxInvoice ? subtotal * 0.05 : 0;
  const netPayable = subtotal + vatAmount;

  // Calculate items per page
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(props.items.length / ITEMS_PER_PAGE);

  // Create pages array
  const pages = Array.from({ length: totalPages }, (_, pageIndex) => {
    const startIndex = pageIndex * ITEMS_PER_PAGE;
    const pageItems = props.items.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );

    return (
      <InvoicePage
        key={pageIndex}
        {...props}
        items={pageItems}
        startIndex={startIndex}
        isFirstPage={pageIndex === 0}
        isLastPage={pageIndex === totalPages - 1}
        subtotal={subtotal}
        vatAmount={vatAmount}
        netPayable={netPayable}
      />
    );
  });

  return (
    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
      {pages}
    </motion.div>
  );
}
