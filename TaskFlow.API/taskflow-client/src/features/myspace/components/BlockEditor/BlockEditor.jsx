import React, { useState, useEffect, useRef, useCallback } from "react";
import { BLOCK_TYPES } from "./blockTypes";
import SlashMenu from "./SlashMenu";
import LinkPopover from "./LinkPopover";
import FloatingToolbar from "./FloatingToolbar";
import { sanitizeHtml, stripHtml } from "../../utils/sanitizeHtml";

const RICH_TEXT_BLOCK_TYPES = [
  BLOCK_TYPES.TEXT,
  BLOCK_TYPES.HEADING_1,
  BLOCK_TYPES.HEADING_2,
  BLOCK_TYPES.HEADING_3,
  BLOCK_TYPES.QUOTE,
  BLOCK_TYPES.CALLOUT,
  BLOCK_TYPES.TOGGLE,
  BLOCK_TYPES.TODO,
  BLOCK_TYPES.BULLET_LIST,
  BLOCK_TYPES.NUMBERED_LIST,
];

const MERGEABLE_TYPES = [
  BLOCK_TYPES.TEXT,
  BLOCK_TYPES.HEADING_1,
  BLOCK_TYPES.HEADING_2,
  BLOCK_TYPES.HEADING_3,
  BLOCK_TYPES.QUOTE,
  BLOCK_TYPES.CALLOUT,
  BLOCK_TYPES.BULLET_LIST,
  BLOCK_TYPES.NUMBERED_LIST,
  BLOCK_TYPES.TODO,
];

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
import EquationBlock from "./blocks/EquationBlock";
import CanvasBlock from "./blocks/CanvasBlock";
import FallbackBlock from "./blocks/FallbackBlock";

