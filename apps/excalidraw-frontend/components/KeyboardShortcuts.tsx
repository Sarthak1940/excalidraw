"use client"

import * as React from "react"
import { X, Keyboard } from "lucide-react"
import { Button } from "@repo/ui/button"
import * as DialogPrimitive from "@radix-ui/react-dialog"

interface Shortcut {
  keys: string[]
  description: string
  category: string
}

const shortcuts: Shortcut[] = [
  // Drawing Tools
  { keys: ["R"], description: "Rectangle tool", category: "Drawing Tools" },
  { keys: ["C"], description: "Circle tool", category: "Drawing Tools" },
  { keys: ["L"], description: "Line tool", category: "Drawing Tools" },
  { keys: ["P"], description: "Pencil tool", category: "Drawing Tools" },
  { keys: ["V"], description: "Select tool", category: "Drawing Tools" },
  
  // Actions
  { keys: ["Cmd/Ctrl", "Z"], description: "Undo", category: "Actions" },
  { keys: ["Cmd/Ctrl", "Shift", "Z"], description: "Redo", category: "Actions" },
  { keys: ["Ctrl", "Y"], description: "Redo (alternative)", category: "Actions" },
  
  // Navigation
  { keys: ["Esc"], description: "Deselect", category: "Navigation" },
  { keys: ["Space", "+", "Drag"], description: "Pan canvas", category: "Navigation" },
]

const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
  if (!acc[shortcut.category]) {
    acc[shortcut.category] = []
  }
  acc[shortcut.category].push(shortcut)
  return acc
}, {} as Record<string, Shortcut[]>)

export function KeyboardShortcuts() {
  const [open, setOpen] = React.useState(false)

  // Listen for keyboard shortcut to open dialog
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "?" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(true)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <>
      {/* Floating button */}
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg bg-blue-600 hover:bg-blue-700 text-white z-40"
        title="Keyboard Shortcuts (Cmd/Ctrl + ?)"
      >
        <Keyboard className="h-6 w-6" />
      </Button>

      {/* Dialog */}
      <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] gap-4 border border-slate-200 bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <DialogPrimitive.Title className="text-2xl font-semibold text-slate-900">
                  Keyboard Shortcuts
                </DialogPrimitive.Title>
                <DialogPrimitive.Description className="text-slate-600 text-sm mt-1">
                  Master these shortcuts to draw faster
                </DialogPrimitive.Description>
              </div>
              <DialogPrimitive.Close className="rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2">
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </DialogPrimitive.Close>
            </div>

            <div className="space-y-6 py-4">
              {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">{category}</h3>
                  <div className="space-y-2">
                    {categoryShortcuts.map((shortcut, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <span className="text-slate-700">{shortcut.description}</span>
                        <div className="flex gap-1">
                          {shortcut.keys.map((key, keyIndex) => (
                            <React.Fragment key={keyIndex}>
                              <kbd className="px-2.5 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-300 rounded-md shadow-sm">
                                {key}
                              </kbd>
                              {keyIndex < shortcut.keys.length - 1 && (
                                <span className="text-slate-400 mx-1">+</span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-200">
              <p className="text-sm text-slate-500 text-center">
                Press <kbd className="px-2 py-1 text-xs font-semibold bg-slate-100 border border-slate-300 rounded">Cmd/Ctrl</kbd> +{" "}
                <kbd className="px-2 py-1 text-xs font-semibold bg-slate-100 border border-slate-300 rounded">?</kbd> to toggle this dialog
              </p>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  )
}
