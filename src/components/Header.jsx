/**
 * @license

 */

import React from 'react';


import './Header.css';

import { NotebookPen, Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * 
 * 
 * @param {Object} props - The parameters passed into the component
 * @param {string} props.searchTerm - The current textual search filters written by the user
 * @param {function} props.onSearchChange - Function triggered when the user types in the search field
 * @param {function} props.onAddNote - Function triggered when the user presses the 'New Note' button
 * @param {number} props.notesCount - The number of notes currently saved in the application
 * @param {boolean} props.sidebarCollapsed - State indicating whether sidebar navigation is folded away
 * @param {function} props.onToggleSidebar - Function triggered to flip sidebar fold states
 */
export default function Header({
  searchTerm,
  onSearchChange,
  onAddNote,
  notesCount,
  sidebarCollapsed = false,
  onToggleSidebar,
}) {
  
  
  return (
    
    <header id="app-nav-bar" className="notes-app-header">
      
      {/* 
       
      */}
      <div className="header-max-width-container">
        
        {}
        <div className={`header-brand-section ${sidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
          <div className="header-logo-badge">

            <NotebookPen size={22} />
          </div>

          <div>
            {}
            <div className="header-title-wrapper">
              {}
              <h1 className="header-title-text">My Notes</h1>
              
              
              <span className="header-notes-counter">
                {notesCount}
              </span>
            </div>
            
            <p className="header-promo-subtext">Organize your thoughts beautifully</p>
          </div>
        </div>

        <div className="header-actions-section">

          <div className="header-search-wrapper">

            <div className="header-search-icon-holder">
              <Search size={18} />
            </div>

            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="header-search-input-field"
            />
          </div>

          <button
            className="header-add-button-cta"
            onClick={onAddNote}
            title="Create a new note"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>New Note</span>
          </button>
          
        </div>

      </div>
    </header>
  );
}
