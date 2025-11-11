import React, { createContext, useContext, useState } from 'react';

// Context for the confirmation dialog
const ConfirmDialogContext = createContext();

/**
 * Hook to use the confirm dialog
 * @returns {function} confirm - Function to show confirmation dialog
 */
export const useConfirm = () => {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmDialogProvider');
  }
  return context.confirm;
};

/**
 * Provider component for the confirmation dialog
 */
export const ConfirmDialogProvider = ({ children }) => {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'نعم',
    cancelText: 'لا',
    onConfirm: null,
    onCancel: null,
  });

  /**
   * Show confirmation dialog
   * @param {object} options - Dialog options
   * @returns {Promise<boolean>} Resolves to true if confirmed, false if cancelled
   */
  const confirm = ({
    title = 'تأكيد',
    message,
    confirmText = 'نعم',
    cancelText = 'لا',
  }) => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        title,
        message,
        confirmText,
        cancelText,
        onConfirm: () => {
          setDialogState((prev) => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setDialogState((prev) => ({ ...prev, isOpen: false }));
          resolve(false);
        },
      });
    });
  };

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      {dialogState.isOpen && (
        <div className="modal-overlay" onClick={dialogState.onCancel}>
          <div className="modal confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{dialogState.title}</h3>
              <button
                className="close-btn"
                onClick={dialogState.onCancel}
                aria-label="إغلاق"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
                {dialogState.message}
              </p>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'center', gap: '1rem' }}>
              <button
                className="btn btn-danger"
                onClick={dialogState.onConfirm}
                style={{ minWidth: '100px' }}
              >
                {dialogState.confirmText}
              </button>
              <button
                className="btn btn-secondary"
                onClick={dialogState.onCancel}
                style={{ minWidth: '100px' }}
              >
                {dialogState.cancelText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmDialogContext.Provider>
  );
};
