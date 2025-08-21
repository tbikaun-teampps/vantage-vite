export interface Contact {
  id: string;
  fullname: string;
  email: string;
  title?: string;
}

export interface Role {
  id: string;
  shared_role_id: string;
  level: "executive" | "management" | "supervisor" | "professional" | "technician" | "operator" | "specialist" | "other";
  contacts: Contact[];
  direct_reports?: Role[];
}

export interface WorkGroup {
  id: string;
  name: string;
  code: string;
  description: string;
  contacts: Contact[];
  roles: Role[];
}

export interface AssetGroup {
  id: string;
  name: string;
  code: string;
  description: string;
  contacts: Contact[];
  work_groups: WorkGroup[];
}

export interface Site {
  id: string;
  name: string;
  code: string;
  description: string;
  lat: number;
  lng: number;
  contacts: Contact[];
  asset_groups: AssetGroup[];
}

export interface Region {
  id: string;
  name: string;
  code: string;
  description: string;
  contacts: Contact[];
  sites: Site[];
}

export interface BusinessUnit {
  id: string;
  name: string;
  code: string;
  description: string;
  contacts: Contact[];
  regions: Region[];
}

export interface Company {
  id: string;
  name: string;
  code: string;
  description: string;
  contacts: Contact[];
  business_units: BusinessUnit[];
}