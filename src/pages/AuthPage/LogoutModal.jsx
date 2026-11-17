import Modal from "../../components/ui/Modal";

export function LogoutModal({ onClose, onConfirm }) {
  return (
    <Modal
      title="Log Out?"
      onClose={onClose}
      action={onConfirm}
      actionLabel="Log Out"
    >
      <p>
        Are you sure you want to log out of the COPC Record Management System?
      </p>
    </Modal>
  );
}

export default LogoutModal;
