// components/Button.jsx
import React from 'react'

function Button({ 
  children, 
  onClick, 
  variant = 'primary',
  icon: Icon,
  className = '',
  disabled = false,
  type = 'button',
  size = 'md',
  fullWidth = false
}) {
  const variants = {
    primary: 'bg-primary hover:bg-blue-600 text-white border-2 border-primary',
    secondary: 'bg-secondary hover:bg-gray-800 text-white border-2 border-secondary',
    success: 'bg-green-500 hover:bg-green-600 text-white border-2 border-green-500',
    danger: 'bg-red-500 hover:bg-red-600 text-white border-2 border-red-500',
    'danger-outline': 'border-2 border-red-600 text-red-600 hover:bg-red-50 hover:border-red-700 hover:text-red-700 transition-colors bg-transparent',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white border-2 border-yellow-500',
    outline: 'border-2 border-secondary text-secondary hover:bg-secondary hover:text-white transition-all bg-transparent',
    ghost: 'hover:bg-gray-100 text-secondary border-2 border-transparent',
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }

  const baseStyles = `
    rounded-2xl
    font-normal
    transition-all 
    duration-300
    flex 
    items-center 
    justify-center 
    gap-2
    ${variants[variant] || variants.primary}
    ${sizes[size] || sizes.md}
    ${fullWidth ? 'w-full' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
    ${className}
  `

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={baseStyles}
    >
      {Icon && <Icon size={20} />}
      {children}
    </button>
  )
}

export default Button