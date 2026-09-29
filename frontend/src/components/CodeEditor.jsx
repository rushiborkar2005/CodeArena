import { useRef } from 'react';

export const CodeEditor = ({ value, onChange, language = 'javascript' }) => {
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);

  const lines = value ? value.split('\n') : [''];
  const lineCount = Math.max(lines.length, 1);

  // Sync scrolling between line numbers and code textarea
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Tab key & auto-pairing handling
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      // Insert 4 spaces for tab
      const newValue = value.substring(0, start) + '    ' + value.substring(end);
      onChange(newValue);

      // Reposition cursor
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      }, 0);
    }
  };

  return (
    <div className="code-editor-container">
      <div className="code-editor-wrapper">
        {/* Line Numbers Bar */}
        <div className="line-numbers" ref={lineNumbersRef}>
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i + 1} className="line-number">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Text Area Code Input */}
        <textarea
          ref={textareaRef}
          className="code-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          spellCheck="false"
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          placeholder="// Type your code here..."
        />
      </div>

      {/* Code Editor Status Bar */}
      <div className="editor-status-bar">
        <div className="status-left">
          <span className="lang-tag">{language.toUpperCase()}</span>
          <span className="info-text">Spaces: 4</span>
        </div>
        <div className="status-right">
          <span>Lines: {lineCount}</span>
          <span>Chars: {value?.length || 0}</span>
        </div>
      </div>
    </div>
  );
};
