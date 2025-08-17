export interface SaveChangesButtonProps {
  item: any;
  itemType: string;
  onSuccess: () => void; // Now required since all forms provide it
  onError?: (error: string) => void;
  className?: string;
}