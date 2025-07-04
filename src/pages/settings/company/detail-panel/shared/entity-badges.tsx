import React from "react";
import { Badge } from "@/components/ui/badge";
import { QuickAddButton } from "../../quick-add-button";
import { type EntityBadgesProps } from "../types";

export const EntityBadges: React.FC<EntityBadgesProps> = ({
  entities,
  icon: Icon,
  parentItem,
  parentType,
  addType,
  onAddSuccess,
}) => {
  return (
    <div className="flex flex-wrap gap-3" data-tour="entity-badges">
      {entities.map((entity) => (
        <Badge key={entity.id} variant="outline" className="px-4 py-2 text-sm">
          <Icon className="h-3 w-3 mr-2" />
          {entity.name}
          {entity.roles && (
            <span className="ml-2 text-xs opacity-60">
              ({entity.roles.length} roles)
            </span>
          )}
          {entity.level && (
            <span className="ml-2 text-xs opacity-60 capitalize">
              ({entity.level})
            </span>
          )}
        </Badge>
      ))}
      <QuickAddButton
        parentItem={parentItem}
        parentType={parentType}
        addType={addType}
        onSuccess={onAddSuccess}
      />
    </div>
  );
};
