import React, { useMemo } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

export default function TaskDescriptionEditor({
  value,
  onChange,
  placeholder,
  disabled
}) {
  // Modules configuration for ReactQuill
  const modules = useMemo(() => ({
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'header': 1 }, { 'header': 2 }, { 'header': 3 }],
      [{ 'list': 'bullet' }, { 'list': 'ordered' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'clean']
    ]
  }), []);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'color', 'background',
    'link'
  ];

  // We add custom CSS to make Quill look like the existing textarea design
  // without relying purely on Tailwind classes to avoid conflict with Quill internals.
  return (
    <div className={`task-description-editor ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <style>{`
        .task-description-editor {
          border-radius: 1rem;
          box-shadow: var(--shadow-apple, 0 1px 3px rgba(0,0,0,0.1));
          background-color: rgba(var(--color-surface-container-high, 243, 244, 246), 0.5);
          transition: box-shadow 0.2s ease;
          display: flex;
          flex-direction: column;
        }
        .task-description-editor:focus-within {
          box-shadow: 0 0 0 2px rgba(var(--color-primary, 99, 102, 241), 0.2);
        }
        .task-description-editor .ql-toolbar.ql-snow {
          border: none;
          border-bottom: 1px solid rgba(var(--color-outline, 156, 163, 175), 0.1);
          padding: 0.5rem;
          border-top-left-radius: 1rem;
          border-top-right-radius: 1rem;
          background-color: rgba(var(--color-surface-container-high, 243, 244, 246), 0.8);
          font-family: inherit;
        }
        .task-description-editor .ql-container.ql-snow {
          border: none;
          font-family: inherit;
          font-size: 14px;
          border-bottom-left-radius: 1rem;
          border-bottom-right-radius: 1rem;
          background-color: transparent;
          min-height: 120px;
        }
        .task-description-editor .ql-editor {
          min-height: 120px;
          padding: 1rem;
          color: rgb(var(--color-on-surface, 17, 24, 39));
        }
        .task-description-editor .ql-editor.ql-blank::before {
          color: rgba(var(--color-outline, 156, 163, 175), 0.6);
          font-style: normal;
        }
      `}</style>
      <ReactQuill
        theme="snow"
        value={value || ""}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={disabled}
      />
    </div>
  );
}
