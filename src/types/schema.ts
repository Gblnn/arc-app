// Worker Schema
interface Worker {
  id: string;
  name: string;
  company: string;
  contract: string;
  projectCode: string;
  supervisorEmail: string;
  lastHandoverDate?: Date;
  status: "active" | "inactive";
}

// Attendance Schema
interface Attendance {
  id: string;
  workerId: string;
  workerName: string;
  date: Date;
  projectCode: string;
  supervisorEmail: string;
  hours: number;
  status: "present" | "absent";
}

// Handover Schema (already implemented)
interface Handover {
  workerId: string;
  workerName: string;
  fromSupervisor: string;
  toSupervisor: string;
  fromProject: string;
  toProject: string;
  date: Date;
}
