import { Download, PenLine, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  trigger?: any;
  onDelete?: any;
  onEdit?: any;
  onExtra?: any;
  className?: any;
  extraText?: string;
}

export default function DropDown(props: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={`${props.className} touch-manipulation`}
        style={{
          outline: "none",
          backdropFilter: "none",
          display: "flex",
          border: "",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: "50%",
        }}
      >
        {props.trigger}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="touch-manipulation"
        sideOffset={5}
        align="end"
      >
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={props.onEdit}
            className="touch-manipulation cursor-pointer"
          >
            <PenLine className="mr-2 h-4 w-4" />
            <span>Edit</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={props.onDelete}
            className="touch-manipulation cursor-pointer"
          >
            <X className="mr-2 h-4 w-4" />
            <span>Delete</span>
          </DropdownMenuItem>

          {props.onExtra && (
            <DropdownMenuItem
              onClick={props.onExtra}
              className="touch-manipulation cursor-pointer"
            >
              <Download className="mr-2 h-4 w-4" />
              <span>{props.extraText}</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
