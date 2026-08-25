import React, { useState, useEffect, useRef, useCallback } from "react";
import { BLOCK_TYPES } from "./blockTypes";
import SlashMenu from "./SlashMenu";

// Import all blocks
import TextBlock from "./blocks/TextBlock";
import HeadingBlock from "./blocks/HeadingBlock";
import TodoBlock from "./blocks/TodoBlock";
import ListBlock from "./blocks/ListBlock";
import QuoteBlock from "./blocks/QuoteBlock";
import DividerBlock from "./blocks/DividerBlock";
import CodeBlock from "./blocks/CodeBlock";
import CalloutBlock from "./blocks/CalloutBlock";
import ToggleBlock from "./blocks/ToggleBlock";
import LinkBlock from "./blocks/LinkBlock";
import ImageBlock from "./blocks/ImageBlock";
import FileBlock from "./blocks/FileBlock";
import BookmarkBlock from "./blocks/BookmarkBlock";
import EmbedBlock from "./blocks/EmbedBlock";
import TableBlock from "./blocks/TableBlock";
import ColumnsBlock from "./blocks/ColumnsBlock";
import EquationBlock from "./blocks/EquationBlock";
import DatabaseBlock from "./blocks/DatabaseBlock";
import FallbackBlock from "./blocks/FallbackBlock";

export default function BlockEditor({ page, onBack, onChange, onDelete, onDuplicate }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [blocks, setBlocks] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  
  // Slash menu state
  const [slashMenu, setSlashMenu] = useState({ show: false, query: "", position: { x: 0, y: 0 }, blockId: null });
  const [activeBlockType, setActiveBlockType] = useState(BLOCK_TYPES.TEXT);
  
  // Context menu state
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const [toast, setToast] = useState('');
  
  const stateRef = useRef({ title: "", description: "", blocks: [] });

  useEffect(() => {
    if (page) {
      setTitle(page.title || "");
      setDescription(page.description || "");
      
      let parsedBlocks = [];
      try {
        if (page.content) {
          parsedBlocks = JSON.parse(page.content);
        }
      } catch (e) {
        // Geriye uyumluluk: Eski format düz HTML ise onu text block içine al
        if (page.content) {
          parsedBlocks = [{ id: Date.now().toString(), type: BLOCK_TYPES.TEXT, content: page.content }];
        }
      }
      
      if (!parsedBlocks || parsedBlocks.length === 0) {
        parsedBlocks = [{ id: Date.now().toString(), type: BLOCK_TYPES.TEXT, content: "" }];
      }
      setBlocks(parsedBlocks);
      stateRef.current = { title: page.title || "", description: page.description || "", blocks: parsedBlocks };
    }
  }, [page?.id]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setShowMenu(false);
        setSlashMenu(s => ({ ...s, show: false }));
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const saveToBackend = useCallback((newData) => {
    setIsSaving(true);
    if (onChange) onChange(newData);
    setTimeout(() => setIsSaving(false), 500);
  }, [onChange]);

  const debouncedSave = useCallback(() => {
    saveToBackend({
      title: stateRef.current.title,
      description: stateRef.current.description,
      content: JSON.stringify(stateRef.current.blocks)
    });
  }, [saveToBackend]);

  const handleTitleBlur = () => debouncedSave();
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    stateRef.current.title = e.target.value;
  };

  const handleDescBlur = () => debouncedSave();
  const handleDescChange = (e) => {
    setDescription(e.target.value);
    stateRef.current.description = e.target.value;
  };

  // Helper for recursive block updates (e.g., inside toggle/columns)
  const updateBlockTree = (nodes, id, updates) => {
    return nodes.map(node => {
      if (node.id === id) return { ...node, ...updates };
      if (node.children) return { ...node, children: updateBlockTree(node.children, id, updates) };
      if (node.columns) {
         return { ...node, columns: node.columns.map(c => ({ ...c, children: updateBlockTree(c.children || [], id, updates) })) };
      }
      return node;
    });
  };

  const updateBlock = (id, updates) => {
    const updated = updateBlockTree(stateRef.current.blocks, id, updates);
    stateRef.current.blocks = updated;
    setBlocks(updated);
    
    // Slash menu trigger check on input
    if (updates.content !== undefined) {
      const match = updates.content.match(/(?:^|\s)\/([a-zA-Z0-9\u0131\u011F\u00FC\u015F\u00F6\u00E7\u0130\u011E\u00DC\u015E\u00D6\u00C7]*)$/);
      if (match) {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
          const rect = selection.getRangeAt(0).getBoundingClientRect();
          setSlashMenu({
            show: true,
            query: match[1],
            position: { x: rect.left, y: rect.bottom + window.scrollY + 10 },
            blockId: id
          });
        }
      } else {
        if (slashMenu.show) setSlashMenu(s => ({ ...s, show: false }));
      }
    }
    
    debouncedSave();
  };

  
  
  const findBlockDeep = (nodes, id) => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findBlockDeep(node.children, id);
        if (found) return found;
      }
      if (node.columns) {
        for (const col of node.columns) {
          const found = findBlockDeep(col.children || [], id);
          if (found) return found;
        }
      }
    }
    return null;
  };

  const deepInsert = (nodes, targetId, newBlock) => {
     let found = false;
     const result = [];
     for (const node of nodes) {
        if (node.id === targetId) {
           result.push(node);
           result.push(newBlock);
           found = true;
        } else {
           let newNode = { ...node };
           if (newNode.children) {
              const { newNodes, found: childFound } = deepInsert(newNode.children, targetId, newBlock);
              newNode.children = newNodes;
              if (childFound) found = true;
           }
           if (newNode.columns) {
              let colFound = false;
              newNode.columns = newNode.columns.map(col => {
                 const { newNodes, found: cf } = deepInsert(col.children || [], targetId, newBlock);
                 if (cf) colFound = true;
                 return { ...col, children: newNodes };
              });
              if (colFound) found = true;
           }
           result.push(newNode);
        }
     }
     return { newNodes: result, found };
  };

  const addBlockAfter = (id, type = BLOCK_TYPES.TEXT, initialContent = "") => {
    const newBlock = { id: Date.now().toString() + Math.random().toString(36).substr(2, 5), type, content: initialContent };
    
    // First try deep insert
    const { newNodes, found } = deepInsert(stateRef.current.blocks, id, newBlock);
    
    if (found) {
      stateRef.current.blocks = newNodes;
      setBlocks(newNodes);
      debouncedSave();
      
      setTimeout(() => {
        const el = document.querySelector(`[data-block-id="${newBlock.id}"]`);
        if (el) el.focus();
      }, 50);
    }
  };


  
  const deepRemove = (nodes, targetId) => {
     let found = false;
     let prevId = null;
     
     // Find prevId by flat traversal of this level
     const index = nodes.findIndex(n => n.id === targetId);
     if (index > 0) prevId = nodes[index - 1].id;
     
     const result = [];
     for (const node of nodes) {
        if (node.id === targetId) {
           found = true;
        } else {
           let newNode = { ...node };
           if (newNode.children) {
              const { newNodes, found: childFound, prevId: childPrevId } = deepRemove(newNode.children, targetId);
              newNode.children = newNodes;
              if (childFound) { found = true; if (!prevId) prevId = childPrevId || node.id; }
           }
           if (newNode.columns) {
              let colFound = false;
              newNode.columns = newNode.columns.map(col => {
                 const { newNodes, found: cf, prevId: colPrevId } = deepRemove(col.children || [], targetId);
                 if (cf) { colFound = true; if (!prevId) prevId = colPrevId || node.id; }
                 return { ...col, children: newNodes };
              });
              if (colFound) found = true;
           }
           result.push(newNode);
        }
     }
     return { newNodes: result, found, prevId };
  };

  const removeBlock = (id) => {
    if (stateRef.current.blocks.length <= 1 && stateRef.current.blocks[0].id === id) return;
    
    const { newNodes, found, prevId } = deepRemove(stateRef.current.blocks, id);
    
    if (found) {
      stateRef.current.blocks = newNodes;
      setBlocks(newNodes);
      debouncedSave();
      
      setTimeout(() => {
        if (prevId) {
          const el = document.querySelector(`[data-block-id="${prevId}"]`);
          if (el) {
            el.focus();
            const sel = window.getSelection();
            if (sel) {
              sel.selectAllChildren(el);
              sel.collapseToEnd();
            }
          }
        }
      }, 50);
    }
  };


  const onKeyDown = (e, id) => {
    if (slashMenu.show && (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter")) {
      return;
    }
    
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      
      const block = findBlockDeep(stateRef.current.blocks, id);
      const el = e.target;
      const fullText = el.innerText || "";
      
      // Feature: Enter on an empty list item escapes the list
      if (block && (block.type === BLOCK_TYPES.NUMBERED_LIST || block.type === BLOCK_TYPES.BULLET_LIST)) {
         if (fullText.trim() === "") {
            updateBlock(id, { type: BLOCK_TYPES.TEXT });
            setActiveBlockType(BLOCK_TYPES.TEXT);
            return; 
         }
      }

      // Feature: Split text based on caret position
      let textAfter = "";
      try {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          if (el.contains(range.commonAncestorContainer)) {
            const preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(el);
            preCaretRange.setEnd(range.startContainer, range.startOffset);
            const caretOffset = preCaretRange.toString().length;
            
            const textBefore = fullText.substring(0, caretOffset);
            textAfter = fullText.substring(caretOffset);
            
            if (caretOffset < fullText.length) {
              updateBlock(id, { content: textBefore });
            }
          }
        }
      } catch (err) {
        // Fallback if selection fails
      }

      addBlockAfter(id, activeBlockType, textAfter);
    } else if (e.key === "Backspace") {
      const el = e.target;
      if (el.innerText === "" || el.innerText === "\n") {
        e.preventDefault();
        removeBlock(id);
      }
    }
  };

  const handleSlashSelect = (type) => {
    setActiveBlockType(type);
    if (slashMenu.blockId) {
      updateBlock(slashMenu.blockId, { type, content: "" });
      const el = document.querySelector(`[data-block-id="${slashMenu.blockId}"]`);
      if (el) el.innerText = ""; // Clear the /query visual
    }
    setSlashMenu(s => ({ ...s, show: false }));
  };

  
  const renderBlocksGrouped = (blocksArray) => {
    const result = [];
    let currentGroup = null;

    for (let i = 0; i < blocksArray.length; i++) {
      const block = blocksArray[i];
      if (block.type === BLOCK_TYPES.NUMBERED_LIST || block.type === BLOCK_TYPES.BULLET_LIST) {
        if (!currentGroup || currentGroup.type !== block.type) {
          currentGroup = { type: block.type, isListGroup: true, items: [block], id: `group-${block.id}` };
          result.push(currentGroup);
        } else {
          currentGroup.items.push(block);
        }
      } else {
        currentGroup = null;
        result.push({ isListGroup: false, item: block });
      }
    }

    return result.map(group => {
      if (group.isListGroup) {
        const Tag = group.type === BLOCK_TYPES.NUMBERED_LIST ? "ol" : "ul";
        const listClass = group.type === BLOCK_TYPES.NUMBERED_LIST ? "list-decimal" : "list-disc marker:text-gray-400";
        return (
          <Tag key={group.id} className={`${listClass} pl-6 w-full my-1 space-y-1`}>
            {group.items.map(b => renderBlock(b, blocksArray))}
          </Tag>
        );
      } else {
        return (
          <div key={group.item.id} className="w-full">
            {renderBlock(group.item, blocksArray)}
          </div>
        );
      }
    });
  };

  const renderBlock = (block, blocksArray) => {
    const props = { block, updateBlock, onKeyDown };
    
    // For nested structures like toggle/columns
    props.renderBlocks = (childArray, parentKey) => (
      <div className="flex flex-col w-full">
        {childArray.map(cb => renderBlock(cb, childArray))}
      </div>
    );
    
    // Add placeholder to TextBlock if it's the only block
    if (block.type === BLOCK_TYPES.TEXT && blocksArray.length === 1 && stateRef.current.blocks.length === 1) {
       props.placeholder = "Yazmaya başlayın veya komutlar için '/' tuşuna basın...";
    } else if (block.type === BLOCK_TYPES.TEXT) {
       props.placeholder = " "; // small trick to keep min-height active sometimes
    }

    switch (block.type) {
      case BLOCK_TYPES.TEXT: return <TextBlock {...props} />;
      case BLOCK_TYPES.HEADING_1:
      case BLOCK_TYPES.HEADING_2:
      case BLOCK_TYPES.HEADING_3: return <HeadingBlock {...props} />;
      case BLOCK_TYPES.TODO: return <TodoBlock {...props} />;
      case BLOCK_TYPES.BULLET_LIST:
      case BLOCK_TYPES.NUMBERED_LIST: return <ListBlock {...props} />;
      case BLOCK_TYPES.QUOTE: return <QuoteBlock {...props} />;
      case BLOCK_TYPES.DIVIDER: return <DividerBlock {...props} />;
      case BLOCK_TYPES.CODE: return <CodeBlock {...props} />;
      case BLOCK_TYPES.CALLOUT: return <CalloutBlock {...props} />;
      case BLOCK_TYPES.TOGGLE: return <ToggleBlock {...props} />;
      case BLOCK_TYPES.LINK: return <LinkBlock {...props} />;
      case BLOCK_TYPES.IMAGE: return <ImageBlock {...props} />;
      case BLOCK_TYPES.FILE: return <FileBlock {...props} />;
      case BLOCK_TYPES.BOOKMARK: return <BookmarkBlock {...props} />;
      case BLOCK_TYPES.EMBED: return <EmbedBlock {...props} />;
      case BLOCK_TYPES.TABLE: return <TableBlock {...props} />;
      case BLOCK_TYPES.COLUMNS: return <ColumnsBlock {...props} />;
      case BLOCK_TYPES.EQUATION: return <EquationBlock {...props} />;
      case BLOCK_TYPES.DATABASE: return <DatabaseBlock {...props} />;
      default: return <FallbackBlock {...props} />;
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setToast('Bağlantı kopyalandı');
    setShowMenu(false);
    setTimeout(() => setToast(''), 3000);
  };

  if (!page) return null;

  return (
    <div className="w-full h-full flex flex-col bg-white relative">
      {toast && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[13px] px-4 py-2 rounded-md shadow-lg z-50">
          {toast}
        </div>
      )}
      {slashMenu.show && (
        <SlashMenu 
          query={slashMenu.query} 
          position={slashMenu.position} 
          onSelect={handleSlashSelect} 
          onClose={() => setSlashMenu(s => ({ ...s, show: false }))} 
        />
      )}
      
      <div className="h-12 border-b border-gray-100 flex items-center justify-between px-6 shrink-0 sticky top-0 bg-white/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
          <button onClick={onBack} className="hover:bg-gray-100 p-1.5 rounded-md transition-colors text-gray-500 hover:text-gray-900 flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </button>
          {isSaving && <span className="ml-2 text-[11px] text-indigo-400 font-medium flex items-center gap-1"><span className="material-symbols-outlined text-[14px] animate-spin">sync</span> Kaydediliyor...</span>}
        </div>
        
        <div className="flex items-center gap-2 relative">
           <button onClick={handleShare} className="text-[11px] font-medium text-gray-500 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-100 transition-colors">Paylaş</button>
           <div ref={menuRef} className="relative">
             <button onClick={() => setShowMenu(!showMenu)} className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors flex items-center justify-center">
               <span className="material-symbols-outlined text-[16px]">more_horiz</span>
             </button>
             {showMenu && (
               <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-100 py-1 z-50">
                 <button onClick={handleShare} className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors">
                   Paylaş
                 </button>
                 <button onClick={() => { setShowMenu(false); if(onDuplicate) onDuplicate(); }} className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors">
                   Sayfayı çoğalt
                 </button>
                 <div className="h-px bg-gray-100 my-1 w-full"></div>
                 <button onClick={() => { setShowMenu(false); if(onDelete) onDelete(); }} className="w-full text-left px-4 py-2 text-[13px] text-red-600 hover:bg-red-50 transition-colors">
                   Sayfayı sil
                 </button>
               </div>
             )}
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-[50vh]">
        <div className="w-full max-w-[900px] mx-auto py-10 px-8">
          <div className="text-[40px] mb-4 text-gray-300">
            <span className="material-symbols-outlined text-[48px]" style={{ fontVariationSettings: "'FILL' 0" }}>description</span>
          </div>
          
          <div className="mb-6">
            <input 
              type="text" 
              value={title}
              onChange={handleTitleChange}
              onBlur={handleTitleBlur}
              placeholder="İsimsiz Sayfa"
              className="w-full text-[32px] font-bold text-gray-900 border-none outline-none bg-transparent placeholder-gray-300 mb-2"
            />
            <input 
              type="text"
              value={description}
              onChange={handleDescChange}
              onBlur={handleDescBlur}
              placeholder="Açıklama ekle..."
              className="w-full text-[14px] text-gray-400 border-none outline-none bg-transparent placeholder-gray-300"
            />
          </div>

          <div className="space-y-1 mt-8">
            {renderBlocksGrouped(blocks)}
          </div>
        </div>
      </div>
    </div>
  );
}
