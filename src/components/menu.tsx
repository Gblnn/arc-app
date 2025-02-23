import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, UserCircle } from "lucide-react";

interface MenuItem {
  id: string;
  value: string;
}

interface MenuProps {
  title?: string;
  value?: string;
  onChange?: any;
  placeholder?: string;
  items: MenuItem[];
  addable?: boolean;
}

export default function Menu({
  title,
  value,
  onChange,
  placeholder,
  items,
  addable,
}: MenuProps) {
  return (
    <Select defaultValue={value} onValueChange={onChange}>
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
            {title}
          </p>
        </div>

        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent style={{}}>
        <SelectGroup
          style={{
            display: "flex",
            justifyContent: "flex-start",
            flexFlow: "column",
          }}
        >
          {items.map((item) => (
            <SelectItem
              key={item.id}
              style={{ display: "flex", justifyContent: "flex-start" }}
              value={item.value}
            >
              {item.value}
            </SelectItem>
          ))}
          {addable && (
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
