import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "0.5rem",
        padding: "1rem",
      }}
    >
      <h1 style={{ fontSize: "1.5rem", color: "crimson" }}>
        Unauthorized Access
      </h1>
      <p style={{ opacity: 0.5, textAlign: "center", fontSize: "0.8rem" }}>
        Elevated previliges required.
      </p>

      <br />

      <Button
        variant={"ghost"}
        style={{
          fontSize: "0.9rem",
          fontWeight: "600",
          display: "flex",
          alignItems: "center",
          gap: "0.25rem",

          color: "",
        }}
        onClick={() => navigate(-1)}
      >
        {/* <ChevronLeft width={"1rem"} /> */}
        Return
      </Button>
    </motion.div>
  );
}
