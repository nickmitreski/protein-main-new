import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { components, colors, cn } from '../../design-system';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  className = '',
}: ModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeStyles = {
    sm: { maxWidth: '24rem' },
    md: { maxWidth: '32rem' },
    lg: { maxWidth: '48rem' },
    xl: { maxWidth: '64rem' },
  };

  return (
    <div
      className="modal-backdrop"
      style={components.modal.backdrop}
      onClick={onClose}
    >
      <div
        className={cn('modal-content', className)}
        style={{
          ...components.modal.content,
          ...sizeStyles[size],
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <div
            className="modal-header"
            style={{
              ...components.modal.header,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: colors.text.primary,
                margin: 0,
              }}
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              style={{
                padding: '0.5rem',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: colors.text.secondary,
                transition: 'color 150ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = colors.text.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = colors.text.secondary;
              }}
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="modal-body" style={components.modal.body}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="modal-footer" style={components.modal.footer}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// Convenience component for common modal actions
interface ConfirmModalProps extends Omit<ModalProps, 'footer'> {
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'primary' | 'error';
  isLoading?: boolean;
}

export function ConfirmModal({
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  isLoading = false,
  onClose,
  ...props
}: ConfirmModalProps) {
  return (
    <Modal
      {...props}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={variant === 'error' ? 'primary' : variant}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </>
      }
    />
  );
}
