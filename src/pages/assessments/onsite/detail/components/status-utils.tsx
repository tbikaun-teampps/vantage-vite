import React from "react";
import {
  IconCircleCheckFilled,
  IconClock,
  IconPencil,
  IconEye,
  IconArchive,
  IconLoader,
  IconUser,
} from "@tabler/icons-react";

export function getStatusIcon(status: string) {
  switch (status) {
    case "completed":
      return <IconCircleCheckFilled className="h-4 w-4 text-green-500" />;
    case "active":
      return <IconClock className="h-4 w-4 text-blue-500" />;
    case "draft":
      return <IconPencil className="h-4 w-4 text-red-500" />;
    case "under_review":
      return <IconEye className="h-4 w-4 text-yellow-500" />;
    case "archived":
      return <IconArchive className="h-4 w-4 text-gray-500" />;
    default:
      return <IconLoader className="h-4 w-4" />;
  }
}

export function getInterviewStatusIcon(status: string) {
  switch (status) {
    case "completed":
      return <IconCircleCheckFilled className="h-4 w-4 text-green-500" />;
    case "in_progress":
      return <IconClock className="h-4 w-4 text-blue-500" />;
    case "pending":
      return <IconUser className="h-4 w-4 text-gray-500" />;
    case "cancelled":
      return <IconArchive className="h-4 w-4 text-red-500" />;
    default:
      return <IconLoader className="h-4 w-4" />;
  }
}