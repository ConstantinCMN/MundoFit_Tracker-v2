'use client';

import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  type ReactNode,
  type SelectHTMLAttributes,
} from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export type SelectVariant = 'default' | 'filled' | 'outlined';

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'multiple' | 'size'> {
  label: string;
  variant?: SelectVariant;
  placeholder?: string;
  helperText?: string;
  errorMessage?: string;
  successMessage?: string;
  leftIcon?: ReactNode;
  readOnly?: boolean;
  isLoading?: boolean;
  loadingLabel?: string;
  containerClassName?: string;
  multiple?: never;
  size?: never;
}

const variantStyles: Record<SelectVariant, string> = {
  default: 'border-select-border bg-select',
  filled: 'border-transparent bg-select-filled',
  outlined: 'border-select-border bg-select-outlined',
};

const selectionKeys = new Set([
  'ArrowDown',
  'ArrowUp',
  'End',
  'Enter',
  'Home',
  'PageDown',
  'PageUp',
  ' ',
]);

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    id: providedId,
    label,
    variant = 'default',
    placeholder,
    helperText,
    errorMessage,
    successMessage,
    leftIcon,
    readOnly = false,
    isLoading = false,
    loadingLabel,
    containerClassName,
    className,
    children,
    value,
    defaultValue,
    disabled,
    required,
    onChange,
    onClick,
    onMouseDown,
    onPointerDown,
    onKeyDown,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    ...props
  },
  ref
) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const messageId = `${id}-message`;
  const lastValueRef = useRef(String(value ?? defaultValue ?? ''));
  const isReadOnly = readOnly || isLoading;
  const message = errorMessage ?? successMessage ?? helperText;
  const describedBy = [ariaDescribedBy, message ? messageId : undefined]
    .filter(Boolean)
    .join(' ') || undefined;

  useEffect(() => {
    if (value !== undefined) {
      lastValueRef.current = String(value);
    }
  }, [value]);

  return (
    <div className={cn('flex w-full flex-col gap-select-message', containerClassName)}>
      <div className="relative">
        <select
          id={id}
          ref={ref}
          value={value}
          defaultValue={defaultValue ?? (placeholder ? '' : undefined)}
          disabled={disabled}
          required={required}
          aria-busy={isLoading || undefined}
          aria-readonly={isReadOnly || undefined}
          aria-invalid={errorMessage ? true : ariaInvalid}
          aria-describedby={describedBy}
          onChange={(event) => {
            if (isReadOnly) {
              event.currentTarget.value = lastValueRef.current;
              return;
            }

            lastValueRef.current = event.currentTarget.value;
            onChange?.(event);
          }}
          onMouseDown={(event) => {
            if (isReadOnly) {
              event.preventDefault();
            }
            onMouseDown?.(event);
          }}
          onPointerDown={(event) => {
            if (isReadOnly) {
              event.preventDefault();
            }
            onPointerDown?.(event);
          }}
          onClick={(event) => {
            if (isReadOnly) {
              event.preventDefault();
            }
            onClick?.(event);
          }}
          onKeyDown={(event) => {
            if (isReadOnly && selectionKeys.has(event.key)) {
              event.preventDefault();
            }
            onKeyDown?.(event);
          }}
          className={cn(
            'peer h-select w-full appearance-none rounded-control border px-select-padding pb-sm pt-select-label-offset text-base text-select-text outline-none transition-select duration-fast ease-standard hover:border-select-border-hover focus:border-select-border-focus focus-visible:shadow-select-focus disabled:cursor-not-allowed disabled:opacity-disabled motion-reduce:transition-none [&>option]:bg-select [&>option]:text-select-text',
            variantStyles[variant],
            leftIcon && 'pl-select-action',
            'pr-select-action',
            isReadOnly && 'cursor-default',
            errorMessage && 'border-select-border-error hover:border-select-border-error focus:border-select-border-error',
            !errorMessage && successMessage &&
              'border-select-border-success hover:border-select-border-success focus:border-select-border-success',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children}
        </select>

        <label
          htmlFor={id}
          className={cn(
            'pointer-events-none absolute top-sm text-xs text-select-label transition-select duration-fast ease-standard motion-reduce:transition-none',
            leftIcon ? 'left-select-action' : 'left-select-padding',
            errorMessage ? 'text-danger peer-focus:text-danger' :
              successMessage ? 'text-success peer-focus:text-success' : 'peer-focus:text-accent'
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
            className="pointer-events-none absolute inset-y-0 left-0 flex w-select-action items-center justify-center text-select-icon [&>svg]:size-select-icon"
          >
            {leftIcon}
          </span>
        )}

        <span
          aria-hidden={!loadingLabel || !isLoading ? 'true' : undefined}
          role={loadingLabel && isLoading ? 'status' : undefined}
          className="pointer-events-none absolute inset-y-0 right-0 flex w-select-action items-center justify-center text-select-icon"
        >
          {isLoading ? (
            <>
              <Loader2 aria-hidden="true" className="size-select-icon animate-select-spinner" />
              {loadingLabel && <span className="sr-only">{loadingLabel}</span>}
            </>
          ) : (
            <ChevronDown aria-hidden="true" className="size-select-icon" />
          )}
        </span>
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

Select.displayName = 'Select';
