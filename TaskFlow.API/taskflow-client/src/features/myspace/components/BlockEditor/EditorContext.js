import { createContext, useContext } from 'react';

export const EditorContext = createContext({ readOnly: false });

export const useEditorContext = () => useContext(EditorContext);
