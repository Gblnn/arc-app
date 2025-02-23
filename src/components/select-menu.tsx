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
          ...props.style,
        }}
        className="select-none touch-manipulation"
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
        className="touch-manipulation"
        style={{
          touchAction: "manipulation",
          WebkitTapHighlightColor: "transparent",
          userSelect: "none",
          cursor: "pointer",
        }}
        position="popper"
        sideOffset={5}
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
            className="touch-manipulation"
            style={{
              display: "flex",
              justifyContent: "flex-start",
              touchAction: "manipulation",
              cursor: "pointer",
              userSelect: "none",
              padding: "12px 16px",
            }}
            value="admin"
          >
            Admin
          </SelectItem>

          <SelectItem
            className="touch-manipulation"
            style={{
              display: "flex",
              justifyContent: "flex-start",
              touchAction: "manipulation",
              cursor: "pointer",
              userSelect: "none",
              padding: "12px 16px",
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