export default function BlockEditor({
  page,
  onBack,
  onChange,
  onDelete,
  onDuplicate,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [blocks, setBlocks] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Slash menu state
  const [slashMenu, setSlashMenu] = useState({
    show: false,
    query: "",
    position: { x: 0, y: 0 },
    blockId: null,
  });
  const [activeBlockType, setActiveBlockType] = useState(BLOCK_TYPES.TEXT);
  const [linkPopover, setLinkPopover] = useState({
    show: false,
    initialUrl: "",
    hasExistingLink: false,
    position: { x: 0, y: 0, showAbove: false },
    blockId: null,
  });
  const savedRangeRef = useRef(null);
  const targetContentEditableRef = useRef(null);
  const targetBlockIdRef = useRef(null);

  // Floating selection formatting toolbar state
  const [floatingToolbar, setFloatingToolbar] = useState({
    show: false,
    position: { x: 0, y: 0 },
    activeFormats: { isBold: false, isItalic: false, isUnderline: false, isLink: false },
    blockId: null,
    contentEditableEl: null,
  });
  const selectionTimerRef = useRef(null);

  // Drag and drop state
  const [dragState, setDragState] = useState({
    draggingId: null,
    targetId: null,
    dropPosition: null, // "top" | "bottom"
  });
  const dragInfoRef = useRef(null); // { id, parentScope, block }

  // Context menu state
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const [toast, setToast] = useState("");

  const stateRef = useRef({ title: "", description: "", blocks: [] });
  const pendingFocusRef = useRef(null);

  // Undo / Redo refs
  const undoStackRef = useRef([]);
  const redoStackRef = useRef([]);
  const isUndoRedoActionRef = useRef(false);
  const contentChangeTimerRef = useRef(null);
  const typingBlockIdRef = useRef(null);
  const typingTimerRef = useRef(null);

  const [hoveredBlockId, setHoveredBlockId] = useState(null);
  const [focusedBlockId, setFocusedBlockId] = useState(null);
  const [openDropdownBlockId, setOpenDropdownBlockId] = useState(null);

  const activeMenuBlockId = openDropdownBlockId || hoveredBlockId || focusedBlockId;

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
          parsedBlocks = [
            {
              id: Date.now().toString(),
              type: BLOCK_TYPES.TEXT,
              content: page.content,
            },
          ];
        }
      }

      if (!parsedBlocks || parsedBlocks.length === 0) {
        parsedBlocks = [
          { id: Date.now().toString(), type: BLOCK_TYPES.TEXT, content: "" },
        ];
      } else {
        const checkUrlValidity = (url) => {
          if (!url) return false;
          const trimmed = url.trim();
          if (!trimmed) return false;
          let testUrl = trimmed;
          if (!/^(https?|mailto|tel|sms):/i.test(trimmed)) {
            testUrl = `https://${trimmed}`;
          }
          try {
            const parsed = new URL(testUrl);
            if (parsed.protocol === "http:" || parsed.protocol === "https:") {
              if (!parsed.hostname.includes(".") && parsed.hostname !== "localhost") {
                return false;
              }
            }
            return true;
          } catch (err) {
            return false;
          }
        };

        const normalizeLegacyData = (nodes) => {
          return nodes.map((node) => {
            let newNode = { ...node };
            if (newNode.type === BLOCK_TYPES.LINK) {
              if (newNode.url && !checkUrlValidity(newNode.url)) {
                if (!newNode.content || newNode.content.trim() === "" || newNode.content === "Bağlantı") {
                  newNode.content = newNode.url;
                  newNode.url = "";
                }
              }
            }
            if (newNode.children) newNode.children = normalizeLegacyData(newNode.children);
            return newNode;
          });
        };

        parsedBlocks = normalizeLegacyData(parsedBlocks);
      }

      setBlocks(parsedBlocks);
      stateRef.current = {
        title: page.title || "",
        description: page.description || "",
        blocks: parsedBlocks,
      };
      undoStackRef.current = [];
      redoStackRef.current = [];
      isUndoRedoActionRef.current = false;
      typingBlockIdRef.current = null;
    }
  }, [page?.id]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setShowMenu(false);
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setShowMenu(false);
        setSlashMenu((s) => ({ ...s, show: false }));
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (pendingFocusRef.current) {
      const targetId = pendingFocusRef.current;
      pendingFocusRef.current = null;

      const focusTarget = () => {
        const el = document.querySelector(`[data-block-id="${targetId}"]`) ||
                   document.querySelector(`[data-block-id="${targetId}-content"]`);
        if (el) {
          if (document.activeElement && document.activeElement !== el) {
            document.activeElement.blur?.();
          }
          el.focus();
          try {
            const selection = window.getSelection();
            if (selection) {
              const range = document.createRange();
              range.selectNodeContents(el);
              range.collapse(true);
              selection.removeAllRanges();
              selection.addRange(range);
            }
          } catch (err) {}
          return true;
        }
        return false;
      };

      if (!focusTarget()) {
        requestAnimationFrame(() => {
          if (!focusTarget()) {
            setTimeout(focusTarget, 30);
          }
        });
      }
    }
  }, [blocks]);

  const saveToBackend = useCallback(
    (newData) => {
      setIsSaving(true);
      if (onChange) onChange(newData);
      setTimeout(() => setIsSaving(false), 500);
    },
    [onChange],
  );

  const debouncedSave = useCallback(() => {
    saveToBackend({
      title: stateRef.current.title,
      description: stateRef.current.description,
      content: JSON.stringify(stateRef.current.blocks),
    });
  }, [saveToBackend]);

  const createSnapshot = useCallback(() => ({
    title: stateRef.current.title,
    description: stateRef.current.description,
    blocks: JSON.parse(JSON.stringify(stateRef.current.blocks)),
  }), []);

  const pushHistory = useCallback((customSnapshot = null) => {
    if (isUndoRedoActionRef.current) return;

    const snap = customSnapshot || createSnapshot();

    const last = undoStackRef.current[undoStackRef.current.length - 1];
    if (last && JSON.stringify(last.blocks) === JSON.stringify(snap.blocks)) {
      return;
    }

    undoStackRef.current.push(snap);
    if (undoStackRef.current.length > 50) {
      undoStackRef.current.shift();
    }

    // New change clears the redo stack
    redoStackRef.current = [];
  }, [createSnapshot]);

  const undo = useCallback(() => {
    if (undoStackRef.current.length === 0) return;

    const currentState = createSnapshot();
    const previousState = undoStackRef.current.pop();
    if (!previousState) return;

    redoStackRef.current.push(currentState);
    if (redoStackRef.current.length > 50) {
      redoStackRef.current.shift();
    }

    isUndoRedoActionRef.current = true;
    typingBlockIdRef.current = null;

    stateRef.current.blocks = previousState.blocks;
    setBlocks(previousState.blocks);

    debouncedSave();

    setTimeout(() => {
      isUndoRedoActionRef.current = false;
    }, 100);
  }, [createSnapshot, debouncedSave]);

  const redo = useCallback(() => {
    if (redoStackRef.current.length === 0) return;

    const currentState = createSnapshot();
    const nextState = redoStackRef.current.pop();
    if (!nextState) return;

    undoStackRef.current.push(currentState);
    if (undoStackRef.current.length > 50) {
      undoStackRef.current.shift();
    }

    isUndoRedoActionRef.current = true;
    typingBlockIdRef.current = null;

    stateRef.current.blocks = nextState.blocks;
    setBlocks(nextState.blocks);

    debouncedSave();

    setTimeout(() => {
      isUndoRedoActionRef.current = false;
    }, 100);
  }, [createSnapshot, debouncedSave]);

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      const isMac =
        typeof navigator !== "undefined" &&
        /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);
      const isUndo =
        (isMac ? e.metaKey : e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === "z";
      const isRedo =
        ((isMac ? e.metaKey : e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "z") ||
        (!isMac && e.ctrlKey && e.key.toLowerCase() === "y");

      if (!isUndo && !isRedo) return;

      const activeEl = document.activeElement;

      // 1. If inside an input, textarea, or advanced block input:
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.getAttribute("data-advanced-input") === "true" ||
          activeEl.closest?.('[data-advanced-input="true"]'))
      ) {
        // Do NOT prevent default: let the native input undo/redo handle it without interruption
        return;
      }

      // 2. If in a ContentEditable that has active typing in the current session:
      if (activeEl && activeEl.isContentEditable) {
        const blockId = activeEl.getAttribute("data-block-id");
        if (blockId && typingBlockIdRef.current === blockId) {
          // Let the browser's native text undo handle it
          return;
        }
      }

      // 3. Otherwise, perform global block-level Undo / Redo
      e.preventDefault();
      if (slashMenu.show) setSlashMenu((s) => ({ ...s, show: false }));

      if (isUndo) {
        undo();
      } else if (isRedo) {
        redo();
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, [undo, redo, slashMenu.show]);

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

  // Helper for recursive block updates (e.g., inside toggle)
  const updateBlockTree = (nodes, id, updates) => {
    return nodes.map((node) => {
      if (node.id === id) return { ...node, ...updates };
      if (node.children)
        return {
          ...node,
          children: updateBlockTree(node.children, id, updates),
        };
      return node;
    });
  };

  const updateBlock = (id, updates) => {
    if (updates.type !== undefined) {
      pushHistory();
    } else if (
      updates.content !== undefined ||
      updates.title !== undefined ||
      updates.url !== undefined ||
      updates.elements !== undefined ||
      updates.width !== undefined ||
      updates.height !== undefined
    ) {
      if (!contentChangeTimerRef.current) {
        pushHistory();
      }
      clearTimeout(contentChangeTimerRef.current);
      contentChangeTimerRef.current = setTimeout(() => {
        contentChangeTimerRef.current = null;
      }, 800);

      typingBlockIdRef.current = id;
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        typingBlockIdRef.current = null;
      }, 1000);
    }

    const updated = updateBlockTree(stateRef.current.blocks, id, updates);
    stateRef.current.blocks = updated;
    setBlocks(updated);

    // Slash menu trigger check on input
    if (updates.content !== undefined) {
      const currentBlock = findBlockDeep(stateRef.current.blocks, id);
      
      const activeEl = document.activeElement;
      const isAdvancedInput =
        activeEl &&
        (activeEl.getAttribute("data-advanced-input") === "true" ||
         activeEl.closest?.('[data-advanced-input="true"]'));

      const isCodeBlock = currentBlock && currentBlock.type === BLOCK_TYPES.CODE;

      if (isAdvancedInput) {
        // Do not trigger slash menu for advanced block inputs
        if (slashMenu.show) setSlashMenu((s) => ({ ...s, show: false }));
      } else if (isCodeBlock) {
        const match = updates.content.match(
          /(?:^|\n)[ \t]*\/([a-zA-Z0-9\u0131\u011F\u00FC\u015F\u00F6\u00E7\u0130\u011E\u00DC\u015E\u00D6\u00C7]*)$/,
        );
        if (match) {
          const selection = window.getSelection();
          let position = { x: 0, y: 0 };
          if (selection && selection.rangeCount > 0) {
            const rect = selection.getRangeAt(0).getBoundingClientRect();
            if (rect.width > 0 || rect.height > 0 || rect.top > 0) {
              position = { x: rect.left, y: rect.bottom + 8, caretTop: rect.top };
            } else if (activeEl) {
              const elRect = activeEl.getBoundingClientRect();
              position = { x: elRect.left, y: elRect.bottom + 8, caretTop: elRect.top };
            }
          } else if (activeEl) {
            const elRect = activeEl.getBoundingClientRect();
            position = { x: elRect.left, y: elRect.bottom + 8, caretTop: elRect.top };
          }
          setSlashMenu({
            show: true,
            query: match[1],
            position,
            blockId: id,
          });
        } else {
          if (slashMenu.show) setSlashMenu((s) => ({ ...s, show: false }));
        }
      } else {
        const plainText = stripHtml(updates.content);
        const match = plainText.match(
          /(?:^|\s)\/([a-zA-Z0-9\u0131\u011F\u00FC\u015F\u00F6\u00E7\u0130\u011E\u00DC\u015E\u00D6\u00C7]*)$/,
        );
        if (match) {
          const selection = window.getSelection();
          let position = { x: 0, y: 0 };
          if (selection && selection.rangeCount > 0) {
            const rect = selection.getRangeAt(0).getBoundingClientRect();
            if (rect.width > 0 || rect.height > 0 || rect.top > 0) {
              position = { x: rect.left, y: rect.bottom + 8, caretTop: rect.top };
            } else if (activeEl) {
              const elRect = activeEl.getBoundingClientRect();
              position = { x: elRect.left, y: elRect.bottom + 8, caretTop: elRect.top };
            }
          } else if (activeEl) {
            const elRect = activeEl.getBoundingClientRect();
            position = { x: elRect.left, y: elRect.bottom + 8, caretTop: elRect.top };
          }
          setSlashMenu({
            show: true,
            query: match[1],
            position,
            blockId: id,
          });
        } else {
          if (slashMenu.show) setSlashMenu((s) => ({ ...s, show: false }));
        }
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
    }
    return null;
  };

  const handleApplyLink = (url) => {
    const range = savedRangeRef.current;
    const contentEditableEl = targetContentEditableRef.current;
    const blockId = targetBlockIdRef.current;

    setLinkPopover((prev) => ({ ...prev, show: false }));

    if (!range || !contentEditableEl || !blockId) return;

    const trimmedUrl = (url || "").trim();
    if (!trimmedUrl) {
      handleUnlink();
      return;
    }

    if (/^(javascript|data|vbscript):/i.test(trimmedUrl)) {
      return;
    }

    let formattedUrl = trimmedUrl;
    if (!/^https?:\/\//i.test(formattedUrl) && !/^mailto:/i.test(formattedUrl)) {
      formattedUrl = "https://" + formattedUrl;
    }

    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    pushHistory();
    clearTimeout(contentChangeTimerRef.current);
    contentChangeTimerRef.current = null;
    typingBlockIdRef.current = null;

    document.execCommand("createLink", false, formattedUrl);

    const links = contentEditableEl.querySelectorAll("a");
    links.forEach((a) => {
      if (a.getAttribute("href") === formattedUrl) {
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "noopener noreferrer");
      }
    });

    const sanitized = sanitizeHtml(contentEditableEl.innerHTML);
    updateBlock(blockId, { content: sanitized });
    debouncedSave();

    contentEditableEl.focus();
    setTimeout(() => {
      updateFloatingToolbar();
    }, 50);
  };

  const handleUnlink = () => {
    const range = savedRangeRef.current;
    const contentEditableEl = targetContentEditableRef.current;
    const blockId = targetBlockIdRef.current;

    setLinkPopover((prev) => ({ ...prev, show: false }));

    if (!range || !contentEditableEl || !blockId) return;

    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    pushHistory();
    clearTimeout(contentChangeTimerRef.current);
    contentChangeTimerRef.current = null;
    typingBlockIdRef.current = null;

    document.execCommand("unlink", false, null);

    const sanitized = sanitizeHtml(contentEditableEl.innerHTML);
    updateBlock(blockId, { content: sanitized });
    debouncedSave();

    contentEditableEl.focus();
    setTimeout(() => {
      updateFloatingToolbar();
    }, 50);
  };

  const updateFloatingToolbar = useCallback(() => {
    if (slashMenu.show || linkPopover.show || openDropdownBlockId) {
      setFloatingToolbar((prev) => (prev.show ? { ...prev, show: false } : prev));
      return;
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      setFloatingToolbar((prev) => (prev.show ? { ...prev, show: false } : prev));
      return;
    }

    const selectedText = selection.toString();
    if (!selectedText || selectedText.trim().length === 0) {
      setFloatingToolbar((prev) => (prev.show ? { ...prev, show: false } : prev));
      return;
    }

    const range = selection.getRangeAt(0);
    const anchorNode = selection.anchorNode;
    const el =
      anchorNode?.nodeType === Node.ELEMENT_NODE
        ? anchorNode
        : anchorNode?.parentElement;
    const contentEditableEl = el?.closest?.('[contenteditable="true"]');
    if (!contentEditableEl) {
      setFloatingToolbar((prev) => (prev.show ? { ...prev, show: false } : prev));
      return;
    }

    if (
      contentEditableEl.getAttribute("data-advanced-input") === "true" ||
      contentEditableEl.closest?.('[data-advanced-input="true"]') ||
      contentEditableEl.closest?.('[data-canvas-root="true"]') ||
      document.activeElement?.tagName === "INPUT" ||
      document.activeElement?.tagName === "TEXTAREA"
    ) {
      setFloatingToolbar((prev) => (prev.show ? { ...prev, show: false } : prev));
      return;
    }

    const blockId =
      contentEditableEl.getAttribute("data-block-id")?.replace("-content", "") ||
      contentEditableEl.closest?.("[data-block-id]")?.getAttribute("data-block-id");
    if (!blockId) {
      setFloatingToolbar((prev) => (prev.show ? { ...prev, show: false } : prev));
      return;
    }

    const block = findBlockDeep(stateRef.current.blocks, blockId);
    if (!block || !RICH_TEXT_BLOCK_TYPES.includes(block.type)) {
      setFloatingToolbar((prev) => (prev.show ? { ...prev, show: false } : prev));
      return;
    }

    const rect = range.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      setFloatingToolbar((prev) => (prev.show ? { ...prev, show: false } : prev));
      return;
    }

    let isBold = false;
    let isItalic = false;
    let isUnderline = false;
    let isLink = false;
    try {
      isBold = document.queryCommandState("bold");
      isItalic = document.queryCommandState("italic");
      isUnderline = document.queryCommandState("underline");

      let n = selection.anchorNode;
      while (n && n !== contentEditableEl) {
        if (n.tagName === "A") {
          isLink = true;
          break;
        }
        n = n.parentElement;
      }
    } catch (err) {}

    const toolbarWidth = 145;
    const toolbarHeight = 36;
    let left = rect.left + rect.width / 2 - toolbarWidth / 2;
    left = Math.max(16, Math.min(window.innerWidth - toolbarWidth - 16, left));

    let top = rect.top - toolbarHeight - 8;
    if (top < 10) {
      top = rect.bottom + 8;
    }

    setFloatingToolbar({
      show: true,
      position: { x: Math.round(left), y: Math.round(top) },
      activeFormats: { isBold, isItalic, isUnderline, isLink },
      blockId,
      contentEditableEl,
    });
  }, [slashMenu.show, linkPopover.show, openDropdownBlockId]);

  const applyFormat = useCallback(
    (formatType) => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;

      const contentEditableEl =
        floatingToolbar.contentEditableEl ||
        document.activeElement?.closest?.('[contenteditable="true"]');
      const blockId = floatingToolbar.blockId;
      if (!contentEditableEl || !blockId) return;

      pushHistory();
      clearTimeout(contentChangeTimerRef.current);
      contentChangeTimerRef.current = null;
      typingBlockIdRef.current = null;

      document.execCommand(formatType, false, null);

      const sanitized = sanitizeHtml(contentEditableEl.innerHTML);
      updateBlock(blockId, { content: sanitized });
      debouncedSave();

      setTimeout(() => {
        updateFloatingToolbar();
      }, 20);
    },
    [floatingToolbar.contentEditableEl, floatingToolbar.blockId, pushHistory, debouncedSave, updateFloatingToolbar]
  );

  const handleToolbarFormat = useCallback(
    (formatType) => {
      if (formatType === "link") {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;

        const range = selection.getRangeAt(0);
        savedRangeRef.current = range.cloneRange();
        const contentEditableEl =
          floatingToolbar.contentEditableEl ||
          selection.anchorNode?.parentElement?.closest?.('[contenteditable="true"]');
        const blockId = floatingToolbar.blockId;
        if (!contentEditableEl || !blockId) return;

        targetContentEditableRef.current = contentEditableEl;
        targetBlockIdRef.current = blockId;

        let existingLink = null;
        let n = selection.anchorNode;
        while (n && n !== contentEditableEl) {
          if (n.tagName === "A") {
            existingLink = n;
            break;
          }
          n = n.parentElement;
        }

        const initialUrl = existingLink ? existingLink.getAttribute("href") || "" : "";
        const rect = range.getBoundingClientRect();
        const position = {
          x: Math.max(10, Math.min(window.innerWidth - 330, rect.left)),
          y: rect.bottom + 8,
          showAbove: rect.bottom + 140 > window.innerHeight,
        };

        setFloatingToolbar((prev) => ({ ...prev, show: false }));

        setLinkPopover({
          show: true,
          initialUrl,
          hasExistingLink: !!existingLink,
          position,
          blockId,
        });
        return;
      }

      applyFormat(formatType);
    },
    [floatingToolbar.contentEditableEl, floatingToolbar.blockId, applyFormat]
  );

  useEffect(() => {
    const handleSelectionChange = () => {
      if (selectionTimerRef.current) cancelAnimationFrame(selectionTimerRef.current);
      selectionTimerRef.current = requestAnimationFrame(updateFloatingToolbar);
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    document.addEventListener("mouseup", handleSelectionChange);
    document.addEventListener("keyup", handleSelectionChange);

    return () => {
      if (selectionTimerRef.current) cancelAnimationFrame(selectionTimerRef.current);
      document.removeEventListener("selectionchange", handleSelectionChange);
      document.removeEventListener("mouseup", handleSelectionChange);
      document.removeEventListener("keyup", handleSelectionChange);
    };
  }, [updateFloatingToolbar]);

  useEffect(() => {
    const handleRichTextKeyDown = (e) => {
      const isMac =
        typeof navigator !== "undefined" &&
        /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      if (e.key === "Escape") {
        setFloatingToolbar((prev) => (prev.show ? { ...prev, show: false } : prev));
        return;
      }

      const key = e.key.toLowerCase();
      const isBold = key === "b";
      const isItalic = key === "i";
      const isUnderline = key === "u";
      const isLink = key === "k";

      if (!isBold && !isItalic && !isUnderline && !isLink) return;

      // 1. Get current selection
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      // 2. Selection must NOT be collapsed (must have selected text)
      if (selection.isCollapsed) return;

      // 3. Selection must be inside an eligible ContentEditable element
      const anchorNode = selection.anchorNode;
      const el =
        anchorNode?.nodeType === Node.ELEMENT_NODE
          ? anchorNode
          : anchorNode?.parentElement;
      const contentEditableEl = el?.closest?.('[contenteditable="true"]');
      if (!contentEditableEl) return;

      // 4. Ineligible if advanced input or inside input/textarea
      if (
        contentEditableEl.getAttribute("data-advanced-input") === "true" ||
        contentEditableEl.closest?.('[data-advanced-input="true"]') ||
        contentEditableEl.closest?.('[data-canvas-root="true"]') ||
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      // 5. Block type must be in RICH_TEXT_BLOCK_TYPES
      const blockId =
        contentEditableEl.getAttribute("data-block-id")?.replace("-content", "") ||
        contentEditableEl.closest?.("[data-block-id]")?.getAttribute("data-block-id");
      if (!blockId) return;

      const block = findBlockDeep(stateRef.current.blocks, blockId);
      if (!block || !RICH_TEXT_BLOCK_TYPES.includes(block.type)) return;

      // Valid rich text action on selected text
      e.preventDefault();

      if (isLink) {
        const range = selection.getRangeAt(0);
        savedRangeRef.current = range.cloneRange();
        targetContentEditableRef.current = contentEditableEl;
        targetBlockIdRef.current = blockId;

        // Check if selection is already inside an <a> tag
        let existingLink = null;
        let n = selection.anchorNode;
        while (n && n !== contentEditableEl) {
          if (n.tagName === "A") {
            existingLink = n;
            break;
          }
          n = n.parentElement;
        }

        const initialUrl = existingLink ? existingLink.getAttribute("href") || "" : "";
        const rect = range.getBoundingClientRect();
        const position = {
          x: Math.max(10, Math.min(window.innerWidth - 330, rect.left)),
          y: rect.bottom + 8,
          showAbove: rect.bottom + 140 > window.innerHeight,
        };

        setFloatingToolbar((prev) => ({ ...prev, show: false }));

        setLinkPopover({
          show: true,
          initialUrl,
          hasExistingLink: !!existingLink,
          position,
          blockId,
        });
        return;
      }

      // Formatting flow (Bold, Italic, Underline)
      pushHistory();
      clearTimeout(contentChangeTimerRef.current);
      contentChangeTimerRef.current = null;
      typingBlockIdRef.current = null;

      if (isBold) document.execCommand("bold", false, null);
      if (isItalic) document.execCommand("italic", false, null);
      if (isUnderline) document.execCommand("underline", false, null);

      const sanitized = sanitizeHtml(contentEditableEl.innerHTML);
      updateBlock(blockId, { content: sanitized });
      debouncedSave();

      setTimeout(() => {
        updateFloatingToolbar();
      }, 20);
    };

    document.addEventListener("keydown", handleRichTextKeyDown);
    return () => document.removeEventListener("keydown", handleRichTextKeyDown);
  }, [debouncedSave, pushHistory, updateFloatingToolbar]);

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
          const { newNodes, found: childFound } = deepInsert(
            newNode.children,
            targetId,
            newBlock,
          );
          newNode.children = newNodes;
          if (childFound) found = true;
        }
        result.push(newNode);
      }
    }
    return { newNodes: result, found };
  };

  const addBlockAfter = (id, type = BLOCK_TYPES.TEXT, initialContent = "") => {
    pushHistory();
    clearTimeout(contentChangeTimerRef.current);
    contentChangeTimerRef.current = null;
    typingBlockIdRef.current = null;

    const newBlock = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      type,
      content: initialContent,
    };

    // First try deep insert
    const { newNodes, found } = deepInsert(
      stateRef.current.blocks,
      id,
      newBlock,
    );

    if (found) {
      if (document.activeElement && typeof document.activeElement.blur === "function") {
        document.activeElement.blur();
      }

      stateRef.current.blocks = newNodes;
      setBlocks(newNodes);
      debouncedSave();
      setActiveBlockType(BLOCK_TYPES.TEXT);

      pendingFocusRef.current = newBlock.id;

      const focusTarget = () => {
        const el = document.querySelector(`[data-block-id="${newBlock.id}"]`) ||
                   document.querySelector(`[data-block-id="${newBlock.id}-content"]`);
        if (el) {
          if (document.activeElement && document.activeElement !== el) {
            document.activeElement.blur?.();
          }
          el.focus();
          try {
            const selection = window.getSelection();
            if (selection) {
              const range = document.createRange();
              range.selectNodeContents(el);
              range.collapse(true);
              selection.removeAllRanges();
              selection.addRange(range);
            }
          } catch (err) {}
          return true;
        }
        return false;
      };

      setTimeout(focusTarget, 30);
      setTimeout(focusTarget, 80);

      return newBlock.id;
    }
    
    return null;
  };

  const insertDividerSequence = (id, textBeforeDivider) => {
    pushHistory();
    clearTimeout(contentChangeTimerRef.current);
    contentChangeTimerRef.current = null;
    typingBlockIdRef.current = null;

    const dividerBlock = {
      id: Date.now().toString() + "-div",
      type: BLOCK_TYPES.DIVIDER,
      content: "",
    };
    const newTextBlock = {
      id: Date.now().toString() + "-txt",
      type: BLOCK_TYPES.TEXT,
      content: "",
    };

    let found = false;
    
    const recursiveInsert = (nodes) => {
      const res = [];
      for (const node of nodes) {
        if (node.id === id) {
           if (node.type === BLOCK_TYPES.TEXT && textBeforeDivider.trim() === "") {
               // Replace empty text block with Divider
               res.push(dividerBlock);
               res.push(newTextBlock);
               found = true;
           } else {
               // Keep current block, append Divider, append Text
               const updatedNode = { ...node, content: textBeforeDivider };
               res.push(updatedNode);
               res.push(dividerBlock);
               res.push(newTextBlock);
               found = true;
           }
        } else {
           let newNode = { ...node };
           if (newNode.children) newNode.children = recursiveInsert(newNode.children);
           res.push(newNode);
        }
      }
      return res;
    };

    const newNodes = recursiveInsert(stateRef.current.blocks);

    if (found) {
      stateRef.current.blocks = newNodes;
      setBlocks(newNodes);
      debouncedSave();

      setTimeout(() => {
        const el = document.querySelector(`[data-block-id="${newTextBlock.id}"]`);
        if (el) {
          el.focus();
          try {
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(el);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
          } catch (err) {}
        }
      }, 50);
      
      return newTextBlock.id;
    }
    return null;
  };


  const deepRemove = (nodes, targetId) => {
    let found = false;
    let prevId = null;

    // Find prevId by flat traversal of this level
    const index = nodes.findIndex((n) => n.id === targetId);
    if (index > 0) prevId = nodes[index - 1].id;

    const result = [];
    for (const node of nodes) {
      if (node.id === targetId) {
        found = true;
      } else {
        let newNode = { ...node };
        if (newNode.children) {
          const {
            newNodes,
            found: childFound,
            prevId: childPrevId,
          } = deepRemove(newNode.children, targetId);
          newNode.children = newNodes;
          if (childFound) {
            found = true;
            if (!prevId) prevId = childPrevId || node.id;
          }
        }
        result.push(newNode);
      }
    }
    return { newNodes: result, found, prevId };
  };

  const removeBlock = (id) => {
    pushHistory();
    clearTimeout(contentChangeTimerRef.current);
    contentChangeTimerRef.current = null;
    typingBlockIdRef.current = null;

    // 1. Find all block IDs in order to easily determine next/prev
    const allIds = [];
    const traverse = (nodes) => {
      for (const n of nodes) {
        allIds.push(n.id);
        if (n.children) traverse(n.children);
      }
    };
    traverse(stateRef.current.blocks);

    const index = allIds.indexOf(id);
    let targetFocusId = null;
    
    if (index !== -1) {
      if (index < allIds.length - 1) {
        targetFocusId = allIds[index + 1];
      } else if (index > 0) {
        targetFocusId = allIds[index - 1];
      }
    }

    let { newNodes, found } = deepRemove(stateRef.current.blocks, id);

    if (found) {
      if (newNodes.length === 0) {
        const fallbackBlock = { id: Date.now().toString(), type: BLOCK_TYPES.TEXT, content: "" };
        newNodes = [fallbackBlock];
        targetFocusId = fallbackBlock.id;
      }

      stateRef.current.blocks = newNodes;
      setBlocks(newNodes);
      debouncedSave();

      setTimeout(() => {
        if (targetFocusId) {
          let el = document.querySelector(`[data-block-id="${targetFocusId}-content"]`) || 
                   document.querySelector(`[data-block-id="${targetFocusId}"]`);
          if (el) {
            el.focus();
            const sel = window.getSelection();
            if (sel && el.isContentEditable) {
              sel.selectAllChildren(el);
              sel.collapseToEnd();
            }
          }
        }
      }, 50);
    }
  };

  const duplicateBlock = (id) => {
    const originalBlock = findBlockDeep(stateRef.current.blocks, id);
    if (!originalBlock) return;

    pushHistory();
    clearTimeout(contentChangeTimerRef.current);
    contentChangeTimerRef.current = null;
    typingBlockIdRef.current = null;

    const generateNewIds = (block) => {
      const newBlock = { ...block, id: Date.now().toString() + Math.random().toString(36).substr(2, 9) };
      if (newBlock.children) {
        newBlock.children = newBlock.children.map(generateNewIds);
      }
      return newBlock;
    };

    // Deep clone to ensure unlinked object references
    const clonedData = JSON.parse(JSON.stringify(originalBlock));
    const duplicatedBlock = generateNewIds(clonedData);

    const { newNodes, found } = deepInsert(stateRef.current.blocks, id, duplicatedBlock);
    
    if (found) {
      stateRef.current.blocks = newNodes;
      setBlocks(newNodes);
      debouncedSave();

      setTimeout(() => {
        let el = document.querySelector(`[data-block-id="${duplicatedBlock.id}-content"]`) || 
                 document.querySelector(`[data-block-id="${duplicatedBlock.id}"]`);
        if (el) {
          el.focus();
          const sel = window.getSelection();
          if (sel && el.isContentEditable) {
            sel.selectAllChildren(el);
            sel.collapseToEnd();
          }
        }
      }, 50);
    }
  };

  const findSiblingContext = (nodes, targetId) => {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].id === targetId) {
        return {
          siblings: nodes,
          index: i,
          prev: i > 0 ? nodes[i - 1] : null,
          next: i < nodes.length - 1 ? nodes[i + 1] : null,
        };
      }
      if (nodes[i].children) {
        const res = findSiblingContext(nodes[i].children, targetId);
        if (res) return res;
      }
    }
    return null;
  };

  const isCaretOnFirstLine = (el) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !sel.isCollapsed) return false;
    const range = sel.getRangeAt(0);

    if (!el.contains(range.commonAncestorContainer)) return false;

    const preRange = range.cloneRange();
    preRange.selectNodeContents(el);
    preRange.setEnd(range.startContainer, range.startOffset);

    if (preRange.toString().length === 0) return true;

    const preRects = preRange.getClientRects();
    if (preRects.length <= 1) return true;

    const caretRect = range.getBoundingClientRect();
    const firstRect = preRects[0];
    if (caretRect && firstRect) {
      return Math.abs(caretRect.top - firstRect.top) < 6;
    }
    return false;
  };

  const isCaretOnLastLine = (el) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !sel.isCollapsed) return false;
    const range = sel.getRangeAt(0);

    if (!el.contains(range.commonAncestorContainer)) return false;

    const postRange = range.cloneRange();
    postRange.selectNodeContents(el);
    postRange.setStart(range.endContainer, range.endOffset);

    if (postRange.toString().length === 0) return true;

    const postRects = postRange.getClientRects();
    if (postRects.length <= 1) return true;

    const caretRect = range.getBoundingClientRect();
    const lastRect = postRects[postRects.length - 1];
    if (caretRect && lastRect) {
      return Math.abs(caretRect.bottom - lastRect.bottom) < 6;
    }
    return false;
  };

  const setCaretAtHorizontalPosition = (targetEl, x, isBottomLine) => {
    if (!targetEl) return;
    targetEl.focus();

    const targetRect = targetEl.getBoundingClientRect();
    const sampleY = isBottomLine
      ? Math.max(targetRect.top + 2, targetRect.bottom - 6)
      : Math.min(targetRect.bottom - 2, targetRect.top + 6);
    const sampleX = Math.max(targetRect.left + 2, Math.min(targetRect.right - 2, x));

    let placed = false;
    if (document.caretRangeFromPoint) {
      try {
        const range = document.caretRangeFromPoint(sampleX, sampleY);
        if (range && targetEl.contains(range.startContainer)) {
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
          placed = true;
        }
      } catch (err) {}
    } else if (document.caretPositionFromPoint) {
      try {
        const pos = document.caretPositionFromPoint(sampleX, sampleY);
        if (pos && targetEl.contains(pos.offsetNode)) {
          const range = document.createRange();
          range.setStart(pos.offsetNode, pos.offset);
          range.collapse(true);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
          placed = true;
        }
      } catch (err) {}
    }

    if (!placed) {
      const sel = window.getSelection();
      if (sel) {
        sel.selectAllChildren(targetEl);
        if (isBottomLine) {
          sel.collapseToEnd();
        } else {
          sel.collapseToStart();
        }
      }
    }
  };

  const setCaretAtTextOffset = (el, targetOffset) => {
    if (!el) return;
    el.focus();

    const sel = window.getSelection();
    if (!sel) return;

    let currentOffset = 0;
    let targetNode = null;
    let nodeOffset = 0;

    const walk = (node) => {
      if (targetNode) return;
      if (node.nodeType === Node.TEXT_NODE) {
        const len = node.textContent.length;
        if (currentOffset + len >= targetOffset) {
          targetNode = node;
          nodeOffset = targetOffset - currentOffset;
          return;
        }
        currentOffset += len;
      } else {
        for (let i = 0; i < node.childNodes.length; i++) {
          walk(node.childNodes[i]);
          if (targetNode) return;
        }
      }
    };

    walk(el);

    if (targetNode) {
      const range = document.createRange();
      range.setStart(targetNode, Math.min(nodeOffset, targetNode.textContent.length));
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      sel.selectAllChildren(el);
      sel.collapseToEnd();
    }
  };

  const onKeyDown = (e, id) => {
    // Ignore any events originating from inside CanvasBlock
    if (e.target.closest?.('[data-canvas-root="true"]')) {
      return;
    }

    if (
      slashMenu.show &&
      (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter")
    ) {
      return;
    }

    const el = e.target;
    const isSpecialInput =
      !el.isContentEditable ||
      el.getAttribute("data-advanced-input") === "true" ||
      el.closest?.('[data-advanced-input="true"]') ||
      el.tagName === "INPUT" ||
      el.tagName === "TEXTAREA";

    // 1. ArrowUp Navigation between blocks
    if (e.key === "ArrowUp" && !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
      if (!isSpecialInput && isCaretOnFirstLine(el)) {
        const ctx = findSiblingContext(stateRef.current.blocks, id);
        if (ctx && ctx.prev) {
          const prevBlock = ctx.prev;
          const prevEl =
            document.querySelector(`[data-block-id="${prevBlock.id}-content"]`) ||
            document.querySelector(`[data-block-id="${prevBlock.id}"]`);

          if (prevEl && prevEl.isContentEditable) {
            e.preventDefault();
            const sel = window.getSelection();
            const caretX =
              sel?.rangeCount > 0
                ? sel.getRangeAt(0).getBoundingClientRect().left
                : 0;
            setCaretAtHorizontalPosition(prevEl, caretX, true);
            return;
          }
        }
      }
    }

    // 2. ArrowDown Navigation between blocks
    if (e.key === "ArrowDown" && !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
      if (!isSpecialInput && isCaretOnLastLine(el)) {
        const ctx = findSiblingContext(stateRef.current.blocks, id);
        if (ctx && ctx.next) {
          const nextBlock = ctx.next;
          const nextEl =
            document.querySelector(`[data-block-id="${nextBlock.id}-content"]`) ||
            document.querySelector(`[data-block-id="${nextBlock.id}"]`);

          if (nextEl && nextEl.isContentEditable) {
            e.preventDefault();
            const sel = window.getSelection();
            const caretX =
              sel?.rangeCount > 0
                ? sel.getRangeAt(0).getBoundingClientRect().left
                : 0;
            setCaretAtHorizontalPosition(nextEl, caretX, false);
            return;
          }
        }
      }
    }

    // 3. Enter key (PRESERVED IN FULL)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      const block = findBlockDeep(stateRef.current.blocks, id);
      if (!block) return;

      const fullText = el.innerText || "";

      // Feature: Enter on an empty list item escapes the list
      if (
        block.type === BLOCK_TYPES.NUMBERED_LIST ||
        block.type === BLOCK_TYPES.BULLET_LIST
      ) {
        if (fullText.trim() === "") {
          updateBlock(id, { type: BLOCK_TYPES.TEXT });
          setActiveBlockType(BLOCK_TYPES.TEXT);
          return;
        }
      }

      // If continuing an active list or todo, keep that type; for ALL other blocks (especially advanced blocks) create TEXT
      const isList =
        block.type === BLOCK_TYPES.NUMBERED_LIST ||
        block.type === BLOCK_TYPES.BULLET_LIST ||
        block.type === BLOCK_TYPES.TODO;
      const nextType = isList ? block.type : BLOCK_TYPES.TEXT;

      let textAfter = "";
      const isSplittableText =
        block.type === BLOCK_TYPES.TEXT ||
        block.type === BLOCK_TYPES.HEADING_1 ||
        block.type === BLOCK_TYPES.HEADING_2 ||
        block.type === BLOCK_TYPES.HEADING_3 ||
        block.type === BLOCK_TYPES.QUOTE ||
        block.type === BLOCK_TYPES.BULLET_LIST ||
        block.type === BLOCK_TYPES.NUMBERED_LIST ||
        block.type === BLOCK_TYPES.TODO;

      if (isSplittableText && el.isContentEditable) {
        try {
          const selection = window.getSelection();
          const isUrlInput =
            el.getAttribute("data-field") === "url" ||
            el.getAttribute("data-block-id")?.endsWith("-url");
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            if (el.contains(range.commonAncestorContainer)) {
              if (!isUrlInput) {
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
          }
        } catch (err) {
          // Fallback if selection fails
        }
      }

      if (document.activeElement && typeof document.activeElement.blur === "function") {
        document.activeElement.blur();
      }

      // Feature: Enter on an open Toggle block creates the first child inside the toggle
      if (block.type === BLOCK_TYPES.TOGGLE && block.isOpen !== false) {
        const newBlock = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          type: BLOCK_TYPES.TEXT,
          content: textAfter || "",
        };
        const currentChildren = block.children || [];
        const newChildren = [newBlock, ...currentChildren];

        pushHistory();
        clearTimeout(contentChangeTimerRef.current);
        contentChangeTimerRef.current = null;
        typingBlockIdRef.current = null;

        const updated = updateBlockTree(stateRef.current.blocks, id, {
          children: newChildren,
        });
        stateRef.current.blocks = updated;
        setBlocks(updated);
        debouncedSave();
        setActiveBlockType(BLOCK_TYPES.TEXT);

        setTimeout(() => {
          const newEl =
            document.querySelector(`[data-block-id="${newBlock.id}-content"]`) ||
            document.querySelector(`[data-block-id="${newBlock.id}"]`);
          if (newEl) {
            newEl.focus();
            try {
              const sel = window.getSelection();
              if (sel && newEl.isContentEditable) {
                sel.selectAllChildren(newEl);
                sel.collapseToStart();
              }
            } catch (err) {}
          }
        }, 50);
        return;
      }

      setActiveBlockType(BLOCK_TYPES.TEXT);
      addBlockAfter(id, nextType, textAfter);
      return;
    }

    // 4. Backspace / Delete
    if (e.key === "Backspace" || e.key === "Delete") {
      // If the target is the block wrapper itself (user selected the block externally, NOT typing inside ContentEditable)
      if (!el.isContentEditable && (el.getAttribute("data-block-id") === id || el.getAttribute("data-block-wrapper-id") === id)) {
        e.preventDefault();
        removeBlock(id);
        return;
      }

      // If user is inside an advanced input or code block, let native input backspace handle it
      if (isSpecialInput) {
        return;
      }

      if (e.key === "Backspace" && !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
        const block = findBlockDeep(stateRef.current.blocks, id);
        if (!block) return;

        // Use live DOM text to determine if the block is truly empty
        const fullText = el.innerText || el.textContent || "";
        const cleanText = fullText.replace(/[\n\r\u200B\uFEFF]/g, "").trim();
        const isBlockEmpty = cleanText === "";

        const ctx = findSiblingContext(stateRef.current.blocks, id);
        if (!ctx) return;

        // Case A: Block is completely empty
        if (isBlockEmpty) {
          // If it's the only block in the entire editor, do not delete
          if (stateRef.current.blocks.length <= 1) {
            return;
          }

          // If it's the very first block in its container and has no previous sibling
          if (!ctx.prev) {
            return;
          }

          e.preventDefault();
          const prevId = ctx.prev.id;

          pushHistory();
          clearTimeout(contentChangeTimerRef.current);
          contentChangeTimerRef.current = null;
          typingBlockIdRef.current = null;

          const { newNodes } = deepRemove(stateRef.current.blocks, id);
          stateRef.current.blocks = newNodes;
          setBlocks(newNodes);
          debouncedSave();

          setTimeout(() => {
            const prevEl =
              document.querySelector(`[data-block-id="${prevId}-content"]`) ||
              document.querySelector(`[data-block-id="${prevId}"]`);
            if (prevEl) {
              prevEl.focus();
              const sel = window.getSelection();
              if (sel && prevEl.isContentEditable) {
                sel.selectAllChildren(prevEl);
                sel.collapseToEnd();
              }
            }
          }, 50);
          return;
        }

        // Case B: Caret is at the start (offset 0) of a non-empty block
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0 && sel.isCollapsed) {
          const range = sel.getRangeAt(0);
          if (el.contains(range.commonAncestorContainer)) {
            const preRange = range.cloneRange();
            preRange.selectNodeContents(el);
            preRange.setEnd(range.startContainer, range.startOffset);
            const textBeforeCaret = preRange.toString().replace(/[\n\r\u200B\uFEFF]/g, "");
            const isAtStart = textBeforeCaret.length === 0;

            if (isAtStart) {
              // Rule 2: First block cannot merge with anything
              if (!ctx.prev) {
                return;
              }

              const prevBlock = ctx.prev;
              // Rule 2: Only merge with compatible text-based siblings!
              // Advanced blocks (FILE, IMAGE, CODE, EMBED, etc.): DO NOT MERGE!
              if (!MERGEABLE_TYPES.includes(prevBlock.type)) {
                return;
              }

              e.preventDefault();

              pushHistory();
              clearTimeout(contentChangeTimerRef.current);
              contentChangeTimerRef.current = null;
              typingBlockIdRef.current = null;

              const prevContent = prevBlock.content || "";
              // Read live DOM innerHTML to ensure the most up-to-date content is merged
              const currContent =
                el.innerHTML !== undefined && el.innerHTML !== ""
                  ? el.innerHTML
                  : (block.content || "");

              const prevPlainText = stripHtml(prevContent);
              const currPlainText = stripHtml(currContent);

              // Prevent accidental sticking of words
              const needsSpace =
                prevPlainText.length > 0 &&
                currPlainText.length > 0 &&
                !/\s$/.test(prevPlainText) &&
                !/^\s/.test(currPlainText);

              const mergedHtml = sanitizeHtml(
                prevContent + (needsSpace ? " " : "") + currContent
              );
              const splitOffset = prevPlainText.length + (needsSpace ? 1 : 0);

              // Update prevBlock content and remove currentBlock
              const updatedNodes = updateBlockTree(
                stateRef.current.blocks,
                prevBlock.id,
                { content: mergedHtml }
              );
              const { newNodes } = deepRemove(updatedNodes, id);

              stateRef.current.blocks = newNodes;
              setBlocks(newNodes);
              debouncedSave();

              setTimeout(() => {
                const prevEl =
                  document.querySelector(`[data-block-id="${prevBlock.id}-content"]`) ||
                  document.querySelector(`[data-block-id="${prevBlock.id}"]`);
                if (prevEl) {
                  setCaretAtTextOffset(prevEl, splitOffset);
                }
              }, 50);
              return;
            }
          }
        }
      }
    }
  };

  const handleSlashSelect = (type) => {
    pushHistory();
    clearTimeout(contentChangeTimerRef.current);
    contentChangeTimerRef.current = null;
    typingBlockIdRef.current = null;

    setActiveBlockType(BLOCK_TYPES.TEXT);
    if (slashMenu.blockId) {
      const currentBlock = findBlockDeep(stateRef.current.blocks, slashMenu.blockId);
      const isCodeBlock = currentBlock && currentBlock.type === BLOCK_TYPES.CODE;

      if (isCodeBlock) {
        // Remove the "/query" part from the code block's content
        const match = currentBlock.content.match(
          /(?:^|\n)[ \t]*\/([a-zA-Z0-9\u0131\u011F\u00FC\u015F\u00F6\u00E7\u0130\u011E\u00DC\u015E\u00D6\u00C7]*)$/,
        );
        let newCodeContent = currentBlock.content;
        if (match) {
          // slice off the matched part
          newCodeContent = currentBlock.content.substring(0, currentBlock.content.length - match[0].length);
        }
        
        if (type === BLOCK_TYPES.DIVIDER) {
          insertDividerSequence(slashMenu.blockId, newCodeContent);
          setActiveBlockType(BLOCK_TYPES.TEXT);
        } else {
          updateBlock(slashMenu.blockId, { content: newCodeContent });
          addBlockAfter(slashMenu.blockId, type, "");
          setActiveBlockType(BLOCK_TYPES.TEXT);
        }
      } else {
        const plainText = stripHtml(currentBlock.content);
        const match = plainText.match(
          /(?:^|\s)\/([a-zA-Z0-9\u0131\u011F\u00FC\u015F\u00F6\u00E7\u0130\u011E\u00DC\u015E\u00D6\u00C7]*)$/,
        );
        let textBeforeDivider = currentBlock.content;
        if (match) {
          textBeforeDivider = currentBlock.content.replace(
            new RegExp(`(?:^|\\s)\\/[a-zA-Z0-9\\u0131\\u011F\\u00FC\\u015F\\u00F6\\u00E7\\u0130\\u011E\\u00DC\\u015E\\u00D6\\u00C7]*$`),
            ""
          );
        }

        if (type === BLOCK_TYPES.DIVIDER) {
          insertDividerSequence(slashMenu.blockId, textBeforeDivider);
          setActiveBlockType(BLOCK_TYPES.TEXT);
        } else if (type === BLOCK_TYPES.TOGGLE) {
          updateBlock(slashMenu.blockId, {
            type,
            content: textBeforeDivider,
            children: currentBlock?.children || [],
            isOpen: true,
          });
          
          const oldEl = document.querySelector(`[data-block-id="${slashMenu.blockId}"]`);
          if (oldEl && oldEl.getAttribute('contenteditable') === 'true') {
             oldEl.innerHTML = textBeforeDivider;
          }
          
          setTimeout(() => {
            const newEl = document.querySelector(`[data-block-id="${slashMenu.blockId}-content"]`) 
                       || document.querySelector(`[data-block-id="${slashMenu.blockId}"]`);
            if (newEl && typeof newEl.focus === 'function') {
               newEl.focus();
            }
          }, 50);
        } else if (type === BLOCK_TYPES.CANVAS) {
          updateBlock(slashMenu.blockId, {
            type,
            content: "",
            elements: currentBlock?.elements || [],
          });
          setActiveBlockType(BLOCK_TYPES.TEXT);
          setTimeout(() => {
            const ctx = findSiblingContext(stateRef.current.blocks, slashMenu.blockId);
            if (!ctx || !ctx.next) {
              addBlockAfter(slashMenu.blockId, BLOCK_TYPES.TEXT, "");
            }
          }, 60);
        } else {
          updateBlock(slashMenu.blockId, { type, content: textBeforeDivider });
          
          const oldEl = document.querySelector(`[data-block-id="${slashMenu.blockId}"]`);
          if (oldEl && oldEl.getAttribute('contenteditable') === 'true') {
             oldEl.innerHTML = textBeforeDivider;
          }
          
          setTimeout(() => {
            const newEl = document.querySelector(`[data-block-id="${slashMenu.blockId}-content"]`) 
                       || document.querySelector(`[data-block-id="${slashMenu.blockId}"]`);
            if (newEl && typeof newEl.focus === 'function') {
               newEl.focus();
            }
          }, 50);
          setActiveBlockType(BLOCK_TYPES.TEXT);
        }
      }
    }
    setSlashMenu((s) => ({ ...s, show: false }));
  };

  const reorderArray = (list, fromId, toId, position) => {
    const fromIndex = list.findIndex((item) => item.id === fromId);
    const toIndex = list.findIndex((item) => item.id === toId);

    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
      return list;
    }

    const result = [...list];
    const [removed] = result.splice(fromIndex, 1);

    const newToIndex = result.findIndex((item) => item.id === toId);
    if (newToIndex === -1) return list;

    const insertIndex = position === "top" ? newToIndex : newToIndex + 1;
    result.splice(insertIndex, 0, removed);

    return result;
  };

  const reorderInTree = (nodes, fromId, toId, position) => {
    const hasFrom = nodes.some((n) => n.id === fromId);
    const hasTo = nodes.some((n) => n.id === toId);

    if (hasFrom && hasTo) {
      return reorderArray(nodes, fromId, toId, position);
    }

    return nodes.map((node) => {
      let newNode = { ...node };
      if (newNode.children) {
        newNode.children = reorderInTree(newNode.children, fromId, toId, position);
      }
      return newNode;
    });
  };

  const reorderBlocks = (fromId, toId, position) => {
    const oldBlocks = stateRef.current.blocks;
    const newNodes = reorderInTree(oldBlocks, fromId, toId, position);

    if (JSON.stringify(newNodes) === JSON.stringify(oldBlocks)) {
      return;
    }

    pushHistory();
    clearTimeout(contentChangeTimerRef.current);
    contentChangeTimerRef.current = null;
    typingBlockIdRef.current = null;

    stateRef.current.blocks = newNodes;
    setBlocks(newNodes);
    debouncedSave();
  };

  const handleDragStart = (e, item, parentScope) => {
    window.getSelection()?.removeAllRanges();

    dragInfoRef.current = {
      id: item.id,
      parentScope: parentScope || "root",
      block: item,
    };

    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", item.id);

    setDragState({
      draggingId: item.id,
      targetId: null,
      dropPosition: null,
    });
  };

  const handleDragOver = (e, item, parentScope) => {
    if (!dragInfoRef.current) return;

    if (dragInfoRef.current.id === item.id) {
      return;
    }

    const currentScope = parentScope || "root";
    if (dragInfoRef.current.parentScope !== currentScope) {
      e.dataTransfer.dropEffect = "none";
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";

    const rect = e.currentTarget.getBoundingClientRect();
    const isTopHalf = e.clientY < rect.top + rect.height / 2;
    const position = isTopHalf ? "top" : "bottom";

    setDragState((prev) => {
      if (prev.targetId === item.id && prev.dropPosition === position) {
        return prev;
      }
      return {
        ...prev,
        targetId: item.id,
        dropPosition: position,
      };
    });
  };

  const handleDragLeave = (e, item) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragState((prev) => {
        if (prev.targetId === item.id) {
          return { ...prev, targetId: null, dropPosition: null };
        }
        return prev;
      });
    }
  };

  const handleDrop = (e, item, parentScope) => {
    e.preventDefault();
    e.stopPropagation();

    const info = dragInfoRef.current;
    const currentScope = parentScope || "root";

    const targetPosition = dragState.dropPosition;
    setDragState({
      draggingId: null,
      targetId: null,
      dropPosition: null,
    });
    dragInfoRef.current = null;

    if (!info) return;
    if (info.id === item.id) return;
    if (info.parentScope !== currentScope) return;

    reorderBlocks(info.id, item.id, targetPosition);
  };

  const handleDragEnd = () => {
    setDragState({
      draggingId: null,
      targetId: null,
      dropPosition: null,
    });
    dragInfoRef.current = null;
  };

  const renderBlockItem = (item, blocksArray, parentScope = "root") => {
    const isHovered = hoveredBlockId === item.id;
    const isFocused = focusedBlockId === item.id;
    const isMenuOpen = openDropdownBlockId === item.id;
    const isHandleVisible = isHovered || isFocused || isMenuOpen;
    const isDraggingThis = dragState.draggingId === item.id;
    const isTarget = dragState.targetId === item.id;

    return (
      <div
        key={item.id}
        data-block-wrapper-id={item.id}
        className={`w-full relative group transition-opacity duration-150 ${
          isDraggingThis ? "opacity-30" : "opacity-100"
        }`}
        onMouseEnter={() => setHoveredBlockId(item.id)}
        onMouseLeave={() => {
          setHoveredBlockId((prev) => (prev === item.id ? null : prev));
        }}
        onFocus={() => setFocusedBlockId(item.id)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setFocusedBlockId((prev) => (prev === item.id ? null : prev));
          }
        }}
        onDragOver={(e) => handleDragOver(e, item, parentScope)}
        onDragLeave={(e) => handleDragLeave(e, item)}
        onDrop={(e) => handleDrop(e, item, parentScope)}
      >
        {/* Drop indicator - TOP */}
        {isTarget && dragState.dropPosition === "top" && (
          <div className="absolute -top-1.5 left-0 right-0 h-[2px] bg-indigo-600 rounded z-30 pointer-events-none flex items-center shadow-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 -ml-1 border-2 border-white shadow-sm" />
          </div>
        )}

        {/* Drag Handle - Notion style on the left */}
        <div
          className={`absolute -left-7 top-1.5 flex items-center transition-opacity duration-150 select-none z-20 ${
            isHandleVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          contentEditable={false}
        >
          <div
            role="button"
            tabIndex={-1}
            draggable={true}
            onDragStart={(e) => handleDragStart(e, item, parentScope)}
            onDragEnd={handleDragEnd}
            className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing transition-colors flex items-center justify-center"
            title="Taşımak için sürükleyin"
          >
            <span className="material-symbols-outlined text-[16px] leading-none select-none">
              drag_indicator
            </span>
          </div>
        </div>

        {/* Block Content */}
        {renderBlock(item, blocksArray)}

        {/* Drop indicator - BOTTOM */}
        {isTarget && dragState.dropPosition === "bottom" && (
          <div className="absolute -bottom-1.5 left-0 right-0 h-[2px] bg-indigo-600 rounded z-30 pointer-events-none flex items-center shadow-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 -ml-1 border-2 border-white shadow-sm" />
          </div>
        )}
      </div>
    );
  };

  const renderBlocksGrouped = (blocksArray) => {
    const result = [];
    let currentGroup = null;

    for (let i = 0; i < blocksArray.length; i++) {
      const block = blocksArray[i];
      if (
        block.type === BLOCK_TYPES.NUMBERED_LIST ||
        block.type === BLOCK_TYPES.BULLET_LIST
      ) {
        if (!currentGroup || currentGroup.type !== block.type) {
          currentGroup = {
            type: block.type,
            isListGroup: true,
            items: [block],
            id: `group-${block.id}`,
          };
          result.push(currentGroup);
        } else {
          currentGroup.items.push(block);
        }
      } else {
        currentGroup = null;
        result.push({ isListGroup: false, item: block });
      }
    }

    return result.map((group) => {
      if (group.isListGroup) {
        const Tag = group.type === BLOCK_TYPES.NUMBERED_LIST ? "ol" : "ul";
        const listClass =
          group.type === BLOCK_TYPES.NUMBERED_LIST
            ? "list-decimal"
            : "list-disc marker:text-gray-400";
        return (
          <Tag
            key={group.id}
            className={`${listClass} pl-6 w-full my-1 space-y-1`}
          >
            {group.items.map((b) => renderBlockItem(b, blocksArray, "root"))}
          </Tag>
        );
      } else {
        return renderBlockItem(group.item, blocksArray, "root");
      }
    });
  };

  const CONVERTIBLE_TYPES = [
    BLOCK_TYPES.TEXT,
    BLOCK_TYPES.HEADING_1,
    BLOCK_TYPES.HEADING_2,
    BLOCK_TYPES.HEADING_3,
    BLOCK_TYPES.BULLET_LIST,
    BLOCK_TYPES.NUMBERED_LIST,
    BLOCK_TYPES.TODO,
    BLOCK_TYPES.QUOTE,
    BLOCK_TYPES.CALLOUT,
    BLOCK_TYPES.CODE,
    BLOCK_TYPES.TOGGLE,
  ];

  const convertBlockType = (id, newType) => {
    const currentBlock = findBlockDeep(stateRef.current.blocks, id);
    if (!currentBlock || currentBlock.type === newType) return;

    pushHistory();
    clearTimeout(contentChangeTimerRef.current);
    contentChangeTimerRef.current = null;
    typingBlockIdRef.current = null;

    const updates = { type: newType };

    if (newType === BLOCK_TYPES.TODO) {
      if (currentBlock.checked === undefined) {
        updates.checked = false;
      }
    }

    if (newType === BLOCK_TYPES.CALLOUT) {
      if (!currentBlock.icon) {
        updates.icon = "💡";
      }
    }

    if (newType === BLOCK_TYPES.TOGGLE) {
      if (currentBlock.children === undefined) {
        updates.children = [];
      }
      if (currentBlock.isOpen === undefined) {
        updates.isOpen = true;
      }
    }

    if (currentBlock.content !== undefined) {
      updates.content = currentBlock.content;
    }

    const newNodes = updateBlockTree(stateRef.current.blocks, id, updates);
    stateRef.current.blocks = newNodes;
    setBlocks(newNodes);
    debouncedSave();

    setTimeout(() => {
      const el =
        document.querySelector(`[data-block-id="${id}"]`) ||
        document.querySelector(`[data-block-id="${id}-content"]`);
      if (el) {
        el.focus();
        try {
          const selection = window.getSelection();
          if (selection && el.isContentEditable) {
            const range = document.createRange();
            range.selectNodeContents(el);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
          }
        } catch (err) {}
      }
    }, 50);
  };

  const renderBlock = (block, blocksArray) => {
    const isMenuVisible = activeMenuBlockId === block.id;
    const props = { 
      block, 
      updateBlock, 
      onKeyDown, 
      removeBlock, 
      duplicateBlock,
      isMenuVisible,
      setMenuOpen: (isOpen) => setOpenDropdownBlockId(isOpen ? block.id : null),
    };

    if (CONVERTIBLE_TYPES.includes(block.type)) {
      props.onChangeType = (newType) => convertBlockType(block.id, newType);
      props.currentType = block.type;
    }

    // For nested structures like toggle
    props.renderBlocks = (childArray, scopeId = null) => (
      <div className="flex flex-col w-full">
        {childArray.map((cb) =>
          renderBlockItem(cb, childArray, scopeId || `nested-${block.id}`)
        )}
      </div>
    );

    // Add placeholder to TextBlock if it's the only block
    if (
      block.type === BLOCK_TYPES.TEXT &&
      blocksArray.length === 1 &&
      stateRef.current.blocks.length === 1
    ) {
      props.placeholder =
        "Yazmaya başlayın veya komutlar için '/' tuşuna basın...";
    } else if (block.type === BLOCK_TYPES.TEXT) {
      props.placeholder = " "; // small trick to keep min-height active sometimes
    }

    switch (block.type) {
      case BLOCK_TYPES.TEXT:
        return <TextBlock {...props} />;
      case BLOCK_TYPES.HEADING_1:
      case BLOCK_TYPES.HEADING_2:
      case BLOCK_TYPES.HEADING_3:
        return <HeadingBlock {...props} />;
      case BLOCK_TYPES.TODO:
        return <TodoBlock {...props} />;
      case BLOCK_TYPES.BULLET_LIST:
      case BLOCK_TYPES.NUMBERED_LIST:
        return <ListBlock {...props} />;
      case BLOCK_TYPES.QUOTE:
        return <QuoteBlock {...props} />;
      case BLOCK_TYPES.DIVIDER:
        return <DividerBlock {...props} />;
      case BLOCK_TYPES.CODE:
        return <CodeBlock {...props} />;
      case BLOCK_TYPES.CALLOUT:
        return <CalloutBlock {...props} />;
      case BLOCK_TYPES.TOGGLE:
        return <ToggleBlock {...props} />;
      case BLOCK_TYPES.LINK:
        return <LinkBlock {...props} />;
      case BLOCK_TYPES.IMAGE:
        return <ImageBlock {...props} />;
      case BLOCK_TYPES.FILE:
        return <FileBlock {...props} />;
      case BLOCK_TYPES.BOOKMARK:
        return <BookmarkBlock {...props} />;
      case BLOCK_TYPES.EMBED:
        return <EmbedBlock {...props} />;
      case BLOCK_TYPES.TABLE:
        return <TableBlock {...props} />;
      case BLOCK_TYPES.EQUATION:
        return <EquationBlock {...props} />;
      case BLOCK_TYPES.CANVAS:
        return <CanvasBlock {...props} />;
      default:
        return <FallbackBlock {...props} />;
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setToast("Bağlantı kopyalandı");
    setShowMenu(false);
    setTimeout(() => setToast(""), 3000);
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
          onClose={() => setSlashMenu((s) => ({ ...s, show: false }))}
        />
      )}
      {linkPopover.show && (
        <LinkPopover
          initialUrl={linkPopover.initialUrl}
          hasExistingLink={linkPopover.hasExistingLink}
          position={linkPopover.position}
          onApply={handleApplyLink}
          onUnlink={handleUnlink}
          onClose={() => setLinkPopover((prev) => ({ ...prev, show: false }))}
        />
      )}
      {floatingToolbar.show && (
        <FloatingToolbar
          show={floatingToolbar.show}
          position={floatingToolbar.position}
          activeFormats={floatingToolbar.activeFormats}
          onFormat={handleToolbarFormat}
        />
      )}

      <div className="h-12 border-b border-gray-100 flex items-center justify-between px-6 shrink-0 sticky top-0 bg-white/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
          <button
            onClick={onBack}
            className="hover:bg-gray-100 p-1.5 rounded-md transition-colors text-gray-500 hover:text-gray-900 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[18px]">
              arrow_back
            </span>
          </button>
          {isSaving && (
            <span className="ml-2 text-[11px] text-indigo-400 font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] animate-spin">
                sync
              </span>{" "}
              Kaydediliyor...
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 relative">
          <button
            onClick={handleShare}
            className="text-[11px] font-medium text-gray-500 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
          >
            Paylaş
          </button>
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[16px]">
                more_horiz
              </span>
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-100 py-1 z-50">
                <button
                  onClick={handleShare}
                  className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Paylaş
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    if (onDuplicate) onDuplicate();
                  }}
                  className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Sayfayı çoğalt
                </button>
                <div className="h-px bg-gray-100 my-1 w-full"></div>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    if (onDelete) onDelete();
                  }}
                  className="w-full text-left px-4 py-2 text-[13px] text-red-600 hover:bg-red-50 transition-colors"
                >
                  Sayfayı sil
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="w-full max-w-[900px] mx-auto pt-10 pb-32 px-8">
          <div className="text-[40px] mb-4 text-gray-300">
            <span
              className="material-symbols-outlined text-[48px]"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              description
            </span>
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

          <div className="space-y-1 mt-8">{renderBlocksGrouped(blocks)}</div>
          <div
            className="min-h-[140px] cursor-text"
            onClick={() => {
              const lastBlock = blocks[blocks.length - 1];
              if (
                lastBlock &&
                lastBlock.type === BLOCK_TYPES.TEXT &&
                (!lastBlock.content || lastBlock.content.trim() === "")
              ) {
                const el =
                  document.querySelector(`[data-block-id="${lastBlock.id}"]`) ||
                  document.querySelector(`[data-block-id="${lastBlock.id}-content"]`);
                el?.focus();
              } else if (lastBlock) {
                addBlockAfter(lastBlock.id, BLOCK_TYPES.TEXT, "");
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
