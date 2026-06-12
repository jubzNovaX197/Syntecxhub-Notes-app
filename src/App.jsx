/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';

import Header from './components/Header';
import NoteForm from './components/NoteForm';
import NotesGrid from './components/NotesGrid';
import Sidebar from './components/Sidebar';
import { Sparkles, Edit3, X, Check, Save, Trash2 } from 'lucide-react';

const DEFAULT_NOTES = [
  {
    id: 'note-1',
    title: 'Quick Note',
    content: 'Capture ideas, reminders, and important thoughts.',
    type: 'text',
    createdAt: new Date().toISOString(),
    color: 'indigo',
    category: 'General',
  },

  
  {
    id: 'note-2',
    title: 'Daily Tasks',
    content: '☐ Complete Web dev.\n☐ Practice DSA\n☐ Review notes',
    type: 'checklist',
    items: [
      { id: '1', text: 'Complete Web dev.', completed: true },
      { id: '2', text: 'Practice DSA', completed: false },
      { id: '3', text: 'Review notes', completed: false }
    ],
    createdAt: new Date().toISOString(),
    color: 'emerald',
    category: 'Work',
  },

  {
    id: 'note-3',
    title: 'Drawing Sketch',
    content: 'Store your sketches and drawings here.',
    type: 'drawing',
    image: '',
    createdAt: new Date().toISOString(),
    color: 'amber',
    category: 'Ideas',
  },

  {
    id: 'note-4',
    title: 'Photo Memory',
    content: 'Save important screenshots and images.',
    type: 'image',
    image: '',
    createdAt: new Date().toISOString(),
    color: 'rose',
    category: 'Personal',
  }
];

const COLOR_THEMES = [
  { key: 'indigo', label: 'Indigo Accent' },
  { key: 'emerald', label: 'Green Accent' },
  { key: 'amber', label: 'Amber Accent' },
  { key: 'rose', label: 'Rose Accent' },
  { key: 'sky', label: 'Sky Blue' },
  { key: 'violet', label: 'Purple Accent' },
];


const CATEGORIES_LIST = ['General', 'Work', 'Personal', 'Ideas', 'Learning', 'Guides'];


