import React, { useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconBuilding,
  IconWorld,
  IconMapPin,
  IconBuildingFactory2,
  IconCube,
  IconUser,
  IconUsersGroup,
} from "@tabler/icons-react";
import {
  companySchema,
  businessUnitSchema,
  regionSchema,
  siteSchema,
  assetGroupSchema,
  workGroupSchema,
  roleSchema,
  type CompanyFormData,
  type BusinessUnitFormData,
  type RegionFormData,
  type SiteFormData,
  type AssetGroupFormData,
  type WorkGroupFormData,
  type RoleFormData,
} from "../schemas";
import { FormInput, FormSelect, FormLocationMap } from "./form-fields";
import { RoleSelector } from "./role-selector";
import { ContactCRUD } from "./contact-crud";
import { FormHeader } from "../shared/form-header";
import { FormSection } from "../shared/form-section";
import { FormActions } from "../shared/form-actions";
import { EntityBadges } from "../shared/entity-badges";
import { LEVELS } from "@/lib/library/roles";

interface BaseFormProps<TFormData = any> {
  selectedItem: any;
  setSelectedItem: (item: any) => void;
  onSave: (data: TFormData) => void;
  onDelete?: () => void;
}

// Company Form
export const RHFCompanyForm: React.FC<BaseFormProps<CompanyFormData>> = ({
  selectedItem,
  setSelectedItem,
  onSave,
  onDelete,
}) => {
  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      id: selectedItem?.id,
      name: selectedItem?.name || "",
      code: selectedItem?.code || "",
      description: selectedItem?.description || "",
    },
  });

  useEffect(() => {
    if (selectedItem) {
      form.reset({
        id: selectedItem.id,
        name: selectedItem.name || "",
        code: selectedItem.code || "",
        description: selectedItem.description || "",
      });
    }
  }, [selectedItem?.id, form]);

  const handleSave = async (data: CompanyFormData) => {
    onSave(data);
    form.reset(data);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="sticky top-0 bg-background z-10">
        <FormHeader
          icon={IconBuilding}
          iconColor="bg-blue-100 text-blue-600"
          title="Company Settings"
          description="Manage company information and organisational structure"
          actions={
            <FormActions
              selectedItem={selectedItem}
              itemType="company"
              onSave={form.handleSubmit(handleSave)}
              onDelete={onDelete}
              onClearSelection={() => setSelectedItem(null)}
              compact={true}
              isDirty={form.formState.isDirty}
            />
          }
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        <form
          onSubmit={form.handleSubmit(handleSave)}
          className="p-6 pt-4 space-y-8"
        >
          <div className="space-y-6">
            <FormSection title="Basic Information">
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-2 gap-6">
                  <FormInput
                    control={form.control}
                    name="name"
                    label="Company Name"
                    placeholder="Enter the name of the company"
                  />
                  <FormInput
                    control={form.control}
                    name="code"
                    label="Company Code"
                    placeholder="Enter a unique code for the company"
                  />
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <FormInput
                    control={form.control}
                    name="description"
                    label="Description"
                    placeholder="Enter a brief description of the company"
                  />
                </div>
              </div>
            </FormSection>

            <FormSection title="Contacts">
              <ContactCRUD
                entityType="company"
                entityId={selectedItem?.id}
                companyId={selectedItem?.id}
              />
            </FormSection>

            <FormSection title="Business Units">
              <EntityBadges
                entities={selectedItem?.business_units || []}
                icon={IconWorld}
                parentItem={selectedItem}
                parentType="company"
                addType="business_unit"
                onAddSuccess={() => console.log("Business unit added!")}
              />
            </FormSection>
          </div>
        </form>
      </div>
    </div>
  );
};

// Business Unit Form
export const RHFBusinessUnitForm: React.FC<
  BaseFormProps<BusinessUnitFormData>
