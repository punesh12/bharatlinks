"use client";

import { useCallback, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ModalProps {
  /**
   * Whether the modal is open
   */
  isOpen: boolean;
  /**
   * Callback when modal should close (e.g., backdrop click, ESC key)
   */
  onClose: () => void;
  /**
   * Modal title
   */
  title?: ReactNode;
  /**
   * Modal description/subtitle
   */
  description?: ReactNode;
  /**
   * Modal content (children)
   */
  children: ReactNode;
  /**
   * Footer content (buttons, actions)
   */
  footer?: ReactNode;
  /**
   * Maximum width of the modal
   * @default "sm:max-w-lg"
   */
  maxWidth?: string;
  /**
   * Custom className for the modal content
   */
  className?: string;
  /**
   * Custom className for the header
   */
  headerClassName?: string;
  /**
   * Custom className for the footer
   */
  footerClassName?: string;
  /**
   * Whether to show the close button (X)
   * @default true
   */
  showCloseButton?: boolean;
  /**
   * Whether clicking the backdrop closes the modal
   * @default true
   */
  closeOnBackdropClick?: boolean;
  /**
   * Whether pressing ESC closes the modal
   * @default true
   */
  closeOnEscape?: boolean;
}

/**
 * Base Modal Component with backdrop
 * 
 * A reusable modal wrapper that handles backdrop, animations, and common modal patterns.
 * The backdrop is automatically included. Use this as a base for all modals in the application.
 * 
 * @example
 * ```tsx
 * <Modal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Confirm Action"
 *   description="Are you sure you want to proceed?"
 *   footer={
 *     <>
 *       <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
 *       <Button onClick={handleConfirm}>Confirm</Button>
 *     </>
 *   }
 * >
 *   <p>Modal content goes here</p>
 * </Modal>
 * ```
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = "sm:max-w-lg",
  className,
  headerClassName,
  footerClassName,
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
}: ModalProps) => {
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onClose();
      }
    },
    [onClose]
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(maxWidth, className)}
        showCloseButton={showCloseButton}
        onEscapeKeyDown={(e) => {
          if (!closeOnEscape) {
            e.preventDefault();
          }
        }}
        onPointerDownOutside={(e) => {
          if (!closeOnBackdropClick) {
            e.preventDefault();
          }
        }}
      >
        {(title || description) && (
          <DialogHeader className={headerClassName}>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}
        <div className="py-4">{children}</div>
        {footer && <DialogFooter className={footerClassName}>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
};