export default function App() {
  const [notes, setNotes] = useState(() => {
    const cachedData = localStorage.getItem('my_app_notes');
    return cachedData ? JSON.parse(cachedData) : DEFAULT_NOTES;
  });

  const [searchTerm, setSearchTerm] = useState('');

  const [activeTab, setActiveTab] = useState('all');

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const cachedCollapse = localStorage.getItem('my_app_sidebar_collapsed');
    return cachedCollapse === 'true';
  });
  useEffect(() => {
    localStorage.setItem('my_app_sidebar_collapsed', sidebarCollapsed);
  }, [sidebarCollapsed]);
  const [darkMode, setDarkMode] = useState(() => {
    const cachedTheme = localStorage.getItem('my_app_dark_mode');
    return cachedTheme === 'true';
  });

  useEffect(() => {
    localStorage.setItem('my_app_dark_mode', darkMode);
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const [editingNote, setEditingNote] = useState(null);

  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');
  const [modalColor, setModalColor] = useState('indigo');
  const [modalCategory, setModalCategory] = useState('General');
  const [modalType, setModalType] = useState('text'); // 'text', 'checklist', or 'image'
  const [modalChecklistItems, setModalChecklistItems] = useState([]); // Array of { id, text, completed }
  const [modalNewItemText, setModalNewItemText] = useState('');
  const [modalImage, setModalImage] = useState('');


  useEffect(() => {
    localStorage.setItem('my_app_notes', JSON.stringify(notes));
  }, [notes]);


  /**
   * @param {string|Object} rawTextOrObject - The note description draft, structured checklist payload, or scrapbook image payload
   */
  const handleAddNewQuickNote = (rawTextOrObject) => {
    const randomTheme = COLOR_THEMES[Math.floor(Math.random() * COLOR_THEMES.length)].key;
    
    let newNote;
    if (typeof rawTextOrObject === 'object' && rawTextOrObject !== null) {
      newNote = {
        id: `note-${Date.now()}`,
        title: rawTextOrObject.title || 'Quick Snapshot thought 📸',
        content: rawTextOrObject.content || '',
        type: rawTextOrObject.type || 'text',
        items: rawTextOrObject.items || [],
        image: rawTextOrObject.image || '',
        createdAt: new Date().toISOString(),
        color: randomTheme,
        category: rawTextOrObject.category || 'General',
      };
    } else {
      newNote = {
        id: `note-${Date.now()}`, 
        title: 'Quick Scratchpad ⚡',
        content: rawTextOrObject,
        type: 'text',
        items: [],
        image: '',
        createdAt: new Date().toISOString(),
        color: randomTheme,
        category: 'General',
      };
    }

    setNotes((prevNotes) => [newNote, ...prevNotes]);
  };

 
  const handleToggleChecklistItem = (noteId, itemId) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) => {
        if (note.id === noteId) {
          const updatedItems = (note.items || []).map((item) => {
            if (item.id === itemId) {
              return { ...item, completed: !item.completed };
            }
            return item;
          });
          

          const textExcerpt = updatedItems.map((item) => `${item.completed ? '✓' : '☐'} ${item.text}`).join('\n');
          return {
            ...note,
            items: updatedItems,
            content: textExcerpt,
          };
        }
        return note;
      })
    );
  };

  /**
   * @param {string} noteId - The unique ID of the target note
   */
  const handleDeleteNote = (noteId) => {
    setNotes((prevNotes) => {
      const target = prevNotes.find(n => n.id === noteId);
      if (target && target.bin) {

        return prevNotes.filter((n) => n.id !== noteId);
      } else {

        return prevNotes.map((n) =>
          n.id === noteId ? { ...n, bin: true, pinned: false, archived: false } : n
        );
      }
    });
  };


  const handleTogglePin = (noteId) => {
    setNotes((prevNotes) =>
      prevNotes.map((n) =>
        n.id === noteId ? { ...n, pinned: !n.pinned, archived: false } : n
      )
    );
  };

  const handleToggleArchive = (noteId) => {
    setNotes((prevNotes) =>
      prevNotes.map((n) =>
        n.id === noteId ? { ...n, archived: !n.archived, pinned: false } : n
      )
    );
  };


  const handleRestoreNote = (noteId) => {
    setNotes((prevNotes) =>
      prevNotes.map((n) =>
        n.id === noteId ? { ...n, bin: false } : n
      )
    );
  };

  /**

   * @param {Object} targetNote - The note data we want to load into editable form inputs
   */
  const handleOpenEditModal = (targetNote) => {
    setEditingNote(targetNote);
    // Fill up modal placeholder values with existing note data values!
    setModalTitle(targetNote.title || '');
    setModalContent(targetNote.content || '');
    setModalColor(targetNote.color || 'indigo');
    setModalCategory(targetNote.category || 'General');
    setModalType(targetNote.type || 'text');
    setModalChecklistItems(targetNote.items ? [...targetNote.items] : []);
    setModalNewItemText('');
    setModalImage(targetNote.image || '');
  };

  /**

   * @param {Object} event - Form submission event 
   */
  const handleSaveEditedNote = (event) => {
    event.preventDefault();

    if (!modalTitle.trim()) {
      return;
    }

    const isChecklist = modalType === 'checklist';
    const isImage = modalType === 'image';
    const isDrawing = modalType === 'drawing';
    const finalContent = isChecklist
      ? modalChecklistItems.map((item) => `${item.completed ? '✓' : '☐'} ${item.text}`).join('\n')
      : modalContent.trim();

    setNotes((prevNotes) =>
      prevNotes.map((n) =>
        n.id === editingNote.id
          ? {
              ...n,
              title: modalTitle.trim(),
              content: finalContent,
              type: modalType,
              items: isChecklist ? modalChecklistItems : [],
              image: (isImage || isDrawing) ? modalImage : '',
              color: modalColor,
              category: modalCategory,
            }
          : n
      )
    );

    setEditingNote(null);
  };


  const tabFilteredNotes = notes.filter((note) => {
    if (activeTab === 'all') {
      return !note.bin && !note.archived;
    }
    if (activeTab === 'pinned') {
      return note.pinned && !note.bin && !note.archived;
    }
    if (activeTab === 'photo-notes') {
      return (note.type === 'image' || note.type === 'drawing') && !note.bin && !note.archived;
    }
    if (activeTab === 'archived') {
      return note.archived && !note.bin;
    }
    if (activeTab === 'bin') {
      return !!note.bin;
    }
    if (activeTab.startsWith('cat:')) {
      const categoryName = activeTab.substring(4);
      return note.category === categoryName && !note.bin && !note.archived;
    }
    return true;
  });

  // 4b. Secondly, filter the remaining notes using the search bar text query matching
  const filteredNotes = tabFilteredNotes.filter((note) => {
    const term = searchTerm.toLowerCase();
    
    // Read optional values gracefully so missing variables don't crash our code
    const matchingTitle = (note.title || '').toLowerCase().includes(term);
    const matchingContent = (note.content || '').toLowerCase().includes(term);
    const matchingCategory = (note.category || '').toLowerCase().includes(term);
    
    return matchingTitle || matchingContent || matchingCategory;
  });


  const CATEGORIES_LIST = ['General', 'Work', 'Personal', 'Ideas', 'Learning', 'Guides'];

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col md:flex-row font-sans transition-colors duration-300">
      
      {/* Sidebar Navigation Panel (Responsive Left rail) */}
      <Sidebar 
        selectedItem={activeTab}
        onSelectItem={setActiveTab}
        notes={notes}
        categories={CATEGORIES_LIST}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={setSidebarCollapsed}
      />
      
      {/* Main Content Workspace Column wrapper (indented on desktop to prevent overlaps) */}
      <div className={`flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'md:pl-[70px]' : 'md:pl-[260px]'}`}>
        
        {/* 
          COMPONENT 1: HEADER (Connected!)
          - We supply the current typing search word.
          - We supply a callback to alter search filters.
          - We provide a custom handler to open a blank editor notes draft.
          - We display how many active notes are saved in our badge!
        */}
        <Header
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          onAddNote={() => {
            // Open editor modal with blank template defaults
            setEditingNote({ id: 'new' });
            setModalTitle('');
            setModalContent('');
            setModalColor('indigo');
            setModalCategory('General');
            setModalType('text');
            setModalChecklistItems([]);
            setModalNewItemText('');
            setModalImage('');
          }}
          notesCount={notes.filter(n => !n.bin && !n.archived).length}
        />

        {/* Primary Dashboard Container */}
        <main id="notes-dashboard-main" className="flex-1 w-full mx-auto px-6 py-8">
          
          {/* 
            COMPONENT 2: NOTEFORM (Connected!)
            - Placed elegantly on the top of our notes board.
            - Takes the callback "onAddNote" and triggers handleAddNewQuickNote to append note text or checklist payloads.
          */}
          <NoteForm onAddNote={handleAddNewQuickNote} />

          {/* Real-time board list section */}
          {filteredNotes.length === 0 ? (
            
            /* Show a beautiful visual illustration state if no notes match search filters or default empty array */
            <div className="no-matching-notes-container flex flex-col items-center justify-center text-center py-20 px-4 rounded-3xl shadow-xs">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-4 border border-slate-100">
                <Sparkles className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">No matching notes</h3>
              <p className="text-slate-500 max-w-sm mt-1.5 text-sm leading-relaxed">
                {searchTerm 
                  ? `We couldn't locate any saved thought nodes containing "${searchTerm}". Check spellings or write another one!`
                  : `Your note board is currently clear of matching thoughts in this view. Switch sections or start typing inside the creator form!`}
              </p>
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="mt-5 text-sm font-bold text-indigo-600 hover:text-indigo-700 underline underline-offset-4 cursor-pointer"
                >
                  Clear written filters
                </button>
              )}
            </div>

          ) : (

            /* 
              COMPONENT 3: NOTESGRID (Connected!)
              - We feed the array of matching filtered notes into the grid.
              - We connect our click edits handler (handleOpenEditModal).
              - We connect our removal handler (handleDeleteNote).
              - We connect our toggle checkboxes handler (handleToggleChecklistItem).
            */
            <NotesGrid
              notes={filteredNotes}
              onEditNote={handleOpenEditModal}
              onDeleteNote={handleDeleteNote}
              onToggleChecklistItem={handleToggleChecklistItem}
              onTogglePin={handleTogglePin}
              onToggleArchive={handleToggleArchive}
              onRestore={handleRestoreNote}
            />

          )}

        </main>

        {/* Decorative clean footer space */}
        <footer className="py-8 border-t border-slate-200/60 text-center mt-12">
          <p className="text-xs font-semibold tracking-wide">
            Ideas change the world. Start here.
          </p>
        </footer>
      </div>


      {/* --- ADD & EDIT DIALOG OVERLAY MODAL --- */}
      {editingNote && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          
          {/* Transparent click backdrop. Clicking outside closes the dialogue box! */}
          <div 
            onClick={() => setEditingNote(null)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          />

          {/* Dialog Container */}
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden" style={{ animation: 'scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-900" />
                {editingNote.id === 'new' ? 'Create New Note Card' : 'Configure Note Details'}
              </h3>
              
              <button
                onClick={() => setEditingNote(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Editing Inputs Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                
                const isChecklist = modalType === 'checklist';
                const isImage = modalType === 'image';
                const isDrawing = modalType === 'drawing';
                const itemsList = isChecklist ? modalChecklistItems : [];
                const finalContent = isChecklist
                  ? itemsList.map((item) => `${item.completed ? '✓' : '☐'} ${item.text}`).join('\n')
                  : modalContent.trim();

                if (editingNote.id === 'new') {
                  // Creating a full note card
                  const freshNode = {
                    id: `note-${Date.now()}`,
                    title: modalTitle.trim() || (isChecklist ? 'Quick Checklist 📝' : isImage ? 'Snapshot thought 📸' : isDrawing ? 'Canvas Sketch 🎨' : 'Untitled Note'),
                    content: finalContent,
                    type: modalType,
                    items: itemsList,
                    image: (isImage || isDrawing) ? modalImage : '',
                    createdAt: new Date().toISOString(),
                    color: modalColor,
                    category: modalCategory,
                  };
                  setNotes((prevNotes) => [freshNode, ...prevNotes]);
                  setEditingNote(null);
                } else {
                  // Standard saving edits mode
                  handleSaveEditedNote(e);
                }
              }}
              className="p-6 space-y-5"
            >
              
              {/* Node Title input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Title</label>
                <input
                  type="text"
                  required
                  placeholder="Give your note card is a catchy heading..."
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800 font-semibold"
                />
              </div>

              {/* Tag configuration Select row and Color Theme Swatches */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Category select block */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-semibold">Category Tag</label>
                  <select
                    value={modalCategory}
                    onChange={(e) => setModalCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-700 font-medium cursor-pointer"
                  >
                    {CATEGORIES_LIST.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Color swatch selection block */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Card Color Theme</label>
                  <div className="flex items-center gap-2 py-1">
                    {COLOR_THEMES.map((theme) => {
                      const colorMapClasses = {
                        indigo: 'bg-indigo-50 border-indigo-200 text-indigo-900',
                        emerald: 'bg-emerald-50 border-emerald-200 text-emerald-900',
                        amber: 'bg-amber-50 border-amber-200 text-amber-900',
                        rose: 'bg-rose-50 border-rose-200 text-rose-900',
                        sky: 'bg-sky-50 border-sky-200 text-sky-900',
                        violet: 'bg-violet-50 border-violet-200 text-violet-900',
                      };
                      const isSelected = modalColor === theme.key;

                      return (
                        <button
                          key={theme.key}
                          type="button"
                          onClick={() => setModalColor(theme.key)}
                          className={`w-7 h-7 rounded-lg border-2 ${colorMapClasses[theme.key].split(' ')[0]} ${colorMapClasses[theme.key].split(' ')[1]} transition-transform duration-100 ${
                            isSelected ? 'scale-110 shadow-xs border-slate-800' : 'border-transparent'
                          } hover:scale-105 cursor-pointer flex items-center justify-center`}
                          title={theme.label}
                        >
                          {isSelected && <Check size={12} className="text-slate-800 stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Note Type selector inside the editing Modal form */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Note Style Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setModalType('text')}
                    className={`px-4 py-2 text-xs font-bold rounded-xl cursor-pointer transition-colors ${
                      modalType === 'text' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Standard Plain Note
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setModalType('checklist');
                      // If transitioning existing text note content into items list automatically:
                      if (modalChecklistItems.length === 0 && modalContent.trim()) {
                        const parsedLines = modalContent
                          .split('\n')
                          .map((line) => line.replace(/^[-*✓☐x•]\s*/i, '').trim())
                          .filter(Boolean)
                          .map((lineText, idx) => ({
                            id: `modal-item-${Date.now()}-${idx}`,
                            text: lineText,
                            completed: false,
                          }));
                        if (parsedLines.length > 0) {
                          setModalChecklistItems(parsedLines);
                        }
                      }
                    }}
                    className={`px-4 py-2 text-xs font-bold rounded-xl cursor-pointer transition-colors ${
                      modalType === 'checklist' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Checklist Note
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalType('image')}
                    className={`px-4 py-2 text-xs font-bold rounded-xl cursor-pointer transition-colors ${
                      modalType === 'image' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Image Scrapbook Note
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalType('drawing')}
                    className={`px-4 py-2 text-xs font-bold rounded-xl cursor-pointer transition-colors ${
                      modalType === 'drawing' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Canvas Drawing Note
                  </button>
                </div>
              </div>

              {/* Dynamic rendering: Text editor VS Checklist editor VS Image editor VS Drawing Preview */}
              {(modalType === 'image' || modalType === 'drawing') ? (
                <div className="space-y-3.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    {modalType === 'drawing' ? 'Drawing Canvas Snapshot' : 'Attachment Image'}
                  </label>
                  
                  {modalImage ? (
                    <div 
                      className="relative rounded-xl overflow-hidden bg-slate-50 border border-slate-200 aspect-video flex items-center justify-center"
                      style={modalType === 'drawing' ? { backgroundColor: '#fdfdfd', border: '1.5px dashed #cbd5e1' } : {}}
                    >
                      <img 
                        src={modalImage} 
                        alt="Snapshot preview in modal" 
                        className="h-full w-full rounded-xl"
                        style={modalType === 'drawing' ? { objectFit: 'contain', padding: '12px' } : { objectFit: 'cover' }}
                        referrerPolicy="no-referrer"
                      />
                      <button
                        type="button"
                        onClick={() => setModalImage('')}
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          backgroundColor: 'rgba(15, 23, 42, 0.85)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '50%',
                          width: '26px',
                          height: '26px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 20
                        }}
                        className="shadow hover:scale-110 transition-transform"
                        title="Remove uploaded image"
                      >
                        <X size={13} style={{ strokeWidth: 2.5 }} />
                      </button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => {
                        const fileInput = document.createElement('input');
                        fileInput.type = 'file';
                        fileInput.accept = 'image/*';
                        fileInput.onchange = (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const img = new Image();
                              img.onload = () => {
                                const canvas = document.createElement('canvas');
                                let width = img.width;
                                let height = img.height;
                                const MAX_DIM = 750;
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
                                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                                setModalImage(compressedBase64);
                              };
                              img.src = event.target.result;
                            };
                            reader.readAsDataURL(file);
                          }
                        };
                        fileInput.click();
                      }}
                      style={{
                        height: '130px',
                        border: '2px dashed #cbd5e1',
                        backgroundColor: '#f8fafc',
                        borderRadius: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                      className="hover:bg-slate-100 transition-colors"
                    >
                      <span className="text-slate-500 font-bold text-xs">
                        {modalType === 'drawing' ? 'Click to upload a custom sketch snapshot file' : 'Click inside to choose attachment snapshot'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono mt-1">Supports PNG, JPEG, WEBP and processes client compression</span>
                    </div>
                  )}
 
                  {/* Caption Note Content details */}
                  <div className="space-y-1.5 mt-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Caption / Details</label>
                    <textarea
                      rows={3}
                      placeholder="Type a caption or custom notes details for this card here..."
                      value={modalContent}
                      onChange={(e) => setModalContent(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-700 leading-relaxed font-normal"
                    />
                  </div>
                </div>
              ) : modalType === 'checklist' ? (
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider blocker">Checklist Items Draft</label>
                  
                  {/* Dynamic item insert row */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type list item and press Add or Enter..."
                      value={modalNewItemText}
                      onChange={(e) => setModalNewItemText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (modalNewItemText.trim()) {
                            const newItem = {
                              id: `modal-item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                              text: modalNewItemText.trim(),
                              completed: false,
                            };
                            setModalChecklistItems((prev) => [...prev, newItem]);
                            setModalNewItemText('');
                          }
                        }
                      }}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        if (modalNewItemText.trim()) {
                          const newItem = {
                            id: `modal-item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                            text: modalNewItemText.trim(),
                            completed: false,
                          };
                          setModalChecklistItems((prev) => [...prev, newItem]);
                          setModalNewItemText('');
                        }
                      }}
                      className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      Add Item
                    </button>
                  </div>

                  {/* Items list previews with checkboxes and deletion triggers */}
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                    {modalChecklistItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-3 p-2 bg-white rounded-lg border border-slate-100 shadow-3xs">
                        <div 
                          className="flex items-center gap-2.5 cursor-pointer flex-1" 
                          onClick={() => {
                            setModalChecklistItems(
                              modalChecklistItems.map((mi) => mi.id === item.id ? { ...mi, completed: !mi.completed } : mi)
                            );
                          }}
                        >
                          <div className={`card-checklist-checkbox-wrapper ${item.completed ? 'completed' : ''}`} style={{ width: '16px', height: '16px', borderRadius: '4px', border: '1.5px solid #cbd5e1' }}>
                            {item.completed && <Check size={11} strokeWidth={3.5} />}
                          </div>
                          <p className={`text-sm ${item.completed ? 'line-through text-slate-400' : 'text-slate-700'}`} style={{ fontSize: '13px', margin: 0 }}>
                            {item.text}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setModalChecklistItems(modalChecklistItems.filter((mi) => mi.id !== item.id));
                          }}
                          className="p-1 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors cursor-pointer border-transparent"
                          style={{ background: 'none', border: 'none' }}
                          title="Delete bullet"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                    {modalChecklistItems.length === 0 && (
                      <p className="text-xs text-slate-400 italic text-center py-4">No item bullets added yet. Create some above!</p>
                    )}
                  </div>
                </div>
              ) : (
                /* Note Description body text input */
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Note Description</label>
                  <textarea
                    rows={6}
                    required
                    placeholder="Start writing down your checklists, goals, or general workflows here..."
                    value={modalContent}
                    onChange={(e) => setModalContent(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-700 leading-relaxed font-normal"
                  />
                </div>
              )}

              {/* Actions Footer button block */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingNote(null)}
                  className="px-4 py-2.5 border border-slate-200 text-sm font-semibold text-slate-600 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-sm font-semibold text-white rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Save size={14} />
                  <span>{editingNote.id === 'new' ? 'Build Note Card' : 'Save Details'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
  
}
