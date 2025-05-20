import converter from "number-to-words";

interface QuotationItem {
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
  quotationNo: string;
  items: QuotationItem[];
  validityPeriod: string;
  terms: string[];
  contactNo: string;
  unitTitle: string;
  letterhead?: string;
  subject: string;
}

interface PageProps extends Props {
  items: QuotationItem[];
  startIndex: number;
  isFirstPage: boolean;
  isLastPage: boolean;
  subtotal: number;
}

const QuotationPage = ({
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
      fontSize: "0.9rem",
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
          src={"/letter-head-logo.jpg.png"}
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
          <b>DATE : {props.date}</b>
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
        <p style={{ color: "black", fontSize: "1rem" }}>
          <b>QUOTATION</b>
        </p>
      </div>

      <div
        style={{
          padding: "1.5rem",
          paddingLeft: "2rem",
          paddingRight: "2rem",
          display: "flex",
          alignItems: "",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{ display: "flex", flexFlow: "column", fontSize: "0.9rem" }}
        >
          <p>TO</p>
          {props.clientName && (
            <p>
              <b>M/s {props.clientName}</b>
            </p>
          )}

          <p style={{ border: "", width: "20ch" }}>
            <b>{props.clientAddress}</b>
          </p>
          <p>
            <b>SULTANATE OF OMAN</b>
          </p>
        </div>

        <div style={{ fontSize: "0.9rem", marginRight: "2rem" }}>
          <p>
            <b>ARC#{props.refNo}</b>
          </p>
          <p>
            <b>Quotation No - </b> ARC/{props.quotationNo}
          </p>
          <p>
            <b>Valid Until: </b> {props.validityPeriod}
          </p>
        </div>
      </div>

      <div style={{ paddingLeft: "2rem", paddingRight: "2rem" }}>
        <div style={{ paddingBottom: "1rem" }}>
          <p>
            <b>Subject : </b> {props.subject}
          </p>
        </div>

        <table
          style={{
            width: "100%",
            border: "1px solid black",
          }}
        >
          <thead style={{ width: "100%" }}>
            <tr>
              <th
                style={{
                  border: "1px solid black",
                  padding: "",
                  fontWeight: "600",
                  width: "8%",
                  paddingBottom: "1rem",
                }}
              >
                S No.
              </th>
              <th
                style={{
                  border: "1px solid black",
                  padding: "",
                  paddingBottom: "1rem",
                  width: "60%",
                  fontWeight: "600",
                }}
              >
                Description
              </th>
              <th
                style={{
                  border: "1px solid black",
                  padding: "",
                  fontWeight: "600",
                  width: "10%",
                  paddingBottom: "1rem",
                }}
              >
                {(props.unitTitle || "Qty").toUpperCase()}
              </th>
              <th
                style={{
                  border: "1px solid black",
                  padding: "",
                  fontWeight: "600",
                  width: "10%",
                  paddingBottom: "1rem",
                }}
              >
                Rate
              </th>
              <th
                style={{
                  border: "1px solid black",
                  padding: "",
                  fontWeight: "600",
                  width: "15%",
                  paddingBottom: "1rem",
                }}
              >
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={startIndex + index}>
                <td
                  style={{
                    border: "1px solid black",
                    padding: "0.5rem",
                    paddingBottom: "1rem",
                  }}
                >
                  {startIndex + index + 1}
                </td>
                <td
                  style={{
                    border: "1px solid black",
                    padding: "0.5rem",
                    paddingBottom: "1rem",
                  }}
                >
                  {item.description}
                </td>
                <td
                  style={{
                    border: "1px solid black",
                    padding: "0.5rem",
                    paddingBottom: "1rem",
                  }}
                >
                  {item.unit}
                </td>
                <td
                  style={{
                    border: "1px solid black",
                    padding: "0.5rem",
                    paddingBottom: "1rem",
                  }}
                >
                  {item.amount.toFixed(3)}
                </td>
                <td
                  style={{
                    border: "1px solid black",
                    padding: "0.5rem",
                    paddingBottom: "1rem",
                  }}
                >
                  {(Number(item.unit) * item.amount).toFixed(3)}
                </td>
              </tr>
            ))}
          </tbody>
          {isLastPage && (
            <tfoot>
              <tr>
                <td
                  colSpan={4}
                  style={{
                    border: "1px solid black",
                    padding: "0.5rem",
                    textAlign: "left",
                    paddingBottom: "1rem",
                  }}
                >
                  TOTAL
                </td>

                <td
                  style={{
                    border: "1px solid black",
                    padding: "0.5rem",
                    paddingBottom: "1rem",
                  }}
                >
                  {props.subtotal.toFixed(3)}
                </td>
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
            }}
          >
            <p style={{ textTransform: "capitalize" }}>
              <b>
                Riyal Omani{" "}
                {(() => {
                  const wholePart = Math.floor(props.subtotal);
                  const decimalPart = Math.round(
                    (props.subtotal - wholePart) * 1000
                  );

                  let result = converter.toWords(String(wholePart));

                  if (decimalPart > 0) {
                    result += ` and ${converter.toWords(
                      String(decimalPart)
                    )} baiza`;
                  }

                  return result;
                })()}{" "}
                Only
              </b>
            </p>
          </div>

          <div style={{ padding: "2rem", fontSize: "0.9rem" }}>
            <p style={{ fontWeight: "bold", marginBottom: "1rem" }}>
              Terms and Conditions:
            </p>
            <ol style={{ listStyle: "none", paddingLeft: "1.5rem" }}>
              {props.terms.map((term, index) => (
                <li key={index} style={{ marginBottom: "  " }}>
                  <span style={{ marginRight: "0.75rem", fontSize: "1.25rem" }}>
                    •
                  </span>
                  {term}
                </li>
              ))}
            </ol>
          </div>

          <div
            style={{
              display: "flex",
              paddingTop: "0.5rem",
              paddingLeft: "2.5rem",
              paddingRight: "2.5rem",
              justifyContent: "flex-end",
            }}
          >
            <p>
              <b style={{ fontSize: "0.9rem" }}>
                Contact : {props.contactNo || "92849282"}
              </b>
            </p>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.9rem",
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
    (sum, item) => sum + Number(item.unit) * item.amount,
    0
  );

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
      <QuotationPage
        key={pageIndex}
        {...props}
        items={pageItems}
        startIndex={startIndex}
        isFirstPage={pageIndex === 0}
        isLastPage={pageIndex === totalPages - 1}
        subtotal={subtotal}
      />
    );
  });

  return <div>{pages}</div>;
}
