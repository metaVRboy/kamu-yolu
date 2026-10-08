"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  loading,
  onayEtiketi = "Sil",
  tehlikeli = true,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  loading?: boolean;
  onayEtiketi?: string;
  // false: olumlu eylem onayi (ör. sinavi baslat) - kirmizi degil ana renk buton.
  tehlikeli?: boolean;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Vazgeç</AlertDialogCancel>
          <AlertDialogAction variant={tehlikeli ? "destructive" : "default"} disabled={loading} onClick={onConfirm}>
            {loading ? (onayEtiketi === "Sil" ? "Siliniyor..." : "İşleniyor...") : onayEtiketi}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
