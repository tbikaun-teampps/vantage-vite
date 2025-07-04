import React from "react";
import { type FormHeaderProps } from "../types";

export const FormHeader: React.FC<FormHeaderProps & {
  actions?: React.ReactNode;
}> = ({
  icon: Icon,
  iconColor,
  title,
  description,
  actions,
}) => {
  return (
    <div className="flex items-center justify-between p-6 border-b">
      <div className="flex items-center gap-4">
        <div className={`h-12 w-12 rounded-xl ${iconColor} flex items-center justify-center`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
};