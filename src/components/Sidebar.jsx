/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FileText, 
  Pin, 
  Folder, 
  Image as ImageIcon, 
  Archive, 
  Trash2, 
  Sun, 
  Moon, 
  ChevronDown, 
  ChevronRight,
  ChevronLeft,
  Tag
} from 'lucide-react';
import './Sidebar.css';

/**
 
 * 
 * Props:
 * @param {string} selectedItem 
 * @param {function} onSelectItem
 * @param {Array} notes 
 * @param {Array} categories 
 * @param {boolean} darkMode 
 * @param {function} onToggleDarkMode
 */
export default function Sidebar({ 
  selectedItem = 'all', 
  onSelectItem, 
  notes = [], 
  categories = [], 
  darkMode = false, 
  onToggleDarkMode,
  isCollapsed = false,
  onToggleCollapse
}) {
  const [categoriesExpanded, setCategoriesExpanded] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const countAll = notes.filter(n => !n.bin && !n.archived).length;
  const countPinned = notes.filter(n => n.pinned && !n.bin && !n.archived).length;
  const countPhoto = notes.filter(n => (n.type === 'image' || n.type === 'drawing') && !n.bin && !n.archived).length;
  const countArchived = notes.filter(n => n.archived && !n.bin).length;
  const countBin = notes.filter(n => n.bin).length;

  const getCategoryCount = (catName) => {
    return notes.filter(n => n.category === catName && !n.bin && !n.archived).length;
  };

  const mainMenuItems = [
    { id: 'all', label: 'All Notes', icon: FileText, count: countAll },
    { id: 'pinned', label: 'Pinned Notes', icon: Pin, count: countPinned },
    { id: 'photo-notes', label: 'Photo Notes', icon: ImageIcon, count: countPhoto },
    { id: 'archived', label: 'Archived Notes', icon: Archive, count: countArchived },
    { id: 'bin', label: 'Bin', icon: Trash2, count: countBin },
  ];

  const handleItemSelect = (itemId) => {
    if (onSelectItem) {
      onSelectItem(itemId);
    }
    setMobileMenuOpen(false);
  };

  return (
    <>

      <div className="mobile-nav-toggle-bar">
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="mobile-hamburger-btn"
          aria-label="Toggle navigation menu"
        >
          <div className={`hamburger-line ${mobileMenuOpen ? 'open-line-1' : ''}`}></div>
          <div className={`hamburger-line ${mobileMenuOpen ? 'open-line-2' : ''}`}></div>
          <div className={`hamburger-line ${mobileMenuOpen ? 'open-line-3' : ''}`}></div>
        </button>
        <div className="mobile-view-title">
          {selectedItem.startsWith('cat:') 
            ? `Category: ${selectedItem.substring(4)}` 
            : mainMenuItems.find(i => i.id === selectedItem)?.label || 'Freenotes Dashboard'}
        </div>
        <button 
          onClick={onToggleDarkMode} 
          className="mobile-theme-toggle-btn"
          title="Toggle Screen Theme"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div 
          className="mobile-sidebar-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside className={`notes-app-sidebar ${mobileMenuOpen ? 'mobile-visible' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        
        {!isCollapsed ? (
          <div 
            className="sidebar-brand-hub interactive-expanded" 
            onClick={() => onToggleCollapse && onToggleCollapse(true)}
            title="Collapse Sidebar"
            style={{ cursor: 'pointer' }}
          >
            <div className="header-brand-section sidebar-version">
              <div className="header-logo-badge">
                <FileText size={22} />
              </div>
              <div>
                <div className="header-title-wrapper">
                  <h1 className="header-title-text" style={{ fontSize: '20px' }}>My Notes</h1>
                  <span className="header-notes-counter">
                    {countAll}
                  </span>
                </div>
                <p className="header-promo-subtext">Organize thoughts gracefully ←</p>
              </div>
            </div>
          </div>
        ) : (
          <div 
            className="sidebar-brand-hub interactive-collapsed" 
            onClick={() => onToggleCollapse && onToggleCollapse(false)}
            title="Expand Sidebar"
            style={{ cursor: 'pointer', justifyContent: 'center', width: '100%', padding: '8px 0', marginBottom: '24px' }}
          >
            <div className="header-logo-badge" style={{ width: '40px', height: '40px', margin: '0' }} title="Expand Sidebar">
              <FileText size={22} />
            </div>
          </div>
        )}

        <nav className="sidebar-nav-menu">
          <ul className="sidebar-menu-list">
            {mainMenuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = selectedItem === item.id;
              
              return (
                <li key={item.id} className="sidebar-menu-item-wrap">
                  <button
                    onClick={() => handleItemSelect(item.id)}
                    className={`sidebar-menu-btn ${isActive ? 'active' : ''}`}
                  >
                    <span className="sidebar-btn-content">
                      <IconComponent size={16} className="sidebar-btn-icon" />
                      <span className="sidebar-btn-label">{item.label}</span>
                    </span>
                    {item.count > 0 && (
                      <span className={`sidebar-badge-counter ${isActive ? 'active' : ''}`}>
                        {item.count}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
            <li className="sidebar-categories-group">
              <button 
                type="button" 
                onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                className="categories-collapse-trigger-btn"
              >
                <span className="sidebar-btn-content">
                  <Folder size={16} className="sidebar-btn-icon" />
                  <span className="sidebar-btn-label font-bold">Categories</span>
                </span>
                {categoriesExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>

              {categoriesExpanded && (
                <ul className="categories-submenu-list">
                  {categories.map((catString) => {
                    const catId = `cat:${catString}`;
                    const isCatActive = selectedItem === catId;
                    const count = getCategoryCount(catString);

                    return (
                      <li key={catString} className="category-submenu-item">
                        <button
                          onClick={() => handleItemSelect(catId)}
                          className={`category-submenu-btn ${isCatActive ? 'active' : ''}`}
                        >
                          <span className="sidebar-btn-content">
                            <Tag size={12} className="category-submenu-icon" />
                            <span className="category-submenu-label">{catString}</span>
                          </span>
                          {count > 0 && (
                            <span className={`category-badge-counter ${isCatActive ? 'active' : ''}`}>
                              {count}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                  {categories.length === 0 && (
                    <li className="categories-empty-notice">No tags loaded</li>
                  )}
                </ul>
              )}
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer-settings">
          <button 
            onClick={onToggleDarkMode} 
            className="sidebar-theme-switch-row-btn"
            title={darkMode ? 'Switch to Warm Cream Light' : 'Switch to Cozy Cocoa Dark'}
          >
            <span className="sidebar-theme-switch-content">
              {darkMode ? <Sun size={17} className="sunset-glow-icon" /> : <Moon size={17} className="midnight-glow-icon" />}
              <span className="theme-switch-literal">
                {darkMode ? 'Light Theme Mode' : 'Dark Theme Mode'}
              </span>
            </span>
            <div className={`theme-toggle-pill-switch ${darkMode ? 'is-active-dark' : ''}`}>
              <span className="toggle-thumb-slider"></span>
            </div>
          </button>
        </div>

      </aside>
    </>
  );
}
