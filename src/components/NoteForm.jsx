/**
 * @license
 */


import React, { useState, useRef, useEffect } from 'react';

import './NoteForm.css';

import { Plus, PenTool, ListTodo, Trash2, Image as ImageIcon, UploadCloud, X as CloseIcon, Palette } from 'lucide-react';

export default function NoteForm({ onAddNote }) {
  const [formType, setFormType] = useState('text');

  const [noteText, setNoteText] = useState('');

  const [checklistTitle, setChecklistTitle] = useState('');
  const [newItemText, setNewItemText] = useState('');
  const [checklistItems, setChecklistItems] = useState([]); 

  const [imageFileBase64, setImageFileBase64] = useState('');
  const [imageTitle, setImageTitle] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Drawing Note States
  const [drawingTitle, setDrawingTitle] = useState('');
  const [drawingCaption, setDrawingCaption] = useState('');
  const [brushColor, setBrushColor] = useState('#0f172a');
  const [brushWidth, setBrushWidth] = useState(4);
  const [isDrawingMouse, setIsDrawingMouse] = useState(false);

  // --- REFERENCING ELEMENTS WITH useRef ---
  const inputRef = useRef(null);
  const checklistItemRef = useRef(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const isDrawingStateRef = useRef(false);

  // Focus helper on form switch
  useEffect(() => {
    if (formType === 'text' && inputRef.current) {
      inputRef.current.focus();
    } else if (formType === 'checklist' && checklistItemRef.current) {
      checklistItemRef.current.focus();
    }
  }, [formType]);

  // Initializing drawing white canvas background
  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    if (formType === 'drawing') {
      const timer = setTimeout(() => {
        initializeCanvas();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [formType]);

  // Drawing drag handlers for mouse
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    ctx.beginPath();
    ctx.moveTo(x, y);
    isDrawingStateRef.current = true;
    setIsDrawingMouse(true);
  };

  const draw = (e) => {
    if (!isDrawingStateRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    ctx.lineTo(x, y);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawingStateRef.current = false;
    setIsDrawingMouse(false);
  };

  // Touch drawing handlers
  const startDrawingTouch = (e) => {
    if (e.touches.length === 0) return;
    const touch = e.touches[0];
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;

    ctx.beginPath();
    ctx.moveTo(x, y);
    isDrawingStateRef.current = true;
  };

  const drawTouch = (e) => {
    if (!isDrawingStateRef.current || e.touches.length === 0) return;
    e.preventDefault();
    const touch = e.touches[0];
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;

    ctx.lineTo(x, y);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  // --- COMPRESS & GENERATE BASE64 FROM UPLOADED IMAGE ---
  const handleImageFileChange = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WEBP, etc.).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // We use a canvas to resize/compress the image client-side beautifully!
        // This keeps our base64 footprint extremely lightweight so localStorage doesn't overflow.
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        const MAX_DIM = 750; // High quality but incredibly safe for storage limits
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Export as JPEG with 70% quality compression!
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        setImageFileBase64(compressedBase64);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // --- DRAG & DROP EVENT HANDLERS ---
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleImageFileChange(files[0]);
    }
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // --- TEXT NOTE FORM SUBMIT ---
  const handleTextSubmit = (event) => {
    event.preventDefault();

    if (!noteText.trim()) {
      return;
    }

    onAddNote(noteText.trim());

    setNoteText('');

    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleAddDraftItem = (e) => {
    if (e) e.preventDefault();

    if (!newItemText.trim()) {
      return;
    }

    const brandNewItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      text: newItemText.trim(),
      completed: false,
    };

    setChecklistItems((prev) => [...prev, brandNewItem]);
    setNewItemText('');

    // Re-focus the item box
    if (checklistItemRef.current) {
      checklistItemRef.current.focus();
    }
  };

  // --- REMOVE DESIGNATED ITEM FROM THE DRAFT LIST ---
  const handleRemoveDraftItem = (itemId) => {
    setChecklistItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  // --- COMPLETE CHECKLIST NOTE CREATION AND COMMIT ---
  const handleChecklistSubmit = (event) => {
    event.preventDefault();

    // Prevent saving if there are zero items in the checklist list
    if (checklistItems.length === 0) {
      return;
    }

    const titleDraft = checklistTitle.trim() || 'Shopping list & Tasks 📝';

    // Construct the structured note parameters
    const checklistPayload = {
      title: titleDraft,
      content: checklistItems.map((item) => `- ${item.text}`).join('\n'), // Text fallback
      type: 'checklist',
      items: checklistItems,
      category: 'General',
    };

    // Pass the payload up to parent App.jsx
    onAddNote(checklistPayload);

    // Reset checklist inputs
    setChecklistTitle('');
    setNewItemText('');
    setChecklistItems([]);
    setFormType('text'); // Revert back to standard text input nicely
  };

  // --- IMAGE NOTE SUBMIT ---
  const handleImageSubmit = (event) => {
    event.preventDefault();

    if (!imageFileBase64) {
      return;
    }

    const titleDraft = imageTitle.trim() || 'Snapshot thought 📸';
    const captionDraft = imageCaption.trim() || '';

    const imagePayload = {
      title: titleDraft,
      content: captionDraft,
      type: 'image',
      image: imageFileBase64,
      items: [],
      category: 'Ideas',
    };

    onAddNote(imagePayload);
  
    // Clean up
    setImageFileBase64('');
    setImageTitle('');
    setImageCaption('');
    setFormType('text'); // Return back to standard note nicely
  };

  // --- DRAWING NOTE SUBMIT ---
  const handleDrawingSubmit = (event) => {
    event.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Convert canvas draft artwork into jpeg format with crisp 85% compression
    const drawingDataUrl = canvas.toDataURL('image/jpeg', 0.85);

    const titleDraft = drawingTitle.trim() || 'Canvas Sketch 🎨';
    const captionDraft = drawingCaption.trim() || '';

    const drawingPayload = {
      title: titleDraft,
      content: captionDraft,
      type: 'drawing',
      image: drawingDataUrl,
      items: [],
      category: 'Ideas',
    };

    onAddNote(drawingPayload);

    // Clean up
    setDrawingTitle('');
    setDrawingCaption('');
    setBrushColor('#0f172a');
    setBrushWidth(4);
    setFormType('text'); // Revert back to standard note input nicely
  };

  return (
    <div className="quick-note-form-card">
      
      {/* 
        A clean toggler to let users switch between standard paragraphs, interactive checklists, or beautiful scrapbook photo notes!
      */}
      <div className="form-type-tabs">
        <button
          type="button"
          onClick={() => setFormType('text')}
          className={`form-type-tab-btn ${formType === 'text' ? 'active' : ''}`}
        >
          <span className="flex items-center gap-1.5">
            <PenTool size={11} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
            Standard Note
          </span>
        </button>
        <button
          type="button"
          onClick={() => setFormType('checklist')}
          className={`form-type-tab-btn ${formType === 'checklist' ? 'active' : ''}`}
        >
          <span className="flex items-center gap-1.5">
            <ListTodo size={11} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
            Checklist List
          </span>
        </button>
        <button
          type="button"
          onClick={() => setFormType('image')}
          className={`form-type-tab-btn ${formType === 'image' ? 'active' : ''}`}
        >
          <span className="flex items-center gap-1.5">
            <ImageIcon size={11} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
            Image Note
          </span>
        </button>
        <button
          type="button"
          onClick={() => setFormType('drawing')}
          className={`form-type-tab-btn ${formType === 'drawing' ? 'active' : ''}`}
        >
          <span className="flex items-center gap-1.5">
            <Palette size={11} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
            Drawing Canvas
          </span>
        </button>
      </div>

      {/* --- RENDER 1: STANDARD TEXT FORM --- */}
      {formType === 'text' ? (
        <form onSubmit={handleTextSubmit} className="quick-note-form">
          <div className="quick-note-input-wrapper">
            <div className="quick-note-input-icon">
              <PenTool size={16} />
            </div>
            <input
              ref={inputRef}
              type="text"
              placeholder="Quick draft: Type another note here and hit Enter..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="quick-note-input-field"
              maxLength={180}
            />
          </div>
          <button
            type="submit"
            className="quick-note-add-button"
            title="Add note to board"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Add Note</span>
          </button>
        </form>
      ) : formType === 'checklist' ? (
        /* --- RENDER 2: INTERACTIVE CHECKLIST CREATION FORM --- */
        <div className="checklist-builder-container">
          
          {/* Note Title Input */}
          <div className="checklist-builder-title-row">
            <input
              type="text"
              placeholder="Checklist Title (e.g. Weekly Groceries)"
              value={checklistTitle}
              onChange={(e) => setChecklistTitle(e.target.value)}
              className="quick-note-input-field"
              style={{ paddingLeft: '16px' }}
            />
          </div>

          {/* New Item Row Input Creator */}
          <form onSubmit={handleAddDraftItem} className="checklist-item-input-row">
            <div className="quick-note-input-wrapper">
              <div className="quick-note-input-icon" style={{ left: '14px' }}>
                <Plus size={14} />
              </div>
              <input
                ref={checklistItemRef}
                type="text"
                placeholder="Type checklist bullet and press Enter..."
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                className="quick-note-input-field"
                style={{ paddingLeft: '38px' }}
              />
            </div>
            <button
              type="submit"
              className="quick-note-add-button hover:bg-slate-800"
              style={{ padding: '12px 14px', backgroundColor: '#475569' }}
              title="Add item bullet to temporary draft"
            >
              Add Item
            </button>
          </form>

          {/* Live temporary bullets drafted list previews */}
          {checklistItems.length > 0 && (
            <div className="checklist-draft-list">
              {checklistItems.map((item) => (
                <div key={item.id} className="checklist-draft-item">
                  <span className="checklist-draft-item-text">&bull; {item.text}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDraftItem(item.id)}
                    className="checklist-draft-remove-btn"
                    title="Remove item"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Submission bar */}
          <div className="checklist-builder-submit-row">
            <button
              type="button"
              disabled={checklistItems.length === 0}
              onClick={handleChecklistSubmit}
              className="quick-note-add-button"
              style={{
                opacity: checklistItems.length === 0 ? '0.4' : '1',
                cursor: checklistItems.length === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              <ListTodo size={14} style={{ marginRight: '4px' }} />
              <span>Create Checklist Note ({checklistItems.length})</span>
            </button>
          </div>

        </div>
      ) : formType === 'image' ? (
        /* --- RENDER 3: ALBUM SCRAPBOOK IMAGE NOTE CREATION FORM --- */
        <div className="checklist-builder-container">
          
          {/* Note Title Input */}
          <div className="checklist-builder-title-row">
            <input
              type="text"
              placeholder="Image Card Title (e.g., Summer memories 🏖️)"
              value={imageTitle}
              onChange={(e) => setImageTitle(e.target.value)}
              className="quick-note-input-field"
              style={{ paddingLeft: '16px' }}
            />
          </div>

          {/* Drag and Drop Box Zone */}
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={imageFileBase64 ? undefined : triggerFileSelect}
            className={`file-upload-dragzone ${isDragging ? 'is-dragging' : ''} ${imageFileBase64 ? 'has-image' : ''}`}
          >
            {/* Native Hidden file input trigger */}
            <input 
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleImageFileChange(e.target.files[0]);
                }
              }}
              style={{ display: 'none' }}
            />

            {imageFileBase64 ? (
              <div className="image-form-preview-wrapper relative">
                <img 
                  src={imageFileBase64} 
                  alt="Draft uploaded preview" 
                  className="image-form-preview" 
                  referrerPolicy="no-referrer"
                />
                <button
                  type="button"
                  onClick={() => setImageFileBase64('')}
                  className="image-form-preview-delete"
                  title="Clear Snapshot"
                >
                  <CloseIcon size={14} />
                </button>
              </div>
            ) : (
              <div className="file-upload-prompt">
                <UploadCloud size={24} className="text-slate-400 mb-1" />
                <p className="upload-prompt-head">Drag & drop your image here, or <span className="upload-prompt-link">browse files</span></p>
                <p className="upload-prompt-sub font-mono">Supports PNG, JPEG, WEBP files up to 5MB</p>
              </div>
            )}
          </div>

          {/* Description Caption Input */}
          {imageFileBase64 && (
            <div className="checklist-builder-title-row">
              <input
                type="text"
                placeholder="Optional Caption or description..."
                value={imageCaption}
                onChange={(e) => setImageCaption(e.target.value)}
                className="quick-note-input-field"
                style={{ paddingLeft: '16px' }}
              />
            </div>
          )}

          {/* Creation Button */}
          <div className="checklist-builder-submit-row">
            <button
              type="button"
              disabled={!imageFileBase64}
              onClick={handleImageSubmit}
              className="quick-note-add-button"
              style={{
                opacity: !imageFileBase64 ? '0.4' : '1',
                cursor: !imageFileBase64 ? 'not-allowed' : 'pointer'
              }}
            >
              <ImageIcon size={14} style={{ marginRight: '6px' }} />
              <span>Create Scrapbook Photo Note</span>
            </button>
          </div>

        </div>
      ) : (
        /* --- RENDER 4: INTERACTIVE DRAWING CANVAS FORM --- */
        <div className="checklist-builder-container">
          
          {/* Note Title Input */}
          <div className="checklist-builder-title-row">
            <input
              type="text"
              placeholder="Drawing Title (e.g., Quick Mindmap 🎨)"
              value={drawingTitle}
              onChange={(e) => setDrawingTitle(e.target.value)}
              className="quick-note-input-field"
              style={{ paddingLeft: '16px' }}
            />
          </div>

          {/* Interactive Toolbar Row */}
          <div className="drawing-toolbar-row">
            <div className="drawing-swatches-palette">
              {[
                { hex: '#0f172a', label: 'Dark Slate' },
                { hex: '#4f46e5', label: 'Indigo' },
                { hex: '#059669', label: 'Emerald' },
                { hex: '#d97706', label: 'Amber' },
                { hex: '#e11d48', label: 'Rose' },
                { hex: '#ffffff', label: 'Eraser', isEraser: true },
              ].map((swatch) => (
                <button
                  key={swatch.hex}
                  type="button"
                  onClick={() => setBrushColor(swatch.hex)}
                  className={`drawing-swatch-btn ${brushColor === swatch.hex ? 'active' : ''} ${swatch.isEraser ? 'is-eraser-swatch' : ''}`}
                  style={{ backgroundColor: swatch.hex }}
                  title={swatch.label}
                />
              ))}
            </div>

            <div className="drawing-thickness-selector">
              <span className="drawing-thickness-label">Brush: {brushWidth}px</span>
              <input
                type="range"
                min="2"
                max="24"
                value={brushWidth}
                onChange={(e) => setBrushWidth(parseInt(e.target.value))}
                className="drawing-thickness-slider"
              />
            </div>

            <button
              type="button"
              onClick={initializeCanvas}
              className="drawing-clear-canvas-btn"
              title="Clear everything on the board"
            >
              Clear
            </button>
          </div>

          {/* Canvas Board element */}
          <div className="drawing-canvas-frame">
            <canvas
              ref={canvasRef}
              width={600}
              height={300}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawingTouch}
              onTouchMove={drawTouch}
              onTouchEnd={stopDrawing}
              className="drawing-canvas-board"
            />
            <div className="canvas-instruction-overlay">
              <span>Hold & drag mouse/stylus inside to draw. Select white to erase!</span>
            </div>
          </div>

          {/* Description Caption Input */}
          <div className="checklist-builder-title-row" style={{ marginTop: '12px' }}>
            <input
              type="text"
              placeholder="Optional Caption or drawing description details..."
              value={drawingCaption}
              onChange={(e) => setDrawingCaption(e.target.value)}
              className="quick-note-input-field"
              style={{ paddingLeft: '16px' }}
            />
          </div>

          {/* Creation Button */}
          <div className="checklist-builder-submit-row">
            <button
              type="button"
              onClick={handleDrawingSubmit}
              className="quick-note-add-button"
            >
              <Palette size={14} style={{ marginRight: '6px' }} />
              <span>Create Drawing Note</span>
            </button>
          </div>

        </div>
      )}
      
    </div>
  );
}
