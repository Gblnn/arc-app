import { useState } from "react";

interface Props {
  status?: boolean;
  onStart?: any;
}

export default function Work(props: Props) {
  const [status, setStatus] = useState(props.status);
  return (
    <>
      <div
        style={{
          display: "flex",
          flexFlow: "column",
          gap: "0.5rem",
          border: "",

          justifyContent: "center",
          alignItems: "center",
          height: "72svh",
        }}
      >
        <div
          style={{
            display: "flex",
            border: status
              ? "4px solid crimson"
              : "4px solid rgba(100 100 100/ 40%)",
            borderRadius: "50%",
            padding: "0.5rem",
          }}
        >
          <button
            onClick={() => setStatus(!status)}
            style={{
              display: "flex",
              width: "14rem",
              height: "14rem",
              padding: "4rem",
              borderRadius: "50%",
              fontSize: "2.5rem",
              lineHeight: "2.5rem",
              background: !status ? "crimson" : "rgba(100 100 100/ 40%)",
            }}
          >
            {status ? "Stop" : "Start"}
          </button>
        </div>
      </div>
    </>
  );
}
