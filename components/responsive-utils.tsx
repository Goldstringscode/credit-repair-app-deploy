'use client'

import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

// Hook to detect screen size
export function useScreenSize() {
  const [screenSize, setScreenSize] = useState({
    width: 0,
    height: 0,
    isMobile: false,
    isTablet: false,
    isDesktop: false
  })

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      setScreenSize({
        width,
        height,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024
      })
    }

    updateScreenSize()
    window.addEventListener('resize', updateScreenSize)
    
    return () => window.removeEventListener('resize', updateScreenSize)
  }, [])

  return screenSize
}

// Responsive grid component
interface ResponsiveGridProps {
  children: React.ReactNode
  className?: string
  cols?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  gap?: string
}

export function ResponsiveGrid({ 
  children, 
  className, 
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'gap-4'
}: ResponsiveGridProps) {
  const { isMobile, isTablet, isDesktop } = useScreenSize()
  
  const getGridCols = () => {
    if (isMobile) return `grid-cols-${cols.mobile}`
    if (isTablet) return `grid-cols-${cols.tablet}`
    if (isDesktop) return `grid-cols-${cols.desktop}`
    return `grid-cols-${cols.desktop}`
  }

  return (
    <div className={cn('grid', getGridCols(), gap, className)}>
      {children}
    </div>
  )
}

// Responsive card component
interface ResponsiveCardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'compact' | 'expanded'
}

export function ResponsiveCard({ 
  children, 
  className, 
  variant = 'default' 
}: ResponsiveCardProps) {
  const { isMobile } = useScreenSize()
  
  const getVariantClasses = () => {
    if (isMobile) {
      switch (variant) {
        case 'compact':
          return 'p-3'
        case 'expanded':
          return 'p-6'
        default:
          return 'p-4'
      }
    }
    
    switch (variant) {
      case 'compact':
        return 'p-4'
      case 'expanded':
        return 'p-8'
      default:
        return 'p-6'
    }
  }

  return (
    <div className={cn('bg-white rounded-lg border shadow-sm', getVariantClasses(), className)}>
      {children}
    </div>
  )
}

// Responsive table component
interface ResponsiveTableProps {
  children: React.ReactNode
  className?: string
  breakpoint?: 'sm' | 'md' | 'lg'
}

export function ResponsiveTable({ 
  children, 
  className, 
  breakpoint = 'md' 
}: ResponsiveTableProps) {
  const { isMobile, isTablet } = useScreenSize()
  
  const shouldShowTable = () => {
    if (breakpoint === 'sm') return !isMobile
    if (breakpoint === 'md') return !isMobile && !isTablet
    if (breakpoint === 'lg') return !isMobile && !isTablet
    return true
  }

  if (!shouldShowTable()) {
    return (
      <div className="space-y-4">
        {/* Mobile card view would go here */}
        <div className="text-center text-gray-500 py-8">
          Table view not available on this screen size
        </div>
      </div>
    )
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full">
        {children}
      </table>
    </div>
  )
}

// Responsive text component
interface ResponsiveTextProps {
  children: React.ReactNode
  className?: string
  size?: {
    mobile?: 'xs' | 'sm' | 'base' | 'lg' | 'xl'
    tablet?: 'xs' | 'sm' | 'base' | 'lg' | 'xl'
    desktop?: 'xs' | 'sm' | 'base' | 'lg' | 'xl'
  }
  weight?: {
    mobile?: 'normal' | 'medium' | 'semibold' | 'bold'
    tablet?: 'normal' | 'medium' | 'semibold' | 'bold'
    desktop?: 'normal' | 'medium' | 'semibold' | 'bold'
  }
}

export function ResponsiveText({ 
  children, 
  className, 
  size = { mobile: 'sm', tablet: 'base', desktop: 'lg' },
  weight = { mobile: 'normal', tablet: 'medium', desktop: 'semibold' }
}: ResponsiveTextProps) {
  const { isMobile, isTablet, isDesktop } = useScreenSize()
  
  const getSizeClass = () => {
    if (isMobile) return `text-${size.mobile}`
    if (isTablet) return `text-${size.tablet}`
    if (isDesktop) return `text-${size.desktop}`
    return `text-${size.desktop}`
  }

  const getWeightClass = () => {
    if (isMobile) return `font-${weight.mobile}`
    if (isTablet) return `font-${weight.tablet}`
    if (isDesktop) return `font-${weight.desktop}`
    return `font-${weight.desktop}`
  }

  return (
    <span className={cn(getSizeClass(), getWeightClass(), className)}>
      {children}
    </span>
  )
}

