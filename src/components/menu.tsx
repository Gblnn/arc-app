import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, UserCircle } from "lucide-react";

interface Props {
  title?: string;
  value?: string;
  onChange?: any;
  placeholder?: string;
  items?: any;
  addable?: boolean;
}

export default function Menu(props: Props) {
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

        <SelectValue placeholder={props.placeholder} />
      </SelectTrigger>
      <SelectContent style={{}}>
        <SelectGroup
          style={{
            display: "flex",
            justifyContent: "flex-start",
            flexFlow: "column",
          }}
        >
          {props.items.map((item: any) => (
            <SelectItem
              key={item}
              style={{ display: "flex", justifyContent: "flex-start" }}
              value={item ? item : "empty"}
            >
              {item}
            </SelectItem>
          ))}
          {props.addable && (
            <button style={{ justifyContent: "flex-start" }}>
              <Plus color="crimson" />
              Add
            </button>
          )}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
