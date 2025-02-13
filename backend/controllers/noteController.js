const Note = require('../models/Note');
const axios = require('axios');

// Get all notes
const getNotes = async (req, res) => {
  try {
    const notes = await Note.find();
    res.json(notes);
  } catch (error) {
    console.error('Error in getNotes:', error);
    res.status(500).json({ message: 'Failed to fetch notes' });
  }
};

// Create a note
const createNote = async (req, res) => {
  try {
    const note = new Note({
      title: req.body.title || '',
      content: req.body.content || '',
      position: req.body.position || { x: 0, y: 0 }
    });

    const newNote = await note.save();
    res.status(201).json(newNote);
  } catch (error) {
    console.error('Error in createNote:', error);
    res.status(400).json({ message: 'Failed to create note' });
  }
};

// Update a note
const updateNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (req.body.title !== undefined) note.title = req.body.title;
    if (req.body.content !== undefined) note.content = req.body.content;
    if (req.body.position) note.position = req.body.position;

    const updatedNote = await note.save();
    res.json(updatedNote);
  } catch (error) {
    console.error('Error in updateNote:', error);
    res.status(400).json({ message: 'Failed to update note' });
  }
};

// Delete a note
const deleteNote = async(req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    await note.deleteOne();
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error in deleteNote:', error);
    res.status(500).json({ message: 'Failed to delete note' });
  }
};

// AI Integration to perform the Enhancement Operation
const enhanceNote = async (req, res) =>  {
  try {
    const { content, enhancement } = req.body;
    if (!content) {
      return res.status(400).json({ message: 'Content is required for enhancement' });
    }

    let prompt;
    switch (enhancement) {
      case 'grammar':
        prompt = `Improve the grammar and style of this text: ${content}`;
        break;
      case 'summary':
        prompt = `Summarize this text: ${content}`;
        break;
      case 'expand':
        prompt = `Expand this text with more details: ${content}`;
        break;
      default:
        prompt = `Improve this text: ${content}`;
    }

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: `${process.env.MODEL}`,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'http://localhost:3000',
        'Content-Type': 'application/json'
      }
    });

    if (!response.data?.choices?.[0]?.message?.content) {
      console.error('Invalid AI response:', response.data);
      throw new Error('Invalid response structure from AI service');
    }

    res.json({ enhancedContent: response.data.choices[0].message.content.trim() });
  } catch (error) {
    console.error('Error in enhanceNote:', error);
    if (error.response) {
      console.error('AI service response:', error.response.data);
    }
    res.status(500).json({ 
      message: 'Failed to enhance note',
      error: error.message
    });
  }
};

module.exports = {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  enhanceNote
};
