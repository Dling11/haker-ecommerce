import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { Fragment } from "react";
import { X } from "lucide-react";

function AppModal({ isOpen, onClose, title, description, children, width = "max-w-2xl" }) {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto p-4">
          <div className="flex min-h-full items-center justify-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-4"
              enterTo="opacity-100 translate-y-0"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-4"
            >
              <DialogPanel
                className={`w-full ${width} rounded-[10px] border border-white/10 bg-[#171c24] p-6 text-white shadow-[0_24px_80px_rgba(0,0,0,0.4)]`}
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-white">{title}</h2>
                    {description ? (
                      <p className="mt-2 text-sm leading-6 text-white/60">{description}</p>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-[10px] border border-white/10 p-2 text-white/65"
                  >
                    <X size={18} />
                  </button>
                </div>

                {children}
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default AppModal;
