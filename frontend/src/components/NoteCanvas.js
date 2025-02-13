import React, { useState, useEffect } from 'react';
import Note from './Note';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../styles/NoteCanvas.css';

const API_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';

const NoteCanvas = () => {
  const [notes, setNotes] = useState([]);
  const [tempNoteId, setTempNoteId] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    fetchNotes(true);
  }, []);

  const fetchNotes = async (isInitialLoad = false) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/notes`);
      setNotes(response.data.map(note => ({ ...note, id: note._id })));
      setInitialized(true);
    } catch (error) {
      if (!isInitialLoad) {
        const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to fetch notes. Please try again.';
        toast.error(errorMessage);
      }
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (id, position) => {
    setNotes(notes.map(note =>
      note.id === id ? { ...note, position } : note
    ));
  };

  const createNote = () => {
    const offset = notes.length * 30;
    const newNote = {
      id: `temp-${tempNoteId}`,
      content: '',
      position: { x: 100 + offset, y: 100 + offset },
      isNew: true
    };
    setNotes([...notes, newNote]);
    setTempNoteId(tempNoteId + 1);
  };

  const handleSaveNote = async (note, content) => {
    try {
      if (note.isNew) {
        const response = await axios.post(`${API_URL}/api/notes`, {
          content,
          position: note.position
        });
        setNotes(notes.map(n => 
          n.id === note.id ? { ...response.data, id: response.data._id, isNew: false } : n
        ));
      } else {
        await axios.put(`${API_URL}/api/notes/${note.id}`, {
          content,
          position: note.position
        });
      }
      toast.success('Note saved');
      return true;
    } catch (error) {
      toast.error('Failed to save note');
      return false;
    }
  };

  const handleDeleteNote = async (note) => {
    try {
      if (!note.isNew) {
        await axios.delete(`${API_URL}/api/notes/${note.id}`);
      }
      setNotes(notes.filter(n => n.id !== note.id));
      toast.success('Note deleted');
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  return (
    <div className="note-canvas">
      <div className="header">
        <h1>AI Notes</h1>
        <button 
          className="create-note-btn" 
          onClick={createNote}
          disabled={loading}
        >
          {loading ? 'Creating...' : '+ Create Note'}
        </button>
      </div>
      <div className="notes-container">
        {notes.map(note => (
          <Note
            key={note.id}
            note={note}
            onDrag={handleDrag}
            onSave={handleSaveNote}
            onDelete={handleDeleteNote}
            initialized={initialized}
          />
        ))}
      </div>
    </div>
  );
};

export default NoteCanvas;
