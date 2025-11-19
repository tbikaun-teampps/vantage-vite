import type { paths } from ".";

export type GetCompaniesResponseData =
  paths["/companies"]["get"]["responses"][200]["content"]["application/json"]["data"];

export type GetCompanyByIdResponseData =
  paths["/companies/{companyId}"]["get"]["responses"][200]["content"]["application/json"]["data"];

export type UserCompanyRole = GetCompanyByIdResponseData["role"];

export type CreateCompanyBodyData =
  paths["/companies"]["post"]["requestBody"]["content"]["application/json"];

export type CreateCompanyResponseData =
  paths["/companies"]["post"]["responses"][200]["content"]["application/json"]["data"];

// TODO: investigate why this is any
export type UpdateCompanyBodyData =
  paths["/companies/{companyId}"]["put"]["requestBody"]["content"]["application/json"];

export type UpdateCompanyResponseData =
  paths["/companies/{companyId}"]["put"]["responses"][200]["content"]["application/json"]["data"];

export type GetCompanyTreeResponseData =
  paths["/companies/{companyId}/tree"]["get"]["responses"][200]["content"]["application/json"]["data"];

export type GetCompanyEntitiesParams =
  paths["/companies/{companyId}/entities"]["get"]["parameters"]["query"];

export type GetCompanyEntitiesResponseData =
  paths["/companies/{companyId}/entities"]["get"]["responses"][200]["content"]["application/json"]["data"];

export type CreateCompanyEntityParams =
  paths["/companies/{companyId}/entities"]["post"]["parameters"]["query"];

// TODO: investigate why this is any
export type CreateCompanyEntityBodyData =
  paths["/companies/{companyId}/entities"]["post"]["requestBody"]["content"]["application/json"];

export type CreateCompanyEntityResponseData =
  paths["/companies/{companyId}/entities"]["post"]["responses"][200]["content"]["application/json"]["data"];

export type UpdateCompanyEntityParams =
  paths["/companies/{companyId}/entities/{entityId}"]["put"]["parameters"]["query"];

// TODO: investigate why this is any
export type UpdateCompanyEntityBodyData =
  paths["/companies/{companyId}/entities/{entityId}"]["put"]["requestBody"]["content"]["application/json"];

export type UpdateCompanyEntityResponseData =
  paths["/companies/{companyId}/entities/{entityId}"]["put"]["responses"][200]["content"]["application/json"]["data"];

export type DeleteCompanyEntityParams =
  paths["/companies/{companyId}/entities/{entityId}"]["delete"]["parameters"]["query"];

// --- TEAM ---

export type GetTeamResponseData =
  paths["/companies/{companyId}/team"]["get"]["responses"][200]["content"]["application/json"]["data"];

export type AddTeamMemberBodyData =
  paths["/companies/{companyId}/team"]["post"]["requestBody"]["content"]["application/json"];

export type AddTeamMemberResponseData =
  paths["/companies/{companyId}/team"]["post"]["responses"][200]["content"]["application/json"]["data"];

export type UpdateTeamMemberBodyData =
  paths["/companies/{companyId}/team/{userId}"]["put"]["requestBody"]["content"]["application/json"];

export type UpdateTeamMemberResponseData =
  paths["/companies/{companyId}/team/{userId}"]["put"]["responses"][200]["content"]["application/json"]["data"];

// --- MISC ---

export type GetCompanyInterviewResponseActionsResponseData =
  paths["/companies/{companyId}/actions"]["get"]["responses"][200]["content"]["application/json"]["data"];

export type UploadCompanyIconResponseData =
  paths["/companies/{companyId}/icon"]["post"]["responses"][200]["content"]["application/json"]["data"];

export type UpdateCompanyBrandingBodyData =
  paths["/companies/{companyId}/branding"]["patch"]["requestBody"]["content"]["application/json"];

export type UpdateCompanyBrandingResponseData =
  paths["/companies/{companyId}/branding"]["patch"]["responses"][200]["content"]["application/json"]["data"];

export type CompanyImportResponseData =
  paths["/companies/{companyId}/import"]["post"]["responses"][200]["content"]["application/json"]["data"];

// --- CONTACTS ---

export type GetEntityContactsResponseData =
  paths["/companies/{companyId}/contacts/{entityType}/{entityId}"]["get"]["responses"][200]["content"]["application/json"]["data"];

export type LinkContactToEntityBodyData =
  paths["/companies/{companyId}/contacts/{entityType}/{entityId}"]["post"]["requestBody"]["content"]["application/json"];

export type LinkContactToEntityResponseData =
  paths["/companies/{companyId}/contacts/{entityType}/{entityId}"]["post"]["responses"][200]["content"]["application/json"]["data"];

// TODO: investigate why this is any
export type UpdateContactBodyData =
  paths["/companies/{companyId}/contacts/{contactId}"]["put"]["requestBody"]["content"]["application/json"];

export type UpdateContactResponseData =
  paths["/companies/{companyId}/contacts/{contactId}"]["put"]["responses"][200]["content"]["application/json"]["data"];

export type GetContactsByRoleResponseData =
  paths["/companies/{companyId}/contacts/roles/{roleId}"]["get"]["responses"][200]["content"]["application/json"]["data"];
