import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { IconPlus } from "@tabler/icons-react";
import { ContactList } from "./contact-list";
import { ContactForm } from "./contact-form";
import { contactService } from "@/lib/supabase/contact-service";
import type {
  Contact,
  ContactFormData,
  ContactableEntityType,
  EntityId,
} from "@/types/contact";

interface ContactCRUDProps<T extends ContactableEntityType> {
  entityType: T;
  entityId: EntityId<T>;
  companyId: string;
  title?: string;
  className?: string;
  onContactChange?: () => void; // Callback when contacts are modified
}

export function ContactCRUD<T extends ContactableEntityType>({
  entityType,
  entityId,
  companyId,
  title = "Contacts",
  className = "",
  onContactChange,
}: ContactCRUDProps<T>) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);

  // Load contacts for the entity
  const loadContacts = async () => {
    try {
      setIsLoading(true);
      const entityContacts = await contactService.getContactsForEntity(
        entityType,
        entityId,
        companyId
      );
      setContacts(entityContacts);
    } catch (error) {
      console.error("Error loading contacts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load contacts on mount and when entity changes
  useEffect(() => {
    if (entityId && companyId) {
      loadContacts();
    }
  }, [entityType, entityId, companyId]);

  // Handle adding a new contact
  const handleAddContact = () => {
    setEditingContact(null);
    setIsFormOpen(true);
  };

  // Handle editing an existing contact
  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setIsFormOpen(true);
  };

  // Handle removing a contact from the entity
  const handleRemoveContact = async (contactId: number) => {
    try {
      await contactService.unlinkContactFromEntity(
        entityType,
        entityId,
        contactId
      );
      await loadContacts(); // Refresh the list
      onContactChange?.(); // Notify parent of changes
    } catch (error) {
      console.error("Error removing contact:", error);
    }
  };

  // Handle saving a contact (create or update)
  const handleSaveContact = async (data: ContactFormData) => {
    try {
      setIsFormLoading(true);

      if (editingContact) {
        // Update existing contact
        await contactService.updateContact(editingContact.id, data);
      } else {
        // Create new contact and link to entity
        await contactService.createAndLinkContact(
          entityType,
          entityId,
          data,
          companyId
        );
      }

      await loadContacts(); // Refresh the list
      onContactChange?.(); // Notify parent of changes
      setIsFormOpen(false);
      setEditingContact(null);
    } catch (error) {
      console.error("Error saving contact:", error);
      throw error; // Re-throw to prevent form from closing
    } finally {
      setIsFormLoading(false);
    }
  };

  // Handle closing the form
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingContact(null);
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium">{title}</h4>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddContact}
          className="h-8 px-2 text-xs"
        >
          <IconPlus className="h-3 w-3 mr-1" />
          Add Contact
        </Button>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading contacts...</div>
      ) : (
        <ContactList
          contacts={contacts}
          onEditContact={handleEditContact}
          onRemoveContact={handleRemoveContact}
          showRemoveButton={true}
        />
      )}

      <ContactForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSave={handleSaveContact}
        contact={editingContact}
        isLoading={isFormLoading}
      />
    </div>
  );
}