> = ({ selectedItem, setSelectedItem, onSave, onDelete }) => {
  const form = useForm<BusinessUnitFormData>({
    resolver: zodResolver(businessUnitSchema),
    defaultValues: {
      id: selectedItem?.id,
      code: selectedItem.code || "",
      name: selectedItem?.name || "",
      description: selectedItem?.description || "",
    },
  });

  useEffect(() => {
    if (selectedItem) {
      form.reset({
        id: selectedItem.id,
        code: selectedItem.code || "",
        name: selectedItem.name || "",
        description: selectedItem.description || "",
      });
    }
  }, [selectedItem?.id, form]);

  const handleSave = async (data: BusinessUnitFormData) => {
    onSave(data);
    form.reset(data);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="sticky top-0 bg-background z-10">
        <FormHeader
          icon={IconWorld}
          iconColor="bg-emerald-100 text-emerald-600"
          title="Business Unit Configuration"
          description="Manage business unit details and regional organization"
          actions={
            <FormActions
              selectedItem={selectedItem}
              itemType="business_unit"
              onSave={form.handleSubmit(handleSave)}
              onDelete={onDelete}
              onClearSelection={() => setSelectedItem(null)}
              compact={true}
              isDirty={form.formState.isDirty}
            />
          }
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        <form
          onSubmit={form.handleSubmit(handleSave)}
          className="p-6 pt-4 space-y-8"
        >
          <div className="space-y-6">
            <FormSection title="Business Unit Information">
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-2 gap-6">
                  <FormInput
                    control={form.control}
                    name="name"
                    label="Business Unit Name"
                  />
                  <FormInput
                    control={form.control}
                    name="code"
                    label="Business Unit Code"
                    placeholder="Business unit code"
                  />
                </div>
                <FormInput
                  control={form.control}
                  name="description"
                  label="Description"
                  placeholder="Business unit description and scope"
                />
              </div>
            </FormSection>

            <FormSection title="Contacts">
              <ContactCRUD
                entityType="business_unit"
                entityId={selectedItem?.id}
                companyId={selectedItem?.companyId}
              />
            </FormSection>

            <FormSection title="Regions">
              <EntityBadges
                entities={selectedItem?.regions || []}
                icon={IconMapPin}
                parentItem={selectedItem}
                parentType="business_unit"
                addType="region"
                onAddSuccess={() => console.log("Region added!")}
              />
            </FormSection>
          </div>
        </form>
      </div>
    </div>
  );
};

// Region Form
export const RHFRegionForm: React.FC<BaseFormProps<RegionFormData>> = ({
  selectedItem,
  setSelectedItem,
  onSave,
  onDelete,
}) => {
  const form = useForm<RegionFormData>({
    resolver: zodResolver(regionSchema),
    defaultValues: {
      id: selectedItem?.id,
      name: selectedItem?.name || "",
      description: selectedItem?.description || "",
      code: selectedItem?.code || "",
    },
  });

  useEffect(() => {
    if (selectedItem) {
      form.reset({
        id: selectedItem.id,
        name: selectedItem.name || "",
        description: selectedItem.description || "",
        code: selectedItem?.code || "",
      });
    }
  }, [selectedItem?.id, form]);

  const handleSave = async (data: RegionFormData) => {
    onSave(data);
    form.reset(data);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="sticky top-0 bg-background z-10">
        <FormHeader
          icon={IconMapPin}
          iconColor="bg-orange-100 text-orange-600"
          title="Region Configuration"
          description="Manage regional settings and organisational structure"
          actions={
            <FormActions
              selectedItem={selectedItem}
              itemType="region"
              onSave={form.handleSubmit(handleSave)}
              onDelete={onDelete}
              onClearSelection={() => setSelectedItem(null)}
              compact={true}
              isDirty={form.formState.isDirty}
            />
          }
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        <form
          onSubmit={form.handleSubmit(handleSave)}
          className="p-6 pt-4 space-y-8"
        >
          <div className="space-y-6">
            <FormSection title="Region Information">
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-2 gap-6">
                  <FormInput
                    control={form.control}
                    name="name"
                    label="Region Name"
                  />
                  <FormInput
                    control={form.control}
                    name="code"
                    label="Region Code"
                    placeholder="Region code"
                  />
                </div>
                <FormInput
                  control={form.control}
                  name="description"
                  label="Description"
                  placeholder="Region description and scope"
                />
              </div>
            </FormSection>

            <FormSection title="Contacts">
              <ContactCRUD
                entityType="region"
                entityId={selectedItem?.id}
                companyId={selectedItem?.company_id}
              />
            </FormSection>

            <FormSection title="Sites">
              <EntityBadges
                entities={selectedItem?.sites || []}
                icon={IconBuildingFactory2}
                parentItem={selectedItem}
                parentType="region"
                addType="site"
                onAddSuccess={() => console.log("Site added!")}
              />
            </FormSection>
          </div>
        </form>
      </div>
    </div>
  );
};

