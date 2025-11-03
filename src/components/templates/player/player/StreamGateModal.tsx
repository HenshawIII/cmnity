import * as Dialog from '@radix-ui/react-dialog';
import React, { useEffect, useRef } from 'react';

interface StreamGateModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
}

export function StreamGateModal({ open, onClose, title = 'This is a gated stream', children }: StreamGateModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !overlayRef.current) return;

    // Add click handler to allow wallet modal to work
    const handleOverlayClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // If clicking on wallet-related elements, allow it
      if (
        target.closest('[data-rk], .wallet-adapter-modal, .wallet-adapter-dropdown, [data-radix-popper-content-wrapper]')
      ) {
        e.stopPropagation();
        return;
      }
    };

    const overlay = overlayRef.current;
    overlay.addEventListener('click', handleOverlayClick, true);
    
    return () => {
      overlay.removeEventListener('click', handleOverlayClick, true);
    };
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()} modal={false}>
      <Dialog.Portal>
        {/* dimmed backdrop - allow clicks through for wallet modal */}
        <Dialog.Overlay 
          ref={overlayRef}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        />

        {/* center‑screen container */}
        <Dialog.Content 
          className="fixed inset-0 flex items-center justify-center p-4 z-40 pointer-events-none"
          onPointerDownOutside={(e) => {
            // Don't close if clicking wallet modal
            const target = e.target as HTMLElement;
            if (target.closest('[data-rk], .wallet-adapter-modal, .wallet-adapter-dropdown, [data-radix-popper-content-wrapper]')) {
              e.preventDefault();
            }
          }}
        >
          <div className="bg-white w-full max-w-md h-full max-h-[80vh] rounded-lg shadow-xl flex flex-col overflow-hidden relative pointer-events-auto">
            {/* scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50">{children}</div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
