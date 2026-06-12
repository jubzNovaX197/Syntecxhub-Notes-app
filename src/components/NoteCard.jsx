/**
 * @license
 */

import React from 'react';
import './NoteCard.css';

import { Trash2, Edit3, Tag, Clock, Check, Palette, Pin, Archive, Undo2 } from 'lucide-react';

/**
 * 
 * @param {Object} props 
 * @param {Object} props.note 
 * @param {function} props.onEdit 
 * @param {function} props.onDelete 
 * @param {function} props.onToggleChecklistItem 
 * @param {function} props.onTogglePin 
 * @param {function} props.onToggleArchive 
 * @param {function} props.onRestore 
 */
export default function NoteCard({ 
  note, 
  onEdit, 
  onDelete, 
  onToggleChecklistItem,
  onTogglePin,
  onToggleArchive,
  onRestore
}) {

  const formatTimeLabel = (isoDateString) => {
    if (!isoDateString) return '';
    const dateObj = new Date(isoDateString);
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getThemeClass = (colorString) => {
    if (!colorString) return 'card-accent-indigo';
    

    if (colorString.includes('indigo')) return 'card-accent-indigo';
    if (colorString.includes('emerald')) return 'card-accent-emerald';
    if (colorString.includes('amber')) return 'card-accent-amber';
    if (colorString.includes('rose')) return 'card-accent-rose';
    if (colorString.includes('sky')) return 'card-accent-sky';
    if (colorString.includes('violet')) return 'card-accent-violet';
    
    return 'card-accent-indigo'; // Fallback default card style
  };

  // Determine card classes combining baseline model style and dynamic accent selectors
  const cardCSSThemeClass = getThemeClass(note.color);

  return (

    <div 
      className={`note-board-card ${cardCSSThemeClass} ${note.bin ? 'opacity-85 pointer-events-auto' : ''}`}
      onClick={note.bin ? (e) => e.stopPropagation() : onEdit}
    >

      <div className="card-header-bar">

        <span className="card-category-pill">
          <Tag size={12} className="card-meta-icon" />
          <span>{note.category || 'General'}</span>
        </span>

        <div className="card-actions-group">
          
          {note.bin ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onRestore) onRestore(note.id);
                }}
                className="card-action-btn edit-btn"
                title="Restore Note"
                style={{ color: '#a5796b', borderColor: '#ead7b8' }}
              >
                <Undo2 size={14} />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="card-action-btn delete-btn"
                title="Delete Permanently"
              >
                <Trash2 size={14} />
              </button>
            </>
          ) : (
            <>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onTogglePin) onTogglePin(note.id);
                }}
                className={`card-action-btn pin-btn ${note.pinned ? 'active-pin-highlight' : ''}`}
                style={note.pinned ? { backgroundColor: '#a5796b', color: '#ffffff', borderColor: '#a5796b' } : {}}
                title={note.pinned ? "Unpin Note" : "Pin Note"}
              >
                <Pin size={14} style={note.pinned ? { fill: '#ffffff' } : {}} />
              </button>


              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onToggleArchive) onToggleArchive(note.id);
                }}
                className={`card-action-btn archive-btn`}
                style={note.archived ? { backgroundColor: '#c4967b', color: '#ffffff', borderColor: '#c4967b' } : {}}
                title={note.archived ? "Send to Inbox" : "Archive Note"}
              >
                <Archive size={14} />
              </button>


              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="card-action-btn edit-btn"
                title="Edit Note Card"
              >
                <Edit3 size={14} />
              </button>


              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="card-action-btn delete-btn"
                title="Move to Bin"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}

        </div>

      </div>


      <div className="card-text-body">
        
        <h3 className="card-note-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {note.type === 'drawing' && <Palette size={14} style={{ color: '#4f46e5', flexShrink: 0 }} />}
          <span>{note.title}</span>
        </h3>

      
        {(note.type === 'image' || note.type === 'drawing') ? (
          <div className="card-image-display-container">
            {note.image && (
              <div 
                className="card-image-thumbnail-frame"
                style={note.type === 'drawing' ? { border: '1.5px dashed #cbd5e1', backgroundColor: '#fafafa' } : {}}
              >
                <img 
                  src={note.image} 
                  alt={note.title || "Scrapbook Snapshot"} 
                  className="card-image-content" 
                  referrerPolicy="no-referrer"
                  style={note.type === 'drawing' ? { objectFit: 'contain', padding: '6px' } : {}}
                />
              </div>
            )}
            {note.content && (
              <p className="card-note-content-text" style={{ marginTop: '8px' }}>
                {note.content}
              </p>
            )}
          </div>
        ) : note.type === 'checklist' ? (
          <div className="card-checklist-container">
            {(note.items || []).map((item) => (
              <div 
                key={item.id} 
                className="card-checklist-item"
                onClick={(e) => {
                  e.stopPropagation(); // Stop opening the edit dialogue box
                  if (onToggleChecklistItem) {
                    onToggleChecklistItem(note.id, item.id);
                  }
                }}
              >
                <div className={`card-checklist-checkbox-wrapper ${item.completed ? 'completed' : ''}`}>
                  {item.completed && <Check size={12} strokeWidth={3} />}
                </div>
                <p className={`card-checklist-text ${item.completed ? 'completed' : ''}`}>
                  {item.text}
                </p>
              </div>
            ))}
            {(!note.items || note.items.length === 0) && (
              <p className="text-xs text-slate-400 italic" style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>No checklist items.</p>
            )}
          </div>
        ) : (
          
          <p className="card-note-content-text">
            {note.content}
          </p>
        )}

      </div>

      <div className="card-meta-footer">
        {/* Small calendar clock visual */}
        <Clock size={12} className="card-meta-icon" />
        <span>{formatTimeLabel(note.createdAt)}</span>
      </div>

    </div>
  );
}
