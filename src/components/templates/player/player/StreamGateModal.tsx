import * as Dialog from '@radix-ui/react-dialog';
import React from 'react';

interface StreamGateModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
}

export function StreamGateModal({ open, onClose, title = 'This is a gated stream', children }: StreamGateModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        {/* dimmed backdrop */}
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

        {/* center‑screen container */}
        <Dialog.Content className="fixed inset-0 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md h-full max-h-[80vh] rounded-lg shadow-xl flex flex-col overflow-hidden">
            {/* scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50">{children}</div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
