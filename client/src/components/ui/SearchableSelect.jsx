
import React, { useState } from 'react';
import { ChevronsUpDown, Check, Search } from 'lucide-react';
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export const SearchableSelect = ({ label, value, onChange, options, placeholder, error, renderItem, renderTrigger }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = options.filter(item => 
     item.name.toLowerCase().includes(search.toLowerCase()) || 
     (item.dial_code && item.dial_code.includes(search)) ||
     (item.code && item.code.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-2 flex flex-col">
      {label && <label className="text-xs uppercase tracking-[0.15em] font-medium text-gray-400">{label}</label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            role="combobox"
            aria-expanded={open}
            className={cn(
               "w-full bg-transparent border-b border-gray-200 py-3 text-lg font-light focus:outline-none text-left flex items-center justify-between",
               !value && "text-gray-200",
               open && "border-black",
               error && "border-red-500"
            )}
          >
            {value ? (renderTrigger ? renderTrigger(options.find(opt => opt.value === value)) : options.find(opt => opt.value === value)?.label) : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0 bg-white border border-gray-100 shadow-xl" align="start">
          <Command>
            <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <input 
                   placeholder={placeholder} 
                   className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <CommandList>
                {filtered.length === 0 && <CommandEmpty>No results found.</CommandEmpty>}
                <CommandGroup>
                {filtered.map((item) => (
                  <CommandItem
                    key={item.code || item.value}
                    value={item.value || item.name}
                    onSelect={(currentValue) => {
                      onChange(item.value || item.name);
                      setOpen(false);
                      setSearch("");
                    }}
                    className="cursor-pointer hover:bg-gray-50 text-sm"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === (item.value || item.name) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {renderItem ? renderItem(item) : item.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <span className="text-xs text-red-500 font-medium tracking-wide">{error.message}</span>}
    </div>
  );
};
