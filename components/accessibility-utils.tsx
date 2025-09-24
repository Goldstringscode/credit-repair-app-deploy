'use client'

import React, { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

// Hook for keyboard navigation
export function useKeyboardNavigation(items: any[], onSelect: (item: any) => void) {
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) return

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setFocusedIndex(prev => (prev + 1) % items.length)
          break
        case 'ArrowUp':
          event.preventDefault()
          setFocusedIndex(prev => (prev - 1 + items.length) % items.length)
          break
        case 'Enter':
        case ' ':
          event.preventDefault()
          if (focusedIndex >= 0 && focusedIndex < items.length) {
            onSelect(items[focusedIndex])
          }
          break
        case 'Escape':
          setFocusedIndex(-1)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [focusedIndex, items, onSelect])

  return { focusedIndex, setFocusedIndex, containerRef }
}

// Focus trap component
interface FocusTrapProps {
  children: React.ReactNode
  active: boolean
  className?: string
}

export function FocusTrap({ children, active, className }: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const firstFocusableRef = useRef<HTMLElement | null>(null)
  const lastFocusableRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!active || !containerRef.current) return

    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    if (focusableElements.length === 0) return

    firstFocusableRef.current = focusableElements[0] as HTMLElement
    lastFocusableRef.current = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstFocusableRef.current) {
            event.preventDefault()
            lastFocusableRef.current?.focus()
          }
        } else {
          if (document.activeElement === lastFocusableRef.current) {
            event.preventDefault()
            firstFocusableRef.current?.focus()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    firstFocusableRef.current?.focus()

    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [active])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}

// Accessible button component
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  className?: string
}

export function AccessibleButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className,
  ...props
}: AccessibleButtonProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
      case 'secondary':
        return 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500'
      case 'danger':
        return 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
      case 'ghost':
        return 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
      default:
        return 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm'
      case 'md':
        return 'px-4 py-2 text-base'
      case 'lg':
        return 'px-6 py-3 text-lg'
      default:
        return 'px-4 py-2 text-base'
    }
  }

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        getVariantClasses(),
        getSizeClasses(),
        className
      )}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  )
}

// Accessible form field component
interface AccessibleFormFieldProps {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
  className?: string
}

export function AccessibleFormField({
  label,
  error,
  required = false,
  children,
  className
}: AccessibleFormFieldProps) {
  const fieldId = React.useId()
  const errorId = React.useId()

  return (
    <div className={cn('space-y-2', className)}>
      <label
        htmlFor={fieldId}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </label>
      <div>
        {React.cloneElement(children as React.ReactElement, {
          id: fieldId,
          'aria-invalid': error ? 'true' : 'false',
          'aria-describedby': error ? errorId : undefined,
          required
        })}
      </div>
      {error && (
        <p
          id={errorId}
          className="text-sm text-red-600"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  )
}

// Accessible table component
interface AccessibleTableProps {
  children: React.ReactNode
  caption?: string
  className?: string
}

export function AccessibleTable({ children, caption, className }: AccessibleTableProps) {
  return (
    <div className="overflow-x-auto">
      <table
        className={cn('w-full border-collapse', className)}
        role="table"
        aria-label={caption}
      >
        {caption && <caption className="sr-only">{caption}</caption>}
        {children}
      </table>
    </div>
  )
}

// Accessible card component
interface AccessibleCardProps {
  children: React.ReactNode
  title?: string
  className?: string
  onClick?: () => void
  role?: string
}

export function AccessibleCard({
  children,
  title,
  className,
  onClick,
  role = 'article'
}: AccessibleCardProps) {
  const isInteractive = !!onClick

  return (
    <div
      className={cn(
        'bg-white rounded-lg border shadow-sm',
        isInteractive && 'cursor-pointer hover:shadow-md transition-shadow',
        className
      )}
      role={role}
      onClick={onClick}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={isInteractive ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      } : undefined}
      aria-label={title}
    >
      {title && (
        <h3 className="sr-only">{title}</h3>
      )}
      {children}
    </div>
  )
}

// Screen reader only text
interface ScreenReaderOnlyProps {
  children: React.ReactNode
}

export function ScreenReaderOnly({ children }: ScreenReaderOnlyProps) {
  return (
    <span className="sr-only">
      {children}
    </span>
  )
}

// Skip link component
interface SkipLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

export function SkipLink({ href, children, className }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4',
        'bg-blue-600 text-white px-4 py-2 rounded-md z-50',
        'focus:outline-none focus:ring-2 focus:ring-blue-500',
        className
      )}
    >
      {children}
    </a>
  )
}

// Live region for announcements
interface LiveRegionProps {
  children: React.ReactNode
  politeness?: 'polite' | 'assertive' | 'off'
  className?: string
}

export function LiveRegion({ children, politeness = 'polite', className }: LiveRegionProps) {
  return (
    <div
      className={cn('sr-only', className)}
      role="status"
      aria-live={politeness}
      aria-atomic="true"
    >
      {children}
    </div>
  )
}

// Hook for managing focus
export function useFocusManagement() {
  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(null)
  const previousFocusedElement = useRef<HTMLElement | null>(null)

  const saveFocus = () => {
    previousFocusedElement.current = document.activeElement as HTMLElement
  }

  const restoreFocus = () => {
    if (previousFocusedElement.current) {
      previousFocusedElement.current.focus()
    }
  }

  const focusElement = (element: HTMLElement | null) => {
    if (element) {
      element.focus()
      setFocusedElement(element)
    }
  }

  return {
    focusedElement,
    saveFocus,
    restoreFocus,
    focusElement
  }
}

// Hook for managing ARIA attributes
export function useAriaAttributes() {
  const [ariaAttributes, setAriaAttributes] = useState<Record<string, any>>({})

  const setAriaAttribute = (key: string, value: any) => {
    setAriaAttributes(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const removeAriaAttribute = (key: string) => {
    setAriaAttributes(prev => {
      const newAttributes = { ...prev }
      delete newAttributes[key]
      return newAttributes
    })
  }

  return {
    ariaAttributes,
    setAriaAttribute,
    removeAriaAttribute
  }
}


