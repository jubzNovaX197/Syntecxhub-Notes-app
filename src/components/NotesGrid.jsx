/**
 * @license
 */

import React from 'react';

import './NotesGrid.css';

import NoteCard from './NoteCard';

/**
 * @param {Object} props
 * @param {Array} props.notes 
 * @param {function} props.onEditNote 
 * @param {function} props.onDeleteNote 
 */
export default function NotesGrid({ 
  notes, 
  onEditNote, 
  onDeleteNote, 
  onToggleChecklistItem,
  onTogglePin,
  onToggleArchive,
  onRestore
}) {
  
  return (
    <div className="notes-display-grid">

      {notes.map((note) => {
        return (
         
          <div key={note.id}>
            
        
            <NoteCard
              note={note}
              onEdit={() => onEditNote(note)}
              onDelete={() => onDeleteNote(note.id)}
              onToggleChecklistItem={onToggleChecklistItem}
              onTogglePin={onTogglePin}
              onToggleArchive={onToggleArchive}
              onRestore={onRestore}
            />
            
          </div>
        );
      })}
      
    </div>
  );
}