// Responsive button component
interface ResponsiveButtonProps {
  children: React.ReactNode
  className?: string
  size?: {
    mobile?: 'sm' | 'md' | 'lg'
    tablet?: 'sm' | 'md' | 'lg'
    desktop?: 'sm' | 'md' | 'lg'
  }
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link'
  fullWidth?: {
    mobile?: boolean
    tablet?: boolean
    desktop?: boolean
  }
}

export function ResponsiveButton({ 
  children, 
  className, 
  size = { mobile: 'sm', tablet: 'md', desktop: 'md' },
  variant = 'default',
  fullWidth = { mobile: true, tablet: false, desktop: false }
}: ResponsiveButtonProps) {
  const { isMobile, isTablet, isDesktop } = useScreenSize()
  
  const getSizeClass = () => {
    if (isMobile) return `h-${size.mobile === 'sm' ? '8' : size.mobile === 'md' ? '10' : '12'}`
    if (isTablet) return `h-${size.tablet === 'sm' ? '8' : size.tablet === 'md' ? '10' : '12'}`
    if (isDesktop) return `h-${size.desktop === 'sm' ? '8' : size.desktop === 'md' ? '10' : '12'}`
    return `h-${size.desktop === 'sm' ? '8' : size.desktop === 'md' ? '10' : '12'}`
  }

  const getFullWidthClass = () => {
    if (isMobile && fullWidth.mobile) return 'w-full'
    if (isTablet && fullWidth.tablet) return 'w-full'
    if (isDesktop && fullWidth.desktop) return 'w-full'
    return ''
  }

  const getVariantClass = () => {
    switch (variant) {
      case 'outline':
        return 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
      case 'secondary':
        return 'bg-gray-100 text-gray-900 hover:bg-gray-200'
      case 'destructive':
        return 'bg-red-600 text-white hover:bg-red-700'
      case 'ghost':
        return 'text-gray-700 hover:bg-gray-100'
      case 'link':
        return 'text-blue-600 underline hover:text-blue-800'
      default:
        return 'bg-blue-600 text-white hover:bg-blue-700'
    }
  }

  return (
    <button
      className={cn(
        'px-4 py-2 rounded-md font-medium transition-colors',
        getSizeClass(),
        getFullWidthClass(),
        getVariantClass(),
        className
      )}
    >
      {children}
    </button>
  )
}

// Responsive spacing component
interface ResponsiveSpacingProps {
  children: React.ReactNode
  className?: string
  padding?: {
    mobile?: string
    tablet?: string
    desktop?: string
  }
  margin?: {
    mobile?: string
    tablet?: string
    desktop?: string
  }
}

export function ResponsiveSpacing({ 
  children, 
  className, 
  padding = { mobile: 'p-4', tablet: 'p-6', desktop: 'p-8' },
  margin = { mobile: 'm-0', tablet: 'm-0', desktop: 'm-0' }
}: ResponsiveSpacingProps) {
  const { isMobile, isTablet, isDesktop } = useScreenSize()
  
  const getPaddingClass = () => {
    if (isMobile) return padding.mobile
    if (isTablet) return padding.tablet
    if (isDesktop) return padding.desktop
    return padding.desktop
  }

  const getMarginClass = () => {
    if (isMobile) return margin.mobile
    if (isTablet) return margin.tablet
    if (isDesktop) return margin.desktop
    return margin.desktop
  }

  return (
    <div className={cn(getPaddingClass(), getMarginClass(), className)}>
      {children}
    </div>
  )
}

// Responsive visibility component
interface ResponsiveVisibilityProps {
  children: React.ReactNode
  show?: {
    mobile?: boolean
    tablet?: boolean
    desktop?: boolean
  }
  hide?: {
    mobile?: boolean
    tablet?: boolean
    desktop?: boolean
  }
}

export function ResponsiveVisibility({ 
  children, 
  show = { mobile: true, tablet: true, desktop: true },
  hide = { mobile: false, tablet: false, desktop: false }
}: ResponsiveVisibilityProps) {
  const { isMobile, isTablet, isDesktop } = useScreenSize()
  
  const shouldShow = () => {
    if (isMobile) return show.mobile && !hide.mobile
    if (isTablet) return show.tablet && !hide.tablet
    if (isDesktop) return show.desktop && !hide.desktop
    return show.desktop && !hide.desktop
  }

  if (!shouldShow()) {
    return null
  }

  return <>{children}</>
}