// Site Form
export const RHFSiteForm: React.FC<BaseFormProps<SiteFormData>> = ({
  selectedItem,
  setSelectedItem,
  onSave,
  onDelete,
}) => {
  const form = useForm<SiteFormData>({
    resolver: zodResolver(siteSchema),
    defaultValues: {
      id: selectedItem?.id,
      name: selectedItem?.name || "",
      description: selectedItem?.description || "",
      lat: selectedItem?.lat || undefined,
      lng: selectedItem?.lng || undefined,
      code: selectedItem?.code || "",
    },
  });

  useEffect(() => {
    if (selectedItem) {
      form.reset({
        id: selectedItem.id,
        name: selectedItem.name || "",
        description: selectedItem.description || "",
        lat: selectedItem.lat || undefined,
        lng: selectedItem.lng || undefined,
        code: selectedItem?.code || "",
      });
    }
  }, [selectedItem?.id, form]);

  const handleSave = useCallback(
    async (data: SiteFormData) => {
      onSave(data);
      form.reset(data);
    },
    [onSave, form]
  );

  return (
    <div className="h-full flex flex-col">
      <div className="sticky top-0 bg-background z-10">
        <FormHeader
          icon={IconBuildingFactory2}
          iconColor="bg-purple-100 text-purple-600"
          title="Site Configuration"
          description="Manage site details and asset groups"
          actions={
            <FormActions
              selectedItem={selectedItem}
              itemType="site"
              onSave={form.handleSubmit(handleSave)}
              onDelete={onDelete}
              onClearSelection={() => setSelectedItem(null)}
              compact={true}
              isDirty={form.formState.isDirty}
            />
          }
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        <form
          onSubmit={form.handleSubmit(handleSave)}
          className="p-6 pt-4 space-y-8"
        >
          <div className="space-y-6">
            <FormSection title="Site Information">
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-2 gap-6">
                  <FormInput
                    control={form.control}
                    name="name"
                    label="Site Name"
                  />
                  <FormInput
                    control={form.control}
                    name="code"
                    label="Site Code"
                    placeholder="Site code"
                  />
                </div>
                <FormInput
                  control={form.control}
                  name="description"
                  label="Description"
                  placeholder="Site description and purpose"
                />
              </div>
            </FormSection>

            <FormSection title="Contacts">
              <ContactCRUD
                entityType="site"
                entityId={selectedItem?.id}
                companyId={selectedItem?.company_id}
              />
            </FormSection>

            <FormSection title="Location Coordinates">
              <FormLocationMap
                control={form.control}
                latName="lat"
                lngName="lng"
                label="Site Location"
                height="400px"
                siteName={selectedItem?.name || "Site"}
              />
            </FormSection>

            <FormSection title="Asset Groups / Processes">
              <EntityBadges
                entities={selectedItem?.asset_groups || []}
                icon={IconCube}
                parentItem={selectedItem}
                parentType="site"
                addType="asset_group"
                onAddSuccess={() => console.log("Asset group added!")}
              />
            </FormSection>
          </div>
        </form>
      </div>
    </div>
  );
};

