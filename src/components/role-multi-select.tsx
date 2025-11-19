import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { useCompanyTree } from "@/hooks/useCompany";
import { flattenRoles } from "@/lib/utils/company-helpers";
import { IconChevronDown, IconX } from "@tabler/icons-react";

interface RoleMultiSelectProps {
  companyId: string;
  value: number[];
  onChange: (roleIds: number[]) => void;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
  maxHeight?: string;
}

export function RoleMultiSelect({
  companyId,
  value,
  onChange,
  disabled = false,
  placeholder = "Select roles",
  label,
  maxHeight = "400px",
}: RoleMultiSelectProps) {
  const { data: tree, isLoading } = useCompanyTree(companyId);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Flatten all roles from tree
  const allRoles = useMemo(() => flattenRoles(tree), [tree]);

  // Group roles by their location path for display
  const groupedRoles = useMemo(() => {
    const groups: Record<string, typeof allRoles> = {};

    allRoles.forEach((role) => {
      const groupKey = role.path;
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(role);
    });

    return groups;
  }, [allRoles]);

  // Filter groups based on search
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groupedRoles;

    const query = searchQuery.toLowerCase();
    const filtered: Record<string, typeof allRoles> = {};

    Object.entries(groupedRoles).forEach(([groupKey, roles]) => {
      const matchingRoles = roles.filter(
        (role) =>
          role.name.toLowerCase().includes(query) ||
          role.path.toLowerCase().includes(query) ||
          role.code?.toLowerCase().includes(query) ||
          role.description?.toLowerCase().includes(query)
      );

      if (matchingRoles.length > 0) {
        filtered[groupKey] = matchingRoles;
      }
    });

    return filtered;
  }, [groupedRoles, searchQuery]);

  // Get selected role objects for badge display
  const selectedRoles = useMemo(() => {
    return allRoles.filter((role) => value.includes(role.id));
  }, [allRoles, value]);

  const handleRoleToggle = (roleId: number) => {
    const newValue = value.includes(roleId)
      ? value.filter((id) => id !== roleId)
      : [...value, roleId];

    onChange(newValue);
  };

  const handleRemoveRole = (roleId: number) => {
    onChange(value.filter((id) => id !== roleId));
  };

  const handleClearAll = () => {
    onChange([]);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {label && <Label>{label}</Label>}
        <div className="text-sm text-muted-foreground">
          Loading roles...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}

      {/* Selected roles badges */}
      {selectedRoles.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedRoles.map((role) => (
            <Badge
              key={role.id}
              variant="secondary"
              className="flex items-center gap-1 pr-1"
            >
              <span className="text-xs">
                {role.name}
                <span className="text-muted-foreground ml-1">
                  ({role.workGroupName})
                </span>
              </span>
              <button
                type="button"
                onClick={() => handleRemoveRole(role.id)}
                disabled={disabled}
                className="ml-1 rounded-full hover:bg-muted p-0.5"
              >
                <IconX className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {selectedRoles.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              disabled={disabled}
              className="h-6 px-2 text-xs"
            >
              Clear all
            </Button>
          )}
        </div>
      )}

      {/* Role selector popover */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full justify-between"
          >
            <span className="text-muted-foreground">
              {selectedRoles.length > 0
                ? `${selectedRoles.length} role${selectedRoles.length > 1 ? "s" : ""} selected`
                : placeholder}
            </span>
            <IconChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[500px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search roles..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandEmpty>No roles found.</CommandEmpty>
            <ScrollArea style={{ maxHeight }}>
              <CommandList>
                {Object.entries(filteredGroups).map(([groupPath, roles], groupIndex) => (
                  <div key={groupPath}>
                    {groupIndex > 0 && <CommandSeparator />}
                    <CommandGroup heading={groupPath}>
                      {roles.map((role) => {
                        const isSelected = value.includes(role.id);
                        return (
                          <CommandItem
                            key={role.id}
                            value={`${role.id}-${role.name}-${role.path}`}
                            onSelect={() => handleRoleToggle(role.id)}
                            className="flex items-start gap-2 py-2"
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleRoleToggle(role.id)}
                              className="mt-0.5"
                            />
                            <div className="flex-1">
                              <div className="font-medium">{role.name}</div>
                              {role.code && (
                                <div className="text-xs text-muted-foreground">
                                  Code: {role.code}
                                </div>
                              )}
                              {role.description && (
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  {role.description}
                                </div>
                              )}
                              {role.level && (
                                <div className="text-xs text-muted-foreground capitalize mt-0.5">
                                  Level: {role.level}
                                </div>
                              )}
                            </div>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </div>
                ))}
              </CommandList>
            </ScrollArea>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedRoles.length === 0 && !isLoading && (
        <div className="text-sm text-muted-foreground">{placeholder}</div>
      )}
    </div>
  );
}
