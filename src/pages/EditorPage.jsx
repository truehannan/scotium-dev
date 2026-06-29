import { useState, useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { rust } from '@codemirror/lang-rust';
import { oneDark } from '@codemirror/theme-one-dark';
import SEO from '../components/SEO';

const LANGUAGE_CONFIGS = {
  javascript: { label: 'JavaScript', ext: javascript, sample: '// JavaScript\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet("World"));' },
  typescript: { label: 'TypeScript', ext: () => javascript({ typescript: true }), sample: '// TypeScript\ninterface User {\n  name: string;\n  age: number;\n}\n\nfunction greet(user: User): string {\n  return `Hello, ${user.name}!`;\n}' },
  python: { label: 'Python', ext: python, sample: '# Python\ndef greet(name: str) -> str:\n    return f"Hello, {name}!"\n\nif __name__ == "__main__":\n    print(greet("World"))' },
  java: { label: 'Java', ext: java, sample: '// Java\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}' },
  cpp: { label: 'C++', ext: cpp, sample: '// C++\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}' },
  html: { label: 'HTML', ext: html, sample: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Hello</title>\n</head>\n<body>\n  <h1>Hello, World!</h1>\n</body>\n</html>' },
  css: { label: 'CSS', ext: css, sample: '/* CSS */\n:root {\n  --primary: #0a0e27;\n  --secondary: #10b981;\n}\n\nbody {\n  background: var(--primary);\n  color: white;\n  font-family: Inter, sans-serif;\n}' },
  json: { label: 'JSON', ext: json, sample: '{\n  "name": "scotium",\n  "version": "1.0.0",\n  "description": "GitHub wrapper platform",\n  "dependencies": {\n    "react": "^18.2.0"\n  }\n}' },
  rust: { label: 'Rust', ext: rust, sample: '// Rust\nfn main() {\n    let name = "World";\n    println!("Hello, {}!", name);\n}' },
  go: { label: 'Go', ext: () => javascript(), sample: '// Go\npackage main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("Hello, World!")\n}' },
};

export default function EditorPage() {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(LANGUAGE_CONFIGS.javascript.sample);
  const [copied, setCopied] = useState(false);
  const [lineCol, setLineCol] = useState({ line: 1, col: 1 });

  const config = LANGUAGE_CONFIGS[language];

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    const savedCode = localStorage.getItem(`editor_${newLang}`);
    setCode(savedCode || LANGUAGE_CONFIGS[newLang].sample);
  };

  const handleCodeChange = useCallback((value) => {
    setCode(value);
    localStorage.setItem(`editor_${language}`, value);
  }, [language]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const clearCode = () => {
    setCode('');
    localStorage.removeItem(`editor_${language}`);
  };

  const extensions = [config.ext()];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <SEO title="Code Editor" description="In-browser code editor with syntax highlighting" canonical="/editor" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Code Editor</h1>
          <p className="text-sm text-gray-400">Write and edit code with syntax highlighting</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="card p-3 mb-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="input-field text-sm py-1.5"
            >
              {Object.entries(LANGUAGE_CONFIGS).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            {/* Language Quick Select */}
            <div className="hidden sm:flex items-center gap-1">
              {['javascript', 'typescript', 'python', 'rust', 'go'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                    language === lang
                      ? 'bg-secondary/10 text-secondary'
                      : 'text-gray-500 hover:text-white hover:bg-primary-light'
                  }`}
                >
                  {LANGUAGE_CONFIGS[lang].label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearCode}
              className="px-3 py-1.5 text-xs text-gray-400 hover:text-red-400 border border-gray-700 rounded-lg hover:border-red-400/30 transition-all"
            >
              Clear
            </button>
            <button
              onClick={copyToClipboard}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                copied
                  ? 'bg-secondary/10 text-secondary border-secondary/30'
                  : 'text-gray-400 border-gray-700 hover:text-white hover:border-gray-500'
              }`}
            >
              {copied ? 'Copied!' : 'Copy All'}
            </button>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="rounded-xl overflow-hidden border border-gray-800">
        <CodeMirror
          value={code}
          height="500px"
          theme={oneDark}
          extensions={extensions}
          onChange={handleCodeChange}
          onUpdate={(viewUpdate) => {
            if (viewUpdate.state.selection) {
              const pos = viewUpdate.state.selection.main.head;
              const line = viewUpdate.state.doc.lineAt(pos);
              setLineCol({ line: line.number, col: pos - line.from + 1 });
            }
          }}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightActiveLine: true,
            foldGutter: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            indentOnInput: true,
          }}
        />
      </div>

      {/* Status Bar */}
      <div className="card mt-2 p-2 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span>Ln {lineCol.line}, Col {lineCol.col}</span>
          <span>{config.label}</span>
          <span>{code.split('\n').length} lines</span>
        </div>
        <div className="flex items-center gap-4">
          <span>{code.length} chars</span>
          <span>UTF-8</span>
          <span className="text-gray-600">Session only • No backend</span>
        </div>
      </div>
    </div>
  );
}
