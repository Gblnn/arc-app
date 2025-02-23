import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserCircle } from "lucide-react";

interface Props {
  title?: string;
  value?: any;
  onChange?: any;
  style?: React.CSSProperties;
}

export default function SelectMenu(props: Props) {
  return (
    <Select defaultValue={props.value} onValueChange={props.onChange}>
      <SelectTrigger
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "1rem",
          touchAction: "manipulation",
          WebkitTapHighlightColor: "transparent",
          cursor: "pointer",
        }}
        className="select-none"
      >
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <UserCircle color="crimson" width={"1.25rem"} />
          <p
            style={{
              fontSize: "0.65rem",
              position: "absolute",
              marginLeft: "2rem ",
              opacity: "0.5",
              textTransform: "uppercase",
              fontWeight: "600",
            }}
          >
            {props.title}
          </p>
        </div>

        <SelectValue placeholder="Role" />
      </SelectTrigger>
      <SelectContent
        style={{
          touchAction: "manipulation",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <SelectGroup
          style={{
            display: "flex",
            justifyContent: "flex-start",
            flexFlow: "column",
            touchAction: "manipulation",
          }}
        >
          <SelectItem
            style={{
              display: "flex",
              justifyContent: "flex-start",
              touchAction: "manipulation",
              cursor: "pointer",
              userSelect: "none",
            }}
            value="admin"
          >
            Admin
          </SelectItem>

          <SelectItem
            style={{
              display: "flex",
              justifyContent: "flex-start",
              touchAction: "manipulation",
              cursor: "pointer",
              userSelect: "none",
            }}
            value="profile"
          >
            Profile
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