// Asset Group Form
export const RHFAssetGroupForm: React.FC<BaseFormProps<AssetGroupFormData>> = ({
  selectedItem,
  setSelectedItem,
  onSave,
  onDelete,
}) => {
  const form = useForm<AssetGroupFormData>({
    resolver: zodResolver(assetGroupSchema),
    defaultValues: {
      id: selectedItem?.id,
      name: selectedItem?.name || "",
      description: selectedItem?.description || "",
      code: selectedItem?.code || "",
    },
  });

  useEffect(() => {
    if (selectedItem) {
      form.reset({
        id: selectedItem.id,
        name: selectedItem.name || "",
        description: selectedItem.description || "",
        code: selectedItem?.code || "",
      });
    }
  }, [selectedItem?.id, form]);

  const handleSave = async (data: AssetGroupFormData) => {
    onSave(data);
    form.reset(data);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="sticky top-0 bg-background z-10">
        <FormHeader
          icon={IconCube}
          iconColor="bg-amber-100 text-amber-600"
          title="Asset Group Configuration"
          description="Manage asset group settings and properties"
          actions={
            <FormActions
              selectedItem={selectedItem}
              itemType="asset_group"
              onSave={form.handleSubmit(handleSave)}
              onDelete={onDelete}
              onClearSelection={() => setSelectedItem(null)}
              compact={true}
              isDirty={form.formState.isDirty}
            />
          }
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        <form
          onSubmit={form.handleSubmit(handleSave)}
          className="p-6 pt-4 space-y-8"
        >
          <div className="space-y-6">
            <FormSection title="Asset Group Information">
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-2 gap-6">
                  <FormInput
                    control={form.control}
                    name="name"
                    label="Asset Group Name"
                  />
                  <FormInput
                    control={form.control}
                    name="code"
                    label="Asset Group Code"
                    placeholder="Asset Group code"
                  />
                </div>
                <FormInput
                  control={form.control}
                  name="description"
                  label="Description"
                  placeholder="Asset group description and purpose"
                />
              </div>
            </FormSection>

            <FormSection title="Contacts">
              <ContactCRUD
                entityType="asset_group"
                entityId={selectedItem?.id}
                companyId={selectedItem?.company_id}
              />
            </FormSection>

            <FormSection title="Work Groups / Functions">
              <EntityBadges
                entities={selectedItem?.work_groups || []}
                icon={IconUsersGroup}
                parentItem={selectedItem}
                parentType="asset_group"
                addType="work_group"
                onAddSuccess={() => console.log("Work group added!")}
              />
            </FormSection>
          </div>
        </form>
      </div>
    </div>
  );
};

// Work Group Form
export const RHFWorkGroupForm: React.FC<BaseFormProps<WorkGroupFormData>> = ({
  selectedItem,
  setSelectedItem,
  onSave,
  onDelete,
}) => {
  const form = useForm<WorkGroupFormData>({
    resolver: zodResolver(workGroupSchema),
    defaultValues: {
      id: selectedItem?.id,
      name: selectedItem?.name || "",
      description: selectedItem?.description || "",
      code: selectedItem?.code || "",
    },
  });

  useEffect(() => {
    if (selectedItem) {
      form.reset({
        id: selectedItem.id,
        name: selectedItem.name || "",
        description: selectedItem.description || "",
        code: selectedItem?.code || "",
      });
    }
  }, [selectedItem?.id, form]);

  const handleSave = async (data: WorkGroupFormData) => {
    onSave(data);
    form.reset(data);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="sticky top-0 bg-background z-10">
        <FormHeader
          icon={IconUsersGroup}
          iconColor="bg-teal-100 text-teal-600"
          title="Work Group Configuration"
          description="Manage work group settings and roles"
          actions={
            <FormActions
              selectedItem={selectedItem}
              itemType="work_group"
              onSave={form.handleSubmit(handleSave)}
              onDelete={onDelete}
              onClearSelection={() => setSelectedItem(null)}
              compact={true}
              isDirty={form.formState.isDirty}
            />
          }
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        <form
          onSubmit={form.handleSubmit(handleSave)}
          className="p-6 pt-4 space-y-8"
        >
          <div className="space-y-6">
            <FormSection title="Work Group Information">
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-2 gap-6">
                  <FormInput
                    control={form.control}
                    name="name"
                    label="Work Group Name"
                  />
                  <FormInput
                    control={form.control}
                    name="code"
                    label="Work Group Code"
                    placeholder="Work Group code"
                  />
                </div>
                <FormInput
                  control={form.control}
                  name="description"
                  label="Description"
                  placeholder="Work group description and purpose"
                />
              </div>
            </FormSection>

            <FormSection title="Contacts">
              <ContactCRUD
                entityType="work_group"
                entityId={selectedItem?.id}
                companyId={selectedItem?.company_id}
              />
            </FormSection>

            <FormSection title="Roles">
              <EntityBadges
                entities={selectedItem?.roles || []}
                icon={IconUser}
                parentItem={selectedItem}
                parentType="work_group"
                addType="role"
                onAddSuccess={() => console.log("Role added!")}
              />
            </FormSection>
          </div>
        </form>
      </div>
    </div>
  );
};

