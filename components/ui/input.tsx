'use client';

import {
  forwardRef,
  useCallback,
  useId,
  useRef,
  useState,
  type ForwardedRef,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { Eye, EyeOff, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export type InputVariant = 'default' | 'filled' | 'outlined';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  variant?: InputVariant;
  helperText?: string;
  errorMessage?: string;
  successMessage?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  passwordVisibilityLabels?: {
    show: string;
    hide: string;
  };
  onClear?: () => void;
  clearLabel?: string;
  isLoading?: boolean;
  loadingLabel?: string;
  containerClassName?: string;
}

const variantStyles: Record<InputVariant, string> = {
  default: 'border-input-border bg-input',
  filled: 'border-transparent bg-input-filled',
  outlined: 'border-input-border bg-input-outlined',
};

function assignInputRef(
  ref: ForwardedRef<HTMLInputElement>,
  node: HTMLInputElement | null
) {
  if (typeof ref === 'function') {
    ref(node);
    return;
  }

  if (ref) {
    ref.current = node;
  }
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    id: providedId,
    label,
    variant = 'default',
    helperText,
    errorMessage,
    successMessage,
    leftIcon,
    rightIcon,
    passwordVisibilityLabels,
    onClear,
    clearLabel,
    isLoading = false,
    loadingLabel,
    containerClassName,
    className,
    type = 'text',
    value,
    defaultValue,
    disabled,
    readOnly,
    required,
    onChange,
    onFocus,
    onBlur,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    ...props
  },
  ref
) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const messageId = `${id}-message`;
  const [isFocused, setIsFocused] = useState(false);
  const [uncontrolledHasValue, setUncontrolledHasValue] = useState(
    defaultValue !== undefined && String(defaultValue).length > 0
  );
  const [showPassword, setShowPassword] = useState(false);

  const currentUncontrolledValue = inputRef.current?.value ?? '';
  const hasValue =
    value !== undefined
      ? String(value).length > 0
      : uncontrolledHasValue || currentUncontrolledValue.length > 0;
  const isPassword = type === 'password';
  const canTogglePassword = isPassword && passwordVisibilityLabels !== undefined;
  const canClear = Boolean(onClear && clearLabel && hasValue && !disabled && !readOnly && !isLoading);
  const hasInteractiveAction = canTogglePassword || canClear;
  const hasTrailingContent = Boolean(rightIcon || hasInteractiveAction || isLoading);
  const hasMultipleTrailingItems = Boolean(rightIcon && (hasInteractiveAction || isLoading));
  const isActive = isFocused || hasValue;
  const message = errorMessage ?? successMessage ?? helperText;
  const describedBy = [ariaDescribedBy, message ? messageId : undefined]
    .filter(Boolean)
    .join(' ') || undefined;
  const actualType = isPassword && showPassword ? 'text' : type;
  const setInputRef = useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node;
      assignInputRef(ref, node);
    },
    [ref]
  );

  return (
    <div className={cn('flex w-full flex-col gap-input-message', containerClassName)}>
      <div className="relative">
        <input
          id={id}
          ref={setInputRef}
          type={actualType}
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          readOnly={readOnly || isLoading}
          required={required}
          aria-busy={isLoading || undefined}
          aria-invalid={errorMessage ? true : ariaInvalid}
          aria-describedby={describedBy}
          onChange={(event) => {
            setUncontrolledHasValue(event.target.value.length > 0);
            onChange?.(event);
          }}
          onFocus={(event) => {
            setIsFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setIsFocused(false);
            setUncontrolledHasValue(event.target.value.length > 0);
            onBlur?.(event);
          }}
          className={cn(
            'peer h-input w-full rounded-control border px-input-padding pb-sm pt-input-label-offset text-base text-input-text outline-none transition-input duration-fast ease-standard placeholder:text-transparent hover:border-input-border-hover focus:border-input-border-focus focus-visible:shadow-input-focus disabled:cursor-not-allowed disabled:opacity-disabled read-only:cursor-default motion-reduce:transition-none',
            variantStyles[variant],
            leftIcon && 'pl-input-action',
            hasTrailingContent && 'pr-input-action',
            hasMultipleTrailingItems && 'pr-input-actions',
            errorMessage && 'border-input-border-error hover:border-input-border-error focus:border-input-border-error',
            !errorMessage && successMessage &&
              'border-input-border-success hover:border-input-border-success focus:border-input-border-success',
            isActive && 'placeholder:text-input-placeholder',
            className
          )}
          {...props}
        />

        <label
          htmlFor={id}
          className={cn(
            'pointer-events-none absolute top-1/2 -translate-y-1/2 text-base text-input-label transition-input duration-fast ease-standard motion-reduce:transition-none',
            leftIcon ? 'left-input-action' : 'left-input-padding',
            isActive && 'top-sm translate-y-0 text-xs',
            isFocused && 'text-accent',
            errorMessage && 'text-danger',
            !errorMessage && successMessage && 'text-success'
          )}
        >
          {label}
          {required && (
            <span aria-hidden="true" className="ml-xs text-danger">
              *
            </span>
          )}
        </label>

        {leftIcon && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 flex w-input-action items-center justify-center text-input-icon [&>svg]:size-input-icon"
          >
            {leftIcon}
          </span>
        )}

        {hasTrailingContent && (
          <span className="absolute inset-y-0 right-0 flex items-center">
            {rightIcon && (
              <span
                aria-hidden="true"
                className="flex w-input-action items-center justify-center text-input-icon [&>svg]:size-input-icon"
              >
                {rightIcon}
              </span>
            )}

            {isLoading && (
              <span
                role={loadingLabel ? 'status' : undefined}
                className="flex w-input-action items-center justify-center text-input-icon"
              >
                <Loader2 aria-hidden="true" className="size-input-icon animate-input-spinner" />
                {loadingLabel && <span className="sr-only">{loadingLabel}</span>}
              </span>
            )}

            {!isLoading && canTogglePassword && (
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="flex h-full w-input-action items-center justify-center text-input-icon transition-input duration-fast ease-standard hover:text-input-icon-hover focus:outline-none focus-visible:shadow-input-focus motion-reduce:transition-none"
                aria-label={
                  showPassword
                    ? passwordVisibilityLabels.hide
                    : passwordVisibilityLabels.show
                }
                aria-pressed={showPassword}
              >
                {showPassword ? (
                  <EyeOff aria-hidden="true" className="size-input-icon" />
                ) : (
                  <Eye aria-hidden="true" className="size-input-icon" />
                )}
              </button>
            )}

            {!isLoading && !canTogglePassword && canClear && (
              <button
                type="button"
                onClick={onClear}
                className="flex h-full w-input-action items-center justify-center text-input-icon transition-input duration-fast ease-standard hover:text-input-icon-hover focus:outline-none focus-visible:shadow-input-focus motion-reduce:transition-none"
                aria-label={clearLabel}
              >
                <X aria-hidden="true" className="size-input-icon" />
              </button>
            )}
          </span>
        )}
      </div>

      {message && (
        <p
          id={messageId}
          role={errorMessage ? 'alert' : successMessage ? 'status' : undefined}
          className={cn(
            'px-xs text-xs text-text-muted',
            errorMessage && 'text-danger',
            !errorMessage && successMessage && 'text-success'
          )}
        >
          {message}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
