import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import moment from "moment";
import fontRegular from "../WEB/fonts/ClashGrotesk-Medium.ttf";
import fontBold from "../WEB/fonts/ClashGrotesk-Semibold.ttf";
import converter from "number-to-words";

interface Props {
  date?: any;
  clientName?: string;
  amount?: any;
}

// Create Document Component
export default function TaxInvoice(props: Props) {
  Font.register({
    family: "normal",
    fonts: [{ src: fontRegular }],
  });

  Font.register({
    family: "bold",
    fonts: [{ src: fontBold }],
  });

  // Create styles
  const styles = StyleSheet.create({
    page: {
      backgroundColor: "white",
    },
    section: {
      color: "black",
    },
  });
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View
          fixed
          style={{
            alignItems: "center",
            borderBottom: "5px solid crimson",

            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              marginBottom: "10",
              marginTop: "20",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Image
              style={{ width: "3.5rem" }}
              source={"/letter-head-logo.jpg.png"}
            />
            <Image
              style={{ width: "16rem" }}
              source={"/letter-head-header.jpg"}
            />
          </View>
        </View>

        <View style={{ justifyContent: "space-between" }}>
          <View
            style={{
              //   border: "1px solid green",
              margin: "30",
              fontSize: "0.6rem",
              //   height: "30cm",
            }}
          >
            <View style={{ border: "", alignItems: "flex-end" }}>
              <Text style={{ fontFamily: "bold", fontSize: "0.7rem" }}>
                DATE : {moment().format("DD.MM.YYYY")}
              </Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontSize: "0.75rem",
                  fontFamily: "bold",
                }}
              >
                TAX INVOICE
              </Text>
              <Text style={{ opacity: 0.75 }}>VATINOM110026180X</Text>
            </View>
            <View
              style={{
                marginTop: "20",
                border: "",
                justifyContent: "space-between",
                flexDirection: "row",
              }}
            >
              <View style={{ gap: "0.25rem" }}>
                <Text style={{ fontFamily: "bold" }}>TO</Text>
                <Text>P.O BOX - 667</Text>
                <Text>PC - 322, Falaj Al Qabail</Text>
                <Text>SULTANATE OF OMAN</Text>
                <Text>VATIN : OM1100104556</Text>
              </View>
              <View style={{ marginRight: "30" }}>
                <Text style={{ fontFamily: "bold" }}>ARC#</Text>
                <Text style={{ fontFamily: "" }}>Invoice No - ARC/</Text>
              </View>
            </View>
            <View style={{ border: "1px solid lightgrey", marginTop: "20" }}>
              <View
                style={{
                  height: "1.5rem",
                  border: "",
                  flexDirection: "row",
                }}
              >
                <View
                  style={{
                    flex: 0.5,
                    border: "1px solid lightgrey",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text>S No.</Text>
                </View>
                <View
                  style={{
                    flex: 4,
                    border: "1px solid lightgrey",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text>Description</Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    border: "1px solid lightgrey",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text>Unit</Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    border: "1px solid lightgrey",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text>Qty</Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    border: "1px solid lightgrey",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text>Amount</Text>
                </View>
              </View>

              {/* Table Iteration */}
              <View
                style={{
                  height: "1.5rem",
                  border: "",
                  flexDirection: "row",
                }}
              >
                <View
                  style={{ flex: 0.5, border: "1px solid lightgrey" }}
                ></View>
                <View style={{ flex: 4, border: "1px solid lightgrey" }}></View>
                <View style={{ flex: 1, border: "1px solid lightgrey" }}></View>
                <View style={{ flex: 1, border: "1px solid lightgrey" }}></View>
                <View style={{ flex: 1, border: "1px solid lightgrey" }}></View>
              </View>

              <View
                style={{
                  height: "1.5rem",
                  border: "",
                  flexDirection: "row",
                }}
              >
                {/* Table Iteration */}
                {/* <View
                  style={{ flex: 0.5, border: "1px solid lightgrey" }}
                ></View> */}
                <View
                  style={{
                    flex: 6.55,
                    border: "1px solid lightgrey",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{}}> Total Amount</Text>
                </View>
                <View style={{ flex: 1, border: "1px solid lightgrey" }}></View>
              </View>

              <View
                style={{
                  height: "1.5rem",
                  border: "",
                  flexDirection: "row",
                }}
              >
                {/* Table Iteration */}
                {/* <View
                  style={{ flex: 0.5, border: "1px solid lightgrey" }}
                ></View> */}
                <View
                  style={{
                    flex: 6.55,
                    border: "1px solid lightgrey",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{}}> {"VAT(5%)"}</Text>
                </View>
                <View style={{ flex: 1, border: "1px solid lightgrey" }}></View>
              </View>
              <View
                style={{
                  height: "1.5rem",
                  border: "",
                  flexDirection: "row",
                }}
              >
                {/* Table Iteration */}
                {/* <View
                  style={{ flex: 0.5, border: "1px solid lightgrey" }}
                ></View> */}
                <View
                  style={{
                    flex: 6.55,
                    border: "1px solid lightgrey",
                    justifyContent: "center",

                    textAlign: "left",
                  }}
                >
                  <Text style={{}}> NET PAYABLE</Text>
                </View>
                <View style={{ flex: 1, border: "1px solid lightgrey" }}></View>
              </View>
            </View>

            <View
              style={{
                marginTop: 20,
                justifyContent: "space-between",
                flexDirection: "row",
              }}
            >
              <Text style={{ fontFamily: "bold", textTransform: "capitalize" }}>
                Riyal Omani {converter.toWords(String(props.amount))} Only
              </Text>
              <Text style={{ fontFamily: "bold" }}>Contact : 92849282</Text>
            </View>

            <View
              style={{
                marginTop: 40,
                justifyContent: "space-between",
                flexDirection: "row",
              }}
            >
              <Text style={{ textTransform: "capitalize" }}>prepared by</Text>
              <Text style={{ textTransform: "capitalize" }}>checked by</Text>
              <Text style={{ textTransform: "capitalize" }}>approved by</Text>
            </View>
          </View>
        </View>
        <View></View>
        <View
          style={{
            height: "2rem",
            borderTop: "4px solid crimson",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            gap: "0.75rem",
            color: "darkred",
            bottom: 0,
            width: "100%",
            marginBottom: "40",
            position: "absolute",
          }}
          fixed
        >
          <Text
            style={{
              fontSize: "0.65rem",
              marginTop: "10",
              fontFamily: "normal",
              letterSpacing: "0.05rem",
            }}
          >
            CR No. 1388060 | P.O BOX 427 | PC 311 | Sohar | Sultanate of Oman
          </Text>
          <Text style={{ fontSize: "0.65rem", fontFamily: "normal" }}>
            GSM : +968 92822305, +968 92849282 | Email : marketing@arcen.net
          </Text>
        </View>
      </Page>
    </Document>
  );
}
