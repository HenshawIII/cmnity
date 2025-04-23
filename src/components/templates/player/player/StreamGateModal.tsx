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
            {/* header */}
            <header className="flex items-center justify-between px-6 py-4 ">
              <Dialog.Title className="text-lg font-semibold flex items-center gap-2">🔒 {title}</Dialog.Title>
              <Dialog.Close
                onClick={onClose}
                className="text-gray-500 hover:text-gray-800 p-1 rounded-full transition-colors"
              >
                ✕
              </Dialog.Close>
            </header>

            {/* scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50">{children}</div>

            {/* footer */}
            <footer className="flex justify-end px-6 py-4 border-t bg-white">
              <Dialog.Close onClick={onClose} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition">
                Cancel
              </Dialog.Close>
            </footer>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
