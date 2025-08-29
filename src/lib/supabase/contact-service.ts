import { createClient } from "./client";
import type {
  Contact,
  ContactFormData,
  ContactableEntityType,
  EntityId,
} from "@/types/contact";
import { checkDemoAction } from "./utils";

export class ContactService {
  private supabase = createClient();

  // Map entity types to their junction table names
  private getJunctionTableName(entityType: ContactableEntityType): string {
    const tableMap: Record<ContactableEntityType, string> = {
      company: "company_contacts",
      business_unit: "business_unit_contacts",
      region: "region_contacts",
      site: "site_contacts",
      asset_group: "asset_group_contacts",
      work_group: "work_group_contacts",
      role: "role_contacts",
    };
    return tableMap[entityType];
  }

  // Map entity types to their foreign key field names in junction tables
  private getEntityForeignKeyField(entityType: ContactableEntityType): string {
    const fieldMap: Record<ContactableEntityType, string> = {
      company: "company_id",
      business_unit: "business_unit_id",
      region: "region_id",
      site: "site_id",
      asset_group: "asset_group_id",
      work_group: "work_group_id",
      role: "role_id",
    };
    return fieldMap[entityType];
  }

  // Get all contacts for a specific entity
  async getContactsForEntity<T extends ContactableEntityType>(
    entityType: T,
    entityId: EntityId<T>,
    companyId: string
  ): Promise<Contact[]> {
    const junctionTable = this.getJunctionTableName(entityType);
    const entityField = this.getEntityForeignKeyField(entityType);

    const { data: contacts, error } = await this.supabase
      .from(junctionTable)
      .select(
        `
        contact_id,
        contacts (
          id,
          full_name,
          email,
          phone,
          title,
          company_id,
          created_at,
          updated_at,
          is_deleted
        )
      `
      )
      .eq(entityField, entityId)
      .eq("contacts.company_id", companyId)
      .eq("contacts.is_deleted", false);

    if (error) {
      console.error(`Error fetching contacts for ${entityType}:`, error);
      throw error;
    }

    // Extract the contact data from the junction query result
    return (contacts || [])
      .map((item) => item.contacts)
      .filter((contact) => contact !== null) as Contact[];
  }

  // Get all contacts for a company (not entity-specific)
  async getCompanyContacts(companyId: string): Promise<Contact[]> {
    const { data: contacts, error } = await this.supabase
      .from("contacts")
      .select("*")
      .eq("company_id", companyId)
      .eq("is_deleted", false)
      .order("full_name");

    if (error) {
      console.error("Error fetching company contacts:", error);
      throw error;
    }

    return contacts || [];
  }

  // Create a new contact
  async createContact(
    contactData: ContactFormData,
    companyId: string
  ): Promise<Contact> {
    await checkDemoAction();

    if (!contactData.full_name?.trim()) {
      throw new Error("Contact name is required");
    }

    if (!contactData.email?.trim()) {
      throw new Error("Contact email is required");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactData.email.trim())) {
      throw new Error("Invalid email format");
    }

    const { data: contact, error } = await this.supabase
      .from("contacts")
      .insert({
        full_name: contactData.full_name.trim(),
        email: contactData.email.trim(),
        phone: contactData.phone?.trim() || null,
        title: contactData.title?.trim() || null,
        company_id: companyId,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating contact:", error);

      // Handle unique constraint violations
      if (error.code === "23505" && error.message.includes("email")) {
        throw new Error("A contact with this email already exists");
      }

      throw new Error("Failed to create contact");
    }

    return contact;
  }

  // Update an existing contact
  async updateContact(
    contactId: number,
    contactData: ContactFormData
  ): Promise<Contact> {
    await checkDemoAction();

    if (!contactData.full_name?.trim()) {
      throw new Error("Contact name is required");
    }

    if (!contactData.email?.trim()) {
      throw new Error("Contact email is required");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactData.email.trim())) {
      throw new Error("Invalid email format");
    }

    const { data: contact, error } = await this.supabase
      .from("contacts")
      .update({
        full_name: contactData.full_name.trim(),
        email: contactData.email.trim(),
        phone: contactData.phone?.trim() || null,
        title: contactData.title?.trim() || null,
      })
      .eq("id", contactId)
      .select()
      .single();

    if (error) {
      console.error("Error updating contact:", error);

      // Handle unique constraint violations
      if (error.code === "23505" && error.message.includes("email")) {
        throw new Error("A contact with this email already exists");
      }

      throw new Error("Failed to update contact");
    }

    return contact;
  }

  // Delete a contact (soft delete)
  async deleteContact(contactId: number): Promise<void> {
    await checkDemoAction();

    const { error } = await this.supabase
      .from("contacts")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq("id", contactId);

    if (error) {
      console.error("Error deleting contact:", error);
      throw new Error("Failed to delete contact");
    }
  }

  // Link a contact to an entity
  async linkContactToEntity<T extends ContactableEntityType>(
    entityType: T,
    entityId: EntityId<T>,
    contactId: number,
    companyId: string
  ): Promise<void> {
    await checkDemoAction();

    const junctionTable = this.getJunctionTableName(entityType);
    const entityField = this.getEntityForeignKeyField(entityType);

    const insertData = {
      [entityField]: entityId,
      contact_id: contactId,
      company_id: companyId,
    };

    const { error } = await this.supabase
      .from(junctionTable)
      .insert(insertData);

    if (error) {
      console.error(`Error linking contact to ${entityType}:`, error);

      // Handle duplicate link attempts
      if (error.code === "23505") {
        throw new Error("Contact is already linked to this entity");
      }

      throw new Error(`Failed to link contact to ${entityType}`);
    }
  }

  // Unlink a contact from an entity
  async unlinkContactFromEntity<T extends ContactableEntityType>(
    entityType: T,
    entityId: EntityId<T>,
    contactId: number
  ): Promise<void> {
    await checkDemoAction();

    const junctionTable = this.getJunctionTableName(entityType);
    const entityField = this.getEntityForeignKeyField(entityType);

    const { error } = await this.supabase
      .from(junctionTable)
      .delete()
      .eq(entityField, entityId)
      .eq("contact_id", contactId);

    if (error) {
      console.error(`Error unlinking contact from ${entityType}:`, error);
      throw new Error(`Failed to unlink contact from ${entityType}`);
    }
  }

  // Create a contact and immediately link it to an entity
  async createAndLinkContact<T extends ContactableEntityType>(
    entityType: T,
    entityId: EntityId<T>,
    contactData: ContactFormData,
    companyId: string
  ): Promise<Contact> {
    // Create the contact first
    const contact = await this.createContact(contactData, companyId);

    // Link it to the entity
    await this.linkContactToEntity(entityType, entityId, contact.id, companyId);

    return contact;
  }
}

export const contactService = new ContactService();
