"use client";

import { useEffect, useRef, useState } from 'react';
import { Bold } from 'lucide-react';
import { Button } from './button';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Enter product description...",
  disabled = false,
  className = "",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const savedRangeRef = useRef<Range | null>(null);
  
  // State for selection toolbar positioning
  const [selectionCoords, setSelectionCoords] = useState<{ top: number; left: number } | null>(null);

  // Sync external content with outer value
  useEffect(() => {
    if (editorRef.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value]);

  // Document level selection change listener to save selection and place floating toolbar
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
        setSelectionCoords(null);
        return;
      }

      const range = selection.getRangeAt(0);
      
      // Node-traversal check to safely verify if the selection is inside the editor
      let isInside = false;
      let node: Node | null = range.commonAncestorContainer;
      while (node) {
        if (editorRef.current && node === editorRef.current) {
          isInside = true;
          break;
        }
        node = node.parentNode;
      }

      if (isInside) {
        savedRangeRef.current = range.cloneRange();
        
        // Get client rects for multi-line or partial line selections
        const rects = range.getClientRects();
        const rect = rects.length > 0 ? rects[0] : range.getBoundingClientRect();
        
        if (containerRef.current) {
          const parentRect = containerRef.current.getBoundingClientRect();
          // Position 45px above the selection and horizontally centered
          setSelectionCoords({
            top: rect.top - parentRect.top - 45,
            left: rect.left - parentRect.left + rect.width / 2,
          });
        }
      } else {
        setSelectionCoords(null);
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const restoreSelection = () => {
    if (savedRangeRef.current) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedRangeRef.current.cloneRange());
      }
    }
  };

  const applyBold = () => {
    if (disabled) return;
    
    // Focus the editor first to ensure it is active
    if (editorRef.current) {
      editorRef.current.focus();
    }
    
    restoreSelection();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    
    // Ensure selection is inside the editor
    let isInside = false;
    let node: Node | null = range.commonAncestorContainer;
    while (node) {
      if (editorRef.current && node === editorRef.current) {
        isInside = true;
        break;
      }
      node = node.parentNode;
    }

    if (!isInside) return;

    // Toggle bold formatting natively
    document.execCommand('bold', false);
    handleInput();
  };

  // Prevent losing selection when clicking buttons
  const preventFocusLoss = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div 
      ref={containerRef}
      className={`relative flex flex-col border rounded-md bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ${className}`}
    >
      {/* Selection Floating Toolbar */}
      {selectionCoords && (
        <div 
          style={{ 
            position: 'absolute',
            top: `${selectionCoords.top}px`, 
            left: `${selectionCoords.left}px`,
            backgroundColor: '#0f172a',
            border: '1px solid #334155',
            color: '#ffffff',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px',
            borderRadius: '6px',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3), 0 4px 6px -2px rgba(0,0,0,0.15)',
            transform: 'translateX(-50%)',
            userSelect: 'none'
          }}
          onMouseDown={preventFocusLoss}
        >
          {/* Bold Button */}
          <button
            type="button"
            style={{
              height: '28px',
              width: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '4px',
              color: '#ffffff',
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
            disabled={disabled}
            onClick={applyBold}
            title="Bold"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1e293b';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Bold className="h-4 w-4" />
          </button>

          {/* Downward pointing triangle arrow */}
          <div 
            style={{
              position: 'absolute',
              bottom: '-5px',
              left: '50%',
              transform: 'translateX(-50%) rotate(45deg)',
              width: '10px',
              height: '10px',
              backgroundColor: '#0f172a',
              borderRight: '1px solid #334155',
              borderBottom: '1px solid #334155',
              zIndex: 99
            }}
          />
        </div>
      )}

      {/* Editor Standard Top Toolbar */}
      <div 
        className="flex flex-wrap items-center gap-1.5 p-2 bg-muted/50 border-b select-none"
        onMouseDown={preventFocusLoss}
      >
        {/* Bold Button */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8 bg-background border hover:bg-accent"
          disabled={disabled}
          onClick={applyBold}
          title="Bold (Toggle)"
        >
          <Bold className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor Content Area */}
      <div className="relative min-h-[150px] p-3">
        {/* Placeholder element */}
        {!value && !isFocused && (
          <div className="absolute inset-0 p-3 text-sm text-muted-foreground pointer-events-none">
            {placeholder}
          </div>
        )}
        <div
          ref={editorRef}
          contentEditable={!disabled}
          onInput={handleInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full min-h-[150px] text-sm focus:outline-none whitespace-pre-wrap break-words prose max-w-none text-foreground"
          style={{ outline: 'none' }}
        />
      </div>
    </div>
  );
}
