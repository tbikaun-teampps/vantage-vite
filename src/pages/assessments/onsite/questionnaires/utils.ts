export function getInitials(name: string): string {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .slice(0, 3)
      .toUpperCase();
  }