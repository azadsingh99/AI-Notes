import React, { useState, useRef } from 'react';
import axios from 'axios';
import Draggable from 'react-draggable';
import { toast } from 'react-toastify';
import '../styles/Note.css';

const API_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';

const Note = ({ note, onDrag, onSave, onDelete }) => {
  const [isEditing, setIsEditing] = useState(note.isNew);
  const [content, setContent] = useState(note.content);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const nodeRef = useRef(null);

  const handleDrag = (e, data) => {
    onDrag(note.id, { x: data.x, y: data.y });
  };

  const handleSave = async () => {
    if (!content.trim()) {
      toast.warn('Please add some content first');
      return;
    }

    setIsSaving(true);
    const success = await onSave(note, content);
    if (success) {
      setIsEditing(false);
    }
    setIsSaving(false);
  };

  const enhanceNote = async (type) => {
    if (note.isNew) {
      toast.warn('Please save the note first before enhancing');
      return;
    }

    if (!content.trim()) {
      toast.warn('Please add some content first');
      return;
    }
    
    setIsEnhancing(true);
    try {
      const response = await axios.post(`${API_URL}/api/notes/enhance`, {
        content,
        enhancement: type
      });
      if (response.data.enhancedContent) {
        setContent(response.data.enhancedContent);
        toast.success('Note enhanced');
      } else {
        throw new Error('Invalid response from AI service');
      }
    } catch (error) {
      toast.error('Failed to enhance note');
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      position={note.position}
      onStop={handleDrag}
      bounds="parent"
    >
      <div ref={nodeRef} className="note">
        <div className="note-header">
          <div className="note-actions">
            {!isEditing && (
              <button onClick={() => setIsEditing(true)}>Edit</button>
            )}
            <button 
              onClick={() => onDelete(note)}
              className="delete-btn"
            >
              Delete
            </button>
          </div>
        </div>
        
        {isEditing ? (
          <div className="note-edit">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start typing..."
              disabled={isSaving || isEnhancing}
              autoFocus
            />
            <div className="enhance-buttons">
              <button 
                onClick={() => enhanceNote('grammar')}
                disabled={isEnhancing || isSaving || note.isNew}
              >
                Improve
              </button>
              <button 
                onClick={() => enhanceNote('expand')}
                disabled={isEnhancing || isSaving || note.isNew}
              >
                Expand
              </button>
              <button 
                onClick={() => enhanceNote('summary')}
                disabled={isEnhancing || isSaving || note.isNew}
              >
                Summarize
              </button>
            </div>
            <button 
              onClick={handleSave}
              disabled={isSaving || isEnhancing}
              className={isSaving ? 'saving' : 'save-btn'}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        ) : (
          <div className="note-content">{content}</div>
        )}
      </div>
    </Draggable>
  );
};

export default Note;
