import { AnimatePresence, motion, Modals } from "@/lib/motion";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { closeModal } from "@/store/slices/ui_slice";
import { CreateServerModal } from "@/components/modals/create-server-modal";
import { CreateChannelModal } from "@/components/modals/create-channel-modal";

/**
 * ModalRoot — renders the active modal as a full-screen overlay.
 * Place this once in App.tsx so it sits above all other content.
 *
 * Adding a new modal:
 *   1. Add its key to ModalType in ui.slice.ts
 *   2. Create the component in components/server or components/user
 *   3. Import and add a case below
 */
export function ModalRoot() {
    const dispatch = useAppDispatch();
    const activeModal = useAppSelector((s) => s.ui.activeModal);
    const modalData = useAppSelector((s) => s.ui.modalData);

    const onClose = () => dispatch(closeModal());

    // Close on Escape key
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") onClose();
    };

    return (
        <AnimatePresence>
            {activeModal && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="modal-backdrop"
                        variants={Modals.backdrop}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={onClose}
                        className="fixed inset-0 z-40 bg-black/70"
                    />

                    {/* Modal content */}
                    <div
                        key="modal-wrapper"
                        role="dialog"
                        aria-modal="true"
                        onKeyDown={handleKeyDown}
                        className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="pointer-events-auto w-full max-w-md">
                            {activeModal === "createServer" && (
                                <CreateServerModal onClose={onClose} />
                            )}
                            {activeModal === "createChannel" && (
                                <CreateChannelModal
                                    onClose={onClose}
                                    serverId={(modalData?.serverId as string) ?? ""}
                                />
                            )}
                            {/* Future modals: editChannel, deleteServer, inviteMembers, userProfile, etc. */}
                        </div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}