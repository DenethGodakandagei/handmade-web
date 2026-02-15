
import React from 'react';
import { cn } from "@/lib/utils";

export const InputField = ({ label, register, name, error, placeholder, type = "text", className = "", ...props }) => (
  <div className={`space-y-2 ${className}`}>
    {label && <label className="text-xs uppercase tracking-[0.15em] font-medium text-gray-400">{label}</label>}
    <input
      type={type}
      {...register(name)}
      {...props}
      placeholder={placeholder}
      className={cn(
        "w-full bg-transparent border-b border-gray-200 py-3 text-lg font-light focus:outline-none focus:border-black transition-colors placeholder:text-gray-200",
        error && "border-red-500"
      )}
    />
    {error && (
      <span className="text-xs text-red-500 font-medium tracking-wide block pt-1 animate-in fade-in slide-in-from-top-1 duration-300">
        {error.message}
      </span>
    )}
  </div>
);
