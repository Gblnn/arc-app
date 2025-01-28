import { motion } from "framer-motion";
import converter from "number-to-words";

interface Props {
  date?: any;
  clientName?: string;
  refNo?: string;
  invoiceNo?: string;
  amount?: number;
}

export default function Template1(props: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
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
        border: "",
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
            <b style={{}}>TAX INVOICE</b>
          </p>
          <p>VATINOM110026180X</p>
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
          <div
            style={{ display: "flex", flexFlow: "column", fontSize: "1rem" }}
          >
            <p>TO</p>
            <p>
              <b>{props.clientName}</b>
            </p>
            <p>
              <b>P.O.BOX - 667</b>
            </p>
            <p>
              <b>PC - 322, Falaj Al Qabail</b>
            </p>
            <p>
              <b>SULTANATE OF OMAN</b>
            </p>
            <p>
              <b>VATIN : OM1100104556</b>
            </p>
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
              <tr>
                <td>1</td>
                <td>JCB HIRED{" (SOHAR FREEZONE)"} Daily</td>
                <td></td>
                <td></td>
                <td>{props.amount}.000</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2} style={{ textAlign: "left" }}>
                  TOTAL
                </td>
                <td></td>
                <td></td>
                <td>{props.amount}.000</td>
              </tr>
              <tr>
                <td colSpan={2} style={{ textAlign: "left" }}>
                  {"VAT(5%)"}
                </td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td colSpan={2}>NET PAYABLE</td>
              </tr>
            </tfoot>
          </table>
        </div>
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
            <b>Riyal Omani {converter.toWords(String(props.amount))} Only</b>
          </p>
          <p>
            <b>Contact : 92849282</b>
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
    </motion.div>
  );
}