// Role Form
export const RHFRoleForm: React.FC<BaseFormProps<RoleFormData>> = ({
  selectedItem,
  setSelectedItem,
  onSave,
  onDelete,
}) => {
  const form = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      id: selectedItem?.id,
      level: selectedItem?.level || undefined,
      description: selectedItem?.description || "",
      shared_role_id: selectedItem?.shared_role_id?.toString() || undefined,
      reports_to_role_id: selectedItem?.reports_to_role_id?.toString() || "null",
    },
  });

  useEffect(() => {
    if (selectedItem) {
      form.reset({
        id: selectedItem.id,
        level: selectedItem.level || undefined,
        description: selectedItem.description || "",
        shared_role_id: selectedItem.shared_role_id?.toString() || undefined,
        reports_to_role_id: selectedItem.reports_to_role_id?.toString() || "null",
      });
    }
  }, [selectedItem?.id, form]);

  const handleSave = async (data: RoleFormData) => {
    onSave(data);
    form.reset(data);
  };

  const roleLevelOptions = LEVELS.map((level) => ({
    value: level,
    label: level.charAt(0).toUpperCase() + level.slice(1),
  }));

  return (
    <div className="h-full flex flex-col">
      <div className="sticky top-0 bg-background z-10">
        <FormHeader
          icon={IconUser}
          iconColor="bg-indigo-100 text-indigo-600"
          title="Role Configuration"
          description="Manage role details"
          actions={
            <FormActions
              selectedItem={selectedItem}
              itemType="role"
              onSave={form.handleSubmit(handleSave)}
              onDelete={onDelete}
              onClearSelection={() => setSelectedItem(null)}
              compact={true}
              isDirty={form.formState.isDirty}
            />
          }
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        <form
          onSubmit={form.handleSubmit(handleSave)}
          className="p-6 pt-4 space-y-8"
        >
          <div className="space-y-6">
            <FormSection title="Role Information">
              <div className="space-y-6">
                {/* First row: Role, Role Level */}
                <div className="grid grid-cols-2 gap-6">
                  <RoleSelector
                    control={form.control}
                    name="shared_role_id"
                    label="Role"
                    placeholder="Select a shared role..."
                    selectOnly={false}
                  />
                    <FormSelect
                      control={form.control}
                      name="level"
                      label="Role Level"
                      options={roleLevelOptions}
                    />
                </div>

                {/* Reports to Role - Commented out as this is managed through tree structure */}
                {/* <div className="grid grid-cols-1">
                  <WorkGroupRoleSelector
                    control={form.control}
                    name="reports_to_role_id"
                    label="Reports to Role"
                    placeholder="Select a manager role..."
                    workGroupId={selectedItem?.work_group_id}
                    currentRoleId={selectedItem?.id}
                  />
                </div> */}

                {/* Second row: Description with more space */}
                <div className="grid grid-cols-1">
                  <FormInput
                    control={form.control}
                    name="description"
                    label="Description"
                    placeholder="Role description and responsibilities"
                    disabled
                    className="min-h-[60px]"
                  />
                </div>
              </div>
            </FormSection>

            <FormSection title="Contacts">
              <ContactCRUD
                entityType="role"
                entityId={selectedItem?.id}
                companyId={selectedItem?.company_id}
              />
            </FormSection>

            <FormSection title="Direct Reports">
              <EntityBadges
                entities={selectedItem?.reporting_roles || []}
                icon={IconUser}
                parentItem={selectedItem}
                parentType="role"
                addType="role"
                onAddSuccess={() => console.log("Direct report added!")}
              />
            </FormSection>
          </div>
        </form>
      </div>
    </div>
  );
};
