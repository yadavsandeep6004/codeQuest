import { useEffect, useRef } from "react";
import * as monaco from "monaco-editor";

interface MonacoEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  height?: string;
}

export function MonacoEditor({ value, onChange, language, height = "400px" }: MonacoEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    (window as any).MonacoEnvironment = {
      getWorker: () => {
        return {
          postMessage: () => {},
          terminate: () => {},
          addEventListener: () => {},
          removeEventListener: () => {}
        };
      }
    };

    if (editorRef.current && !monacoRef.current) {
      try {
        monacoRef.current = monaco.editor.create(editorRef.current, {
          value,
          language: language.toLowerCase(),
          theme: 'vs-dark',
          fontSize: 14,
          fontFamily: 'JetBrains Mono, Monaco, Consolas, monospace',
          automaticLayout: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          quickSuggestions: false,
          parameterHints: { enabled: false },
          suggestOnTriggerCharacters: false,
          acceptSuggestionOnEnter: 'off',
          tabCompletion: 'off',
          wordBasedSuggestions: 'off',
        });

        // Listen for content changes
        monacoRef.current.onDidChangeModelContent(() => {
          if (monacoRef.current) {
            onChange(monacoRef.current.getValue());
          }
        });
      } catch (error) {
        console.warn('Monaco Editor initialization failed, falling back to textarea:', error);
      }
    }

    return () => {
      if (monacoRef.current) {
        monacoRef.current.dispose();
        monacoRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (monacoRef.current && monacoRef.current.getValue() !== value) {
      monacoRef.current.setValue(value);
    }
  }, [value]);

  useEffect(() => {
    if (monacoRef.current) {
      monaco.editor.setModelLanguage(monacoRef.current.getModel()!, language.toLowerCase());
    }
  }, [language]);

  return (
    <div 
      ref={editorRef} 
      style={{ height }} 
      className="border border-border overflow-hidden"
      data-testid="monaco-editor"
    />
  );
}
