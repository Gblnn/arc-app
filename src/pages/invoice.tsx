import Back from "@/components/back";
import TaxInvoice from "@/invoice-templates/tax-invoice";
import Template1 from "@/invoice-templates/template-1";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import { DownloadCloud } from "lucide-react";
import moment from "moment";
import { usePDF } from "react-to-pdf";

export default function Invoice() {
  const { toPDF, targetRef } = usePDF({
    filename: "page.pdf",
    page: { margin: 5 },
  });
  return (
    <div
      style={{
        display: "flex",
        flexFlow: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        className=""
        style={{
          width: "100%",
          border: "",
          padding: "1.25rem",
          paddingBottom: "1rem",
          position: "sticky",
          top: 0,
          zIndex: 1,
          background: "rgba(60 60 60/ 75%)",
          // borderBottom: "1px solid rgba(100 100 100/ 40%)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <Back
          title={"Invoicer"}
          noblur
          // subtitle={records.length}
          extra={
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <button onClick={() => toPDF()}>
                <DownloadCloud color="dodgerblue" />
              </button>
              <button>
                <PDFDownloadLink
                  document={
                    <TaxInvoice
                      amount={65}
                      date={moment().format("DD.MM.YYYY")}
                      clientName="ABC"
                    />
                  }
                  fileName="example.pdf"
                ></PDFDownloadLink>
              </button>
            </div>
          }
        />
      </div>

      {/* <br /> */}
      <PDFViewer style={{ width: "100%", height: "100svh" }}>
        <TaxInvoice amount={65} />
      </PDFViewer>

      <div ref={targetRef} style={{}}>
        <Template1
          clientName="M/s SAMA NEBRAS"
          amount={65}
          date={moment().format("DD.MM.YYYY")}
        />
      </div>

      <br />
    </div>
  );
}
