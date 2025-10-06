import { useState } from "react";
import { Button } from "@/components/ui/button";
import { IconPlus } from "@tabler/icons-react";
import { ContactList } from "./contact-list";
import { ContactForm } from "./contact-form";
import { useEntityContacts, useContactActions } from "@/hooks/useContacts";
import type {
  Contact,
  ContactFormData,
  ContactableEntityType,
  EntityId,
} from "@/types/contact";
import { useCanAdmin } from "@/hooks/useUserCompanyRole";

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
  const userCanAdmin = useCanAdmin();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  // Fetch contacts using React Query
  const { data: contacts = [], isLoading } = useEntityContacts(
    companyId,
    entityType,
    entityId
  );

  // Contact mutation actions
  const {
    createContact,
    updateContact,
    unlinkContact,
    isCreating,
    isUpdating,
  } = useContactActions(companyId);

  // Combine loading states for form
  const isFormLoading = isCreating || isUpdating;

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
      await unlinkContact({
        companyId,
        entityType,
        entityId,
        contactId,
      });
      onContactChange?.(); // Notify parent of changes
    } catch (error) {
      console.error("Error removing contact:", error);
    }
  };

  // Handle saving a contact (create or update)
  const handleSaveContact = async (data: ContactFormData) => {
    try {
      if (editingContact) {
        // Update existing contact
        await updateContact({
          companyId,
          contactId: editingContact.id,
          contactData: data,
        });
      } else {
        // Create new contact and link to entity
        await createContact({
          companyId,
          entityType,
          entityId,
          contactData: data,
        });
      }

      onContactChange?.(); // Notify parent of changes
      setIsFormOpen(false);
      setEditingContact(null);
    } catch (error) {
      console.error("Error saving contact:", error);
      throw error; // Re-throw to prevent form from closing
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
        {userCanAdmin && (
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
        )}
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
