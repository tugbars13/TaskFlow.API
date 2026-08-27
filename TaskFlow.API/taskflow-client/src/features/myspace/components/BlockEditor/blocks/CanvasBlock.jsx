import React, { useState, useRef, useEffect } from "react";

const BOX_COLORS = [
  { id: "white", bg: "#ffffff", border: "#e2e8f0", label: "Beyaz" },
  { id: "yellow", bg: "#fef9c3", border: "#fde047", label: "Açık Sarı" },
  { id: "blue", bg: "#e0f2fe", border: "#7dd3fc", label: "Açık Mavi" },
  { id: "green", bg: "#dcfce7", border: "#86efac", label: "Açık Yeşil" },
  { id: "pink", bg: "#fce7f3", border: "#f472b6", label: "Açık Pembe" },
];

const ARROW_COLORS = [
  { id: "slate", color: "#64748b", label: "Gri" },
  { id: "indigo", color: "#6366f1", label: "Mavi" },
  { id: "emerald", color: "#10b981", label: "Yeşil" },
  { id: "rose", color: "#f43f5e", label: "Kırmızı" },
];

export default function CanvasBlock({ block, updateBlock, onKeyDown }) {
  const elements = block.elements || [];
  const [localElements, setLocalElements] = useState(elements);
  const [selectedId, setSelectedId] = useState(null);
  const [hoveredBoxId, setHoveredBoxId] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [drawingArrow, setDrawingArrow] = useState(null);

  // Canvas dimensions (default: 600x380)
  const defaultWidth = block.width !== undefined ? block.width : 600;
  const defaultHeight = block.height !== undefined ? block.height : 380;
  const [canvasSize, setCanvasSize] = useState({
    width: defaultWidth,
    height: defaultHeight,
  });
  const [isResizingCanvas, setIsResizingCanvas] = useState(false);

  const containerRef = useRef(null);
  const newlyCreatedIdRef = useRef(null);
  const dragRef = useRef({
    id: null,
    startX: 0,
    startY: 0,
    elemX: 0,
    elemY: 0,
  });

  // Sync elements from props when block changes from outside (e.g. undo/redo, initial load)
  useEffect(() => {
    if (!dragRef.current.id && !drawingArrow) {
      setLocalElements(block.elements || []);
    }
  }, [block.elements, drawingArrow]);

  // Sync canvas dimensions from props on external changes (e.g. undo/redo)
  useEffect(() => {
    if (!isResizingCanvas) {
      setCanvasSize({
        width: block.width !== undefined ? block.width : 600,
        height: block.height !== undefined ? block.height : 380,
      });
    }
  }, [block.width, block.height, isResizingCanvas]);

  // Deselect canvas elements when user clicks anywhere outside of this canvas
  useEffect(() => {
    const handleDocumentMouseDown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setSelectedId(null);
      }
    };
    document.addEventListener("mousedown", handleDocumentMouseDown);
    return () => document.removeEventListener("mousedown", handleDocumentMouseDown);
  }, []);

  // Helper to compute connection point for a given box and side
  const getSideCoords = (b, side) => {
    const w = b.width || 180;
    const h = b.height || 84;
    const x = b.x;
    const y = b.y;

    switch (side) {
      case "top":
        return { x: x + w / 2, y };
      case "bottom":
        return { x: x + w / 2, y: y + h };
      case "left":
        return { x, y: y + h / 2 };
      case "right":
      default:
        return { x: x + w, y: y + h / 2 };
    }
  };

  // Helper to compute cubic bezier curve path between two points
  const getArrowPath = (fromCoords, toCoords, fromSide, toSide) => {
    const dx = toCoords.x - fromCoords.x;
    const dy = toCoords.y - fromCoords.y;
    const dist = Math.hypot(dx, dy);
    const curveWeight = Math.min(60, Math.max(20, dist * 0.35));

    let cp1x = fromCoords.x;
    let cp1y = fromCoords.y;
    let cp2x = toCoords.x;
    let cp2y = toCoords.y;

    if (fromSide === "right") cp1x += curveWeight;
    else if (fromSide === "left") cp1x -= curveWeight;
    else if (fromSide === "top") cp1y -= curveWeight;
    else if (fromSide === "bottom") cp1y += curveWeight;

    if (toSide === "right") cp2x += curveWeight;
    else if (toSide === "left") cp2x -= curveWeight;
    else if (toSide === "top") cp2y -= curveWeight;
    else if (toSide === "bottom") cp2y += curveWeight;

    return `M ${fromCoords.x} ${fromCoords.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${toCoords.x} ${toCoords.y}`;
  };

  // Element drag handler
  const handleMouseDown = (e, elem) => {
    if (
      e.target.tagName === "INPUT" ||
      e.target.tagName === "TEXTAREA" ||
      e.target.closest("button") ||
      e.target.dataset.resizeHandle ||
      e.target.dataset.connectionPort ||
      e.target.dataset.canvasResizeHandle ||
      e.target.closest('[data-canvas-resize-handle="true"]')
    ) {
      setSelectedId(elem.id);
      return;
    }
    e.stopPropagation();
    e.preventDefault();

    setSelectedId(elem.id);

    dragRef.current = {
      id: elem.id,
      startX: e.clientX,
      startY: e.clientY,
      elemX: elem.x || 0,
      elemY: elem.y || 0,
    };
    setDraggingId(elem.id);

    const onMouseMove = (moveEvent) => {
      if (!dragRef.current.id) return;
      const dx = moveEvent.clientX - dragRef.current.startX;
      const dy = moveEvent.clientY - dragRef.current.startY;

      const rect = containerRef.current?.getBoundingClientRect();
      const elemW = elem.width || (elem.type === "text" ? 100 : 180);
      const elemH = elem.height || (elem.type === "text" ? 36 : 84);
      const maxX = rect ? Math.max(20, rect.width - elemW - 12) : 700;
      const maxY = rect ? Math.max(20, rect.height - elemH - 12) : 320;

      const nextX = Math.max(12, Math.min(maxX, dragRef.current.elemX + dx));
      const nextY = Math.max(12, Math.min(maxY, dragRef.current.elemY + dy));

      setLocalElements((prev) =>
        prev.map((el) =>
          el.id === dragRef.current.id
            ? { ...el, x: Math.round(nextX), y: Math.round(nextY) }
            : el
        )
      );
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);

      if (dragRef.current.id) {
        setLocalElements((current) => {
          updateBlock(block.id, { elements: current });
          return current;
        });
      }

      setDraggingId(null);
      dragRef.current.id = null;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  // Box element resize handler
  const handleResizeMouseDown = (e, elem) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedId(elem.id);

    const startX = e.clientX;
    const startY = e.clientY;
    const startW = elem.width || 180;
    const startH = elem.height || 84;

    const onMouseMove = (moveEvent) => {
      const dw = moveEvent.clientX - startX;
      const dh = moveEvent.clientY - startY;

      const rect = containerRef.current?.getBoundingClientRect();
      const maxW = rect ? Math.max(100, rect.width - elem.x - 16) : 600;
      const maxH = rect ? Math.max(50, rect.height - elem.y - 16) : 340;

      const newW = Math.max(110, Math.min(maxW, startW + dw));
      const newH = Math.max(54, Math.min(maxH, startH + dh));

      setLocalElements((prev) =>
        prev.map((el) =>
          el.id === elem.id
            ? { ...el, width: Math.round(newW), height: Math.round(newH) }
            : el
        )
      );
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);

      setLocalElements((current) => {
        updateBlock(block.id, { elements: current });
        return current;
      });
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  // Canvas block resize handler (modifies canvas width & height)
  const handleCanvasResizeMouseDown = (e) => {
    e.stopPropagation();
    e.preventDefault();

    const startX = e.clientX;
    const startY = e.clientY;
    const currentRect = containerRef.current?.getBoundingClientRect();
    if (!currentRect) return;

    const startW = currentRect.width;
    const startH = currentRect.height;
    const parentRect = containerRef.current.parentElement?.getBoundingClientRect();
    const maxAvailableWidth = parentRect ? parentRect.width : window.innerWidth - 80;

    setIsResizingCanvas(true);

    const onMouseMove = (moveEvent) => {
      const dw = moveEvent.clientX - startX;
      const dh = moveEvent.clientY - startY;

      // Minimum: 600x380, Maximum width constrained by parent container
      const minW = 600;
      const maxW = Math.max(minW, maxAvailableWidth);
      const newW = Math.max(minW, Math.min(maxW, startW + dw));
      const newH = Math.max(380, Math.min(1400, startH + dh));

      setCanvasSize({
        width: Math.round(newW),
        height: Math.round(newH),
      });
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      setIsResizingCanvas(false);

      setCanvasSize((current) => {
        updateBlock(block.id, {
          width: current.width,
          height: current.height,
        });
        return current;
      });
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  // Connection dragging from a port
  const handlePortMouseDown = (e, fromBox, side) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedId(fromBox.id);

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const startCoords = getSideCoords(fromBox, side);

    setDrawingArrow({
      fromBoxId: fromBox.id,
      fromSide: side,
      startX: startCoords.x,
      startY: startCoords.y,
      currentX: startCoords.x,
      currentY: startCoords.y,
      targetBoxId: null,
      targetSide: null,
    });

    const onMouseMove = (moveEvent) => {
      const mouseX = moveEvent.clientX - rect.left;
      const mouseY = moveEvent.clientY - rect.top;

      // Detect target box
      const target = localElements.find((el) => {
        if (el.type !== "box" || el.id === fromBox.id) return false;
        const w = el.width || 180;
        const h = el.height || 84;
        return (
          mouseX >= el.x - 14 &&
          mouseX <= el.x + w + 14 &&
          mouseY >= el.y - 14 &&
          mouseY <= el.y + h + 14
        );
      });

      let bestSide = "left";
      let targetId = null;

      if (target) {
        targetId = target.id;
        const sides = ["top", "right", "bottom", "left"];
        let minDist = Infinity;
        sides.forEach((s) => {
          const coords = getSideCoords(target, s);
          const d = Math.hypot(mouseX - coords.x, mouseY - coords.y);
          if (d < minDist) {
            minDist = d;
            bestSide = s;
          }
        });
      }

      setDrawingArrow((prev) =>
        prev
          ? {
              ...prev,
              currentX: mouseX,
              currentY: mouseY,
              targetBoxId: targetId,
              targetSide: bestSide,
            }
          : null
      );
    };

    const onMouseUp = (upEvent) => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);

      const upX = upEvent.clientX - rect.left;
      const upY = upEvent.clientY - rect.top;

      const target = localElements.find((el) => {
        if (el.type !== "box" || el.id === fromBox.id) return false;
        const w = el.width || 180;
        const h = el.height || 84;
        return (
          upX >= el.x - 16 &&
          upX <= el.x + w + 16 &&
          upY >= el.y - 16 &&
          upY <= el.y + h + 16
        );
      });

      if (target) {
        const sides = ["top", "right", "bottom", "left"];
        let minDist = Infinity;
        let bestSide = "left";
        sides.forEach((s) => {
          const coords = getSideCoords(target, s);
          const d = Math.hypot(upX - coords.x, upY - coords.y);
          if (d < minDist) {
            minDist = d;
            bestSide = s;
          }
        });

        const newArrowId =
          "arrow-" +
          Date.now().toString(36) +
          Math.random().toString(36).substr(2, 3);

        const newArrow = {
          id: newArrowId,
          type: "arrow",
          from: fromBox.id,
          to: target.id,
          fromSide: side,
          toSide: bestSide,
          color: "#64748b",
          strokeWidth: 2,
        };

        setLocalElements((current) => {
          const next = [...current, newArrow];
          updateBlock(block.id, { elements: next });
          return next;
        });
        setSelectedId(newArrowId);
      }

      setDrawingArrow(null);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const handleDoubleClick = (e) => {
    if (e.target !== containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const x = Math.max(12, Math.min(rect.width - 150, clickX));
    const y = Math.max(12, Math.min(rect.height - 40, clickY));

    const newId =
      "txt-" + Date.now().toString(36) + Math.random().toString(36).substr(2, 3);
    newlyCreatedIdRef.current = newId;
    setSelectedId(newId);

    const newElem = {
      id: newId,
      type: "text",
      x: Math.round(x),
      y: Math.round(y),
      text: "",
    };
    const next = [...localElements, newElem];
    setLocalElements(next);
    updateBlock(block.id, { elements: next });
  };

  const handleAddText = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const count = localElements.length;
    const newId =
      "txt-" + Date.now().toString(36) + Math.random().toString(36).substr(2, 3);
    newlyCreatedIdRef.current = newId;
    setSelectedId(newId);

    const newElem = {
      id: newId,
      type: "text",
      x: 30 + ((count * 25) % 240),
      y: 40 + ((count * 20) % 180),
      text: "",
    };
    const next = [...localElements, newElem];
    setLocalElements(next);
    updateBlock(block.id, { elements: next });
  };

  const handleAddBox = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const count = localElements.length;
    const newId =
      "box-" + Date.now().toString(36) + Math.random().toString(36).substr(2, 3);
    newlyCreatedIdRef.current = newId;
    setSelectedId(newId);

    const newElem = {
      id: newId,
      type: "box",
      x: 50 + ((count * 30) % 260),
      y: 40 + ((count * 25) % 190),
      width: 180,
      height: 84,
      color: "#ffffff",
      text: "",
    };
    const next = [...localElements, newElem];
    setLocalElements(next);
    updateBlock(block.id, { elements: next });
  };

  const handleDelete = (elemId, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    // Delete element itself AND any arrows connected to it
    const next = localElements.filter(
      (el) => el.id !== elemId && el.from !== elemId && el.to !== elemId
    );
    setLocalElements(next);
    if (selectedId === elemId) setSelectedId(null);
    updateBlock(block.id, { elements: next });
  };

  const handleDuplicate = (elemId, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const elem = localElements.find((el) => el.id === elemId);
    if (!elem || elem.type === "arrow") return; // Arrows are not duplicated

    const rect = containerRef.current?.getBoundingClientRect();
    const maxX = rect ? rect.width - 160 : 600;
    const maxY = rect ? rect.height - 90 : 300;

    const newX = Math.min(maxX, elem.x + 24);
    const newY = Math.min(maxY, elem.y + 24);

    const newId =
      (elem.type === "text" ? "txt-" : "box-") +
      Date.now().toString(36) +
      Math.random().toString(36).substr(2, 3);

    const cloned = {
      ...elem,
      id: newId,
      x: Math.round(newX),
      y: Math.round(newY),
    };

    const next = [...localElements, cloned];
    setLocalElements(next);
    setSelectedId(newId);
    updateBlock(block.id, { elements: next });
  };

  const handleColorChange = (elemId, newColor) => {
    const next = localElements.map((el) =>
      el.id === elemId ? { ...el, color: newColor } : el
    );
    setLocalElements(next);
    updateBlock(block.id, { elements: next });
  };

  const handleArrowColorChange = (elemId, newColor) => {
    const next = localElements.map((el) =>
      el.id === elemId ? { ...el, color: newColor } : el
    );
    setLocalElements(next);
    updateBlock(block.id, { elements: next });
  };

  const handleArrowWidthChange = (elemId, newWidth) => {
    const next = localElements.map((el) =>
      el.id === elemId ? { ...el, strokeWidth: newWidth } : el
    );
    setLocalElements(next);
    updateBlock(block.id, { elements: next });
  };

  const handleTextChange = (elemId, newText) => {
    const next = localElements.map((el) =>
      el.id === elemId ? { ...el, text: newText } : el
    );
    setLocalElements(next);
    updateBlock(block.id, { elements: next });
  };

  const handleTextBlur = (elemId) => {
    const elem = localElements.find((el) => el.id === elemId);
    if (elem && elem.text.trim() === "") {
      const next = localElements.filter((el) => el.id !== elemId);
      setLocalElements(next);
      if (selectedId === elemId) setSelectedId(null);
      updateBlock(block.id, { elements: next });
    }
  };

  const selectedElem = localElements.find((el) => el.id === selectedId);

  // Compute selected arrow position for contextual toolbar
  let arrowToolbarCoords = null;
  if (selectedElem && selectedElem.type === "arrow") {
    const fb = localElements.find((el) => el.id === selectedElem.from);
    const tb = localElements.find((el) => el.id === selectedElem.to);
    if (fb && tb) {
      const fc = getSideCoords(fb, selectedElem.fromSide || "right");
      const tc = getSideCoords(tb, selectedElem.toSide || "left");
      arrowToolbarCoords = {
        x: (fc.x + tc.x) / 2,
        y: (fc.y + tc.y) / 2,
      };
    }
  }

  return (
    <div
      ref={containerRef}
      data-canvas-root="true"
      data-block-id={block.id}
      contentEditable={false}
      onDoubleClick={handleDoubleClick}
      onMouseDown={(e) => {
        if (e.target === containerRef.current) {
          setSelectedId(null);
        }
      }}
      onKeyDown={(e) => {
        const canvasElement = e.target.closest?.('[data-canvas-root="true"]');
        if (!canvasElement) {
          return;
        }

        if (selectedId && (e.key === "Backspace" || e.key === "Delete")) {
          const activeTag = document.activeElement?.tagName;
          if (activeTag !== "INPUT" && activeTag !== "TEXTAREA") {
            e.preventDefault();
            e.stopPropagation();
            handleDelete(selectedId);
          }
        } else if (
          e.target === containerRef.current &&
          (e.key === "Backspace" || e.key === "Delete")
        ) {
          onKeyDown(e, block.id);
        }
      }}
      className="relative group/canvas bg-[#fafafa] rounded-xl border border-gray-200 overflow-hidden select-none my-3 shadow-none focus:outline-none"
      style={{
        width: `${canvasSize.width}px`,
        maxWidth: "100%",
        height: `${canvasSize.height}px`,
        backgroundImage: "radial-gradient(circle, #e2e8f0 1.2px, transparent 1.2px)",
        backgroundSize: "20px 20px",
      }}
    >
      {/* SVG Layer for Connections */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
        <defs>
          <marker
            id="arrow-head-default"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="4"
            orient="auto"
          >
            <path d="M 1 1 L 7 4 L 1 7 Z" fill="#64748b" />
          </marker>
          <marker
            id="arrow-head-selected"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="4"
            orient="auto"
          >
            <path d="M 1 1 L 7 4 L 1 7 Z" fill="#6366f1" />
          </marker>
          {ARROW_COLORS.map((c) => (
            <marker
              key={c.id}
              id={`arrow-head-${c.id}`}
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="4"
              orient="auto"
            >
              <path d="M 1 1 L 7 4 L 1 7 Z" fill={c.color} />
            </marker>
          ))}
        </defs>

        {/* Existing Arrow Elements */}
        {localElements
          .filter((el) => el.type === "arrow")
          .map((arrow) => {
            const fb = localElements.find((el) => el.id === arrow.from);
            const tb = localElements.find((el) => el.id === arrow.to);
            if (!fb || !tb) return null;

            const fromCoords = getSideCoords(fb, arrow.fromSide || "right");
            const toCoords = getSideCoords(tb, arrow.toSide || "left");
            const isSelected = selectedId === arrow.id;
            const pathD = getArrowPath(
              fromCoords,
              toCoords,
              arrow.fromSide || "right",
              arrow.toSide || "left"
            );

            const colorObj = ARROW_COLORS.find((c) => c.color === arrow.color);
            const markerId = isSelected
              ? "arrow-head-selected"
              : colorObj
              ? `arrow-head-${colorObj.id}`
              : "arrow-head-default";

            const strokeColor = isSelected ? "#6366f1" : arrow.color || "#64748b";
            const strokeW = arrow.strokeWidth || 2;

            return (
              <g key={arrow.id} className="group/arrow">
                {/* Thick invisible path for easy clicking / selecting */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="16"
                  className="pointer-events-auto cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedId(arrow.id);
                  }}
                />

                {/* Selection halo */}
                {isSelected && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#6366f1"
                    strokeOpacity="0.25"
                    strokeWidth={strokeW + 6}
                    strokeLinecap="round"
                  />
                )}

                {/* Visible path */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeW}
                  strokeLinecap="round"
                  markerEnd={`url(#${markerId})`}
                  className="pointer-events-none transition-colors"
                />
              </g>
            );
          })}

        {/* Temporary Drawing Arrow */}
        {drawingArrow && (
          <path
            d={`M ${drawingArrow.startX} ${drawingArrow.startY} L ${drawingArrow.currentX} ${drawingArrow.currentY}`}
            fill="none"
            stroke="#6366f1"
            strokeWidth="2"
            strokeDasharray="4 4"
            markerEnd="url(#arrow-head-selected)"
            className="pointer-events-none"
          />
        )}
      </svg>

      {/* Top-right Minimal Toolbar */}
      <div 
        onMouseDown={(e) => e.stopPropagation()} 
        className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1 bg-white/90 backdrop-blur-sm border border-gray-200/80 rounded-md p-0.5 shadow-sm"
      >
        <button
          type="button"
          onClick={handleAddText}
          className="px-2 py-1 text-[12px] font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors flex items-center gap-1 cursor-pointer select-none"
          title="Metin kutusu ekle (veya canvas'a çift tıklayın)"
        >
          <span className="material-symbols-outlined text-[14px] text-gray-500">add</span>
          <span>Metin</span>
        </button>
        <div className="w-px h-3 bg-gray-200" />
        <button
          type="button"
          onClick={handleAddBox}
          className="px-2 py-1 text-[12px] font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors flex items-center gap-1 cursor-pointer select-none"
          title="Kutu ekle"
        >
          <span className="material-symbols-outlined text-[14px] text-gray-500">crop_square</span>
          <span>Kutu</span>
        </button>
      </div>

      {/* Contextual Toolbar for Selected Element */}
      {selectedElem && (
        <>
          {/* Toolbar for Box / Text */}
          {selectedElem.type !== "arrow" && (
            <div
              style={{
                left: Math.max(
                  12,
                  Math.min(
                    containerRef.current ? containerRef.current.clientWidth - 220 : 600,
                    selectedElem.x
                  )
                ),
                top: Math.max(8, selectedElem.y - 36),
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              className="absolute z-40 flex items-center gap-1 bg-white border border-gray-200 shadow-md rounded-md p-1 select-none text-[12px]"
            >
              <button
                type="button"
                onClick={(e) => handleDuplicate(selectedElem.id, e)}
                className="px-1.5 py-0.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors flex items-center gap-1 cursor-pointer"
                title="Kopyala"
              >
                <span className="material-symbols-outlined text-[14px] text-gray-500">
                  content_copy
                </span>
                <span className="text-[11px] font-medium">Kopyala</span>
              </button>

              {selectedElem.type === "box" && (
                <>
                  <div className="w-px h-3.5 bg-gray-200 mx-0.5" />
                  <div className="flex items-center gap-1 px-1">
                    {BOX_COLORS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleColorChange(selectedElem.id, c.bg)}
                        style={{ backgroundColor: c.bg, borderColor: c.border }}
                        className={`w-3.5 h-3.5 rounded-full border transition-transform cursor-pointer ${
                          (selectedElem.color || "#ffffff") === c.bg
                            ? "scale-125 ring-1 ring-gray-400"
                            : "hover:scale-110"
                        }`}
                        title={c.label}
                      />
                    ))}
                  </div>
                </>
              )}

              <div className="w-px h-3.5 bg-gray-200 mx-0.5" />

              <button
                type="button"
                onClick={(e) => handleDelete(selectedElem.id, e)}
                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors flex items-center cursor-pointer"
                title="Sil"
              >
                <span className="material-symbols-outlined text-[14px]">delete</span>
              </button>
            </div>
          )}

          {/* Contextual Toolbar for Arrow */}
          {selectedElem.type === "arrow" && arrowToolbarCoords && (
            <div
              style={{
                left: Math.max(
                  12,
                  Math.min(
                    containerRef.current ? containerRef.current.clientWidth - 220 : 600,
                    arrowToolbarCoords.x - 70
                  )
                ),
                top: Math.max(8, arrowToolbarCoords.y - 36),
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              className="absolute z-40 flex items-center gap-1 bg-white border border-gray-200 shadow-md rounded-md p-1 select-none text-[12px]"
            >
              {/* Width */}
              <div className="flex items-center gap-0.5 px-0.5">
                {[1, 2, 3].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => handleArrowWidthChange(selectedElem.id, w)}
                    className={`px-1.5 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                      (selectedElem.strokeWidth || 2) === w
                        ? "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-300"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                    title={`${w}px`}
                  >
                    {w}px
                  </button>
                ))}
              </div>

              <div className="w-px h-3.5 bg-gray-200 mx-0.5" />

              {/* Color */}
              <div className="flex items-center gap-1 px-1">
                {ARROW_COLORS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleArrowColorChange(selectedElem.id, c.color)}
                    style={{ backgroundColor: c.color }}
                    className={`w-3.5 h-3.5 rounded-full border border-white shadow-sm transition-transform cursor-pointer ${
                      (selectedElem.color || "#64748b") === c.color
                        ? "scale-125 ring-2 ring-indigo-400"
                        : "hover:scale-110"
                    }`}
                    title={c.label}
                  />
                ))}
              </div>

              <div className="w-px h-3.5 bg-gray-200 mx-0.5" />

              {/* Delete */}
              <button
                type="button"
                onClick={(e) => handleDelete(selectedElem.id, e)}
                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors flex items-center cursor-pointer"
                title="Sil"
              >
                <span className="material-symbols-outlined text-[14px]">delete</span>
              </button>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {localElements.length === 0 && (
        <div className="w-full h-full flex items-center justify-center text-gray-400 text-[13px] pointer-events-none select-none">
          Boş canvas. Çift tıklayarak veya üstten Metin / Kutu ekleyin.
        </div>
      )}

      {/* Render Canvas Elements */}
      {localElements.map((elem) => {
        if (elem.type === "arrow") return null;

        const isDragging = draggingId === elem.id;
        const isSelected = selectedId === elem.id;
        const isHovered = hoveredBoxId === elem.id;
        const isTargetedInDrawing = drawingArrow?.targetBoxId === elem.id;

        if (elem.type === "text") {
          return (
            <div
              key={elem.id}
              onMouseDown={(e) => handleMouseDown(e, elem)}
              style={{
                left: elem.x,
                top: elem.y,
                zIndex: isDragging ? 30 : isSelected ? 25 : 10,
              }}
              className={`absolute cursor-grab active:cursor-grabbing group/text flex items-center bg-white/95 rounded px-2 py-1 border shadow-sm transition-all ${
                isSelected
                  ? "border-indigo-400 ring-2 ring-indigo-400/30 shadow-md"
                  : "border-gray-200/80 hover:border-gray-300"
              }`}
            >
              <input
                ref={(el) => {
                  if (newlyCreatedIdRef.current === elem.id && el) {
                    el.focus();
                    newlyCreatedIdRef.current = null;
                  }
                }}
                type="text"
                value={elem.text}
                onChange={(e) => handleTextChange(elem.id, e.target.value)}
                onBlur={() => handleTextBlur(elem.id)}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === "Escape" || e.key === "Enter") {
                    e.target.blur();
                    setSelectedId(null);
                  }
                }}
                data-advanced-input="true"
                className="bg-transparent text-[13px] text-gray-800 outline-none px-0.5 min-w-[70px] max-w-[240px] placeholder-gray-400"
                placeholder="Metin yaz..."
              />
              <button
                type="button"
                onClick={(e) => handleDelete(elem.id, e)}
                className="opacity-0 group-hover/text:opacity-100 text-gray-400 hover:text-red-500 p-0.5 rounded transition-opacity ml-1 cursor-pointer shrink-0"
                title="Sil"
              >
                <span className="material-symbols-outlined text-[13px]">close</span>
              </button>
            </div>
          );
        }

        // Box Element
        const boxColor = BOX_COLORS.find((c) => c.bg === elem.color) || BOX_COLORS[0];
        const boxWidth = elem.width || 180;
        const boxHeight = elem.height || 84;
        const showPorts = isSelected || isHovered || drawingArrow;

        return (
          <div
            key={elem.id}
            onMouseEnter={() => setHoveredBoxId(elem.id)}
            onMouseLeave={() => setHoveredBoxId(null)}
            onMouseDown={(e) => handleMouseDown(e, elem)}
            style={{
              left: elem.x,
              top: elem.y,
              width: boxWidth,
              height: boxHeight,
              backgroundColor: boxColor.bg,
              borderColor: boxColor.border,
              zIndex: isDragging ? 30 : isSelected ? 25 : 10,
            }}
            className={`absolute cursor-grab active:cursor-grabbing group/box rounded-lg border shadow-sm transition-shadow p-2.5 flex flex-col justify-between ${
              isSelected
                ? "ring-2 ring-indigo-400/50 shadow-md"
                : isTargetedInDrawing
                ? "ring-2 ring-indigo-400 ring-dashed shadow-md"
                : "hover:shadow hover:border-gray-300"
            }`}
          >
            <div className="flex items-start justify-between gap-1 h-full">
              <textarea
                ref={(el) => {
                  if (newlyCreatedIdRef.current === elem.id && el) {
                    el.focus();
                    newlyCreatedIdRef.current = null;
                  }
                }}
                value={elem.text}
                onChange={(e) => handleTextChange(elem.id, e.target.value)}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === "Escape") {
                    e.target.blur();
                    setSelectedId(null);
                  }
                }}
                data-advanced-input="true"
                className="w-full h-full bg-transparent text-[13px] text-gray-800 outline-none resize-none leading-relaxed placeholder-gray-400"
                placeholder="İçeriğini yaz..."
              />
              <button
                type="button"
                onClick={(e) => handleDelete(elem.id, e)}
                className="opacity-0 group-hover/box:opacity-100 text-gray-400 hover:text-red-500 p-0.5 rounded transition-opacity cursor-pointer shrink-0"
                title="Sil"
              >
                <span className="material-symbols-outlined text-[13px]">close</span>
              </button>
            </div>

            {/* Resize Handle for Box at Bottom-Right */}
            <div
              data-resize-handle="true"
              onMouseDown={(e) => handleResizeMouseDown(e, elem)}
              className="absolute bottom-0 right-0 w-3 h-3 cursor-nwse-resize flex items-end justify-end p-0.5 text-gray-300 hover:text-gray-600 transition-colors select-none"
              title="Kutuyu Boyutlandır"
            >
              <svg width="6" height="6" viewBox="0 0 6 6" className="fill-current">
                <circle cx="5" cy="5" r="1" />
                <circle cx="1" cy="5" r="1" />
                <circle cx="5" cy="1" r="1" />
              </svg>
            </div>

            {/* Connection Ports (Top, Right, Bottom, Left) */}
            {showPorts && (
              <>
                {/* Top Port */}
                <div
                  data-connection-port="true"
                  onMouseDown={(e) => handlePortMouseDown(e, elem, "top")}
                  className={`absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full border border-white shadow-sm cursor-crosshair transition-transform select-none ${
                    drawingArrow?.targetBoxId === elem.id && drawingArrow?.targetSide === "top"
                      ? "bg-indigo-600 scale-150 ring-2 ring-indigo-300"
                      : "bg-indigo-500 hover:scale-125 hover:bg-indigo-600"
                  }`}
                  title="Bağlantı oluşturmak için sürükleyin"
                />

                {/* Right Port */}
                <div
                  data-connection-port="true"
                  onMouseDown={(e) => handlePortMouseDown(e, elem, "right")}
                  className={`absolute top-1/2 -right-1.5 -translate-y-1/2 w-2.5 h-2.5 rounded-full border border-white shadow-sm cursor-crosshair transition-transform select-none ${
                    drawingArrow?.targetBoxId === elem.id && drawingArrow?.targetSide === "right"
                      ? "bg-indigo-600 scale-150 ring-2 ring-indigo-300"
                      : "bg-indigo-500 hover:scale-125 hover:bg-indigo-600"
                  }`}
                  title="Bağlantı oluşturmak için sürükleyin"
                />

                {/* Bottom Port */}
                <div
                  data-connection-port="true"
                  onMouseDown={(e) => handlePortMouseDown(e, elem, "bottom")}
                  className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full border border-white shadow-sm cursor-crosshair transition-transform select-none ${
                    drawingArrow?.targetBoxId === elem.id && drawingArrow?.targetSide === "bottom"
                      ? "bg-indigo-600 scale-150 ring-2 ring-indigo-300"
                      : "bg-indigo-500 hover:scale-125 hover:bg-indigo-600"
                  }`}
                  title="Bağlantı oluşturmak için sürükleyin"
                />

                {/* Left Port */}
                <div
                  data-connection-port="true"
                  onMouseDown={(e) => handlePortMouseDown(e, elem, "left")}
                  className={`absolute top-1/2 -left-1.5 -translate-y-1/2 w-2.5 h-2.5 rounded-full border border-white shadow-sm cursor-crosshair transition-transform select-none ${
                    drawingArrow?.targetBoxId === elem.id && drawingArrow?.targetSide === "left"
                      ? "bg-indigo-600 scale-150 ring-2 ring-indigo-300"
                      : "bg-indigo-500 hover:scale-125 hover:bg-indigo-600"
                  }`}
                  title="Bağlantı oluşturmak için sürükleyin"
                />
              </>
            )}
          </div>
        );
      })}

      {/* Resize Handle for Canvas Container (Bottom-Right Corner) */}
      <div
        data-canvas-resize-handle="true"
        onMouseDown={handleCanvasResizeMouseDown}
        className="absolute bottom-1 right-1 w-4 h-4 cursor-se-resize flex items-end justify-end p-0.5 text-gray-300 hover:text-gray-600 opacity-0 group-hover/canvas:opacity-100 transition-opacity select-none z-30"
        title="Canvas'ı Boyutlandır"
      >
        <svg width="8" height="8" viewBox="0 0 8 8" className="fill-current">
          <circle cx="7" cy="7" r="1" />
          <circle cx="4" cy="7" r="1" />
          <circle cx="1" cy="7" r="1" />
          <circle cx="7" cy="4" r="1" />
          <circle cx="4" cy="4" r="1" />
          <circle cx="7" cy="1" r="1" />
        </svg>
      </div>
    </div>
  );
}
