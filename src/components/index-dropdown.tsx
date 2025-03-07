import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import {
  LoaderCircle,
  LogOut,
  RadioTower,
  RefreshCcw,
  User,
} from "lucide-react";
import LazyLoader from "./lazy-loader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "./ui/dropdown-menu";

interface Props {
  trigger?: any;
  onExport?: any;
  onAccess?: any;
  onArchives?: any;
  onUpload?: any;
  onInbox?: any;
  className?: any;
  onLogout?: any;
  onProfile?: any;
  name?: any;
  allocated_hours?: any;
  isOnline?: boolean;
}

export default function IndexDropDown(props: Props) {
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          // disabled={props.isOnline}
          className={props.className}
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
          {props.name ? (
            <LazyLoader background="rgba(100 100 100/ 0%)" name={props.name} />
          ) : !props.isOnline ? (
            <RadioTower style={{ opacity: 0.5 }} />
          ) : (
            <LoaderCircle
              className="animate-spin"
              style={{ margin: "0.14rem" }}
            />
          )}
        </DropdownMenuTrigger>

        <DropdownMenuContent
          style={{ margin: "0.25rem", marginRight: "1.25rem", width: "15rem" }}
        >
          <DropdownMenuGroup>
            {/* <DropdownMenuItem
              onClick={props.onExport}
              style={{ width: "100%" }}
            >
              <DownloadCloud className="mr-2" color="lightgreen" />
              <span style={{ width: "100%" }}>Export xlsx</span>
            </DropdownMenuItem> */}

            {/* <DropdownMenuItem
              onClick={props.onUpload}
              style={{ width: "100%" }}
            >
              <UploadCloud className="mr-2" color="salmon" />
              <span style={{ width: "100%" }}>Upload xlsx</span>
            </DropdownMenuItem> */}

            {/* <DropdownMenuItem
              onClick={props.onAccess}
              style={{ width: "100%" }}
            >
              <KeyRound className="mr-2 " color="dodgerblue" />
              <span style={{ width: "100%" }}>Access Control</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={props.onArchives}
              style={{ width: "100%" }}
            >
              <Archive className="mr-2 " color="goldenrod" />
              <span style={{ width: "100%" }}>Archives</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={props.onInbox} style={{ width: "100%" }}>
              <Inbox className="mr-2 " color="crimson" />
              <span style={{ width: "100%" }}>Inbox</span>
            </DropdownMenuItem> */}
            <DropdownMenuItem
              onClick={() => {}}
              style={{
                width: "100%",
                display: "",
                border: "",
                justifyContent: "",
                flexFlow: "",
                paddingTop: "1rem",
                paddingBottom: "1rem",
              }}
            >
              <div
                style={{
                  border: "",
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <LazyLoader
                  gradient
                  fontSize="1.25rem"
                  height="3rem"
                  width="3rem"
                  name={window.name}
                />
                <div style={{ border: "" }}>
                  <p
                    style={{
                      border: "",
                      fontSize: "1.05rem",
                      fontWeight: "600",
                    }}
                  >
                    {props.name?.split(" ")[0]}
                  </p>
                  <p
                    style={{
                      fontSize: "0.65rem",
                      opacity: "0.75",
                      fontWeight: 800,
                      color: "dodgerblue",
                    }}
                  >
                    {window.name}
                  </p>
                  {props.allocated_hours && (
                    <p
                      style={{
                        fontSize: "0.7rem",
                        background: "rgba(100 100 100/ 20%)",
                        paddingLeft: "0.5rem",
                        paddingRight: "0.5rem",
                        borderRadius: "0.5rem",
                      }}
                    >
                      <b>Allocated Hours</b> {props.allocated_hours}
                    </p>
                  )}
                </div>
              </div>
            </DropdownMenuItem>

            <hr style={{ marginTop: "0.25rem", marginBottom: "0.25rem" }} />

            <DropdownMenuItem
              onClick={() => window.location.reload()}
              style={{ width: "100%" }}
            >
              <RefreshCcw className="mr-2 " color="dodgerblue" />
              <span style={{ width: "100%" }}>Force Reload</span>
            </DropdownMenuItem>

            {props.onProfile && (
              <DropdownMenuItem onClick={props.onProfile}>
                <User className="mr-2" color="dodgerblue" />
                <span style={{ width: "100%" }}>Profile</span>
              </DropdownMenuItem>
            )}

            <DropdownMenuItem
              onClick={props.onLogout}
              style={{ width: "100%" }}
            >
              <LogOut className="mr-2 " color="salmon" />
              <span style={{ width: "100%" }}>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
