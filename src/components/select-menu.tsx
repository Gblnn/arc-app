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
}

export default function SelectMenu(props: Props) {
  return (
    <Select defaultValue={props.value} onValueChange={props.onChange}>
      <SelectTrigger
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "1rem",
        }}
        className=""
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
      <SelectContent style={{}}>
        <SelectGroup
          style={{
            display: "flex",
            justifyContent: "flex-start",
            flexFlow: "column",
          }}
        >
          <SelectItem
            style={{ display: "flex", justifyContent: "flex-start" }}
            value="admin"
          >
            Admin
          </SelectItem>

          <SelectItem
            style={{ display: "flex", justifyContent: "flex-start" }}
            value="profile"
          >
            Profile
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
