import React from 'react';
import NoteCanvas from './components/NoteCanvas';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <div className="App">
      <NoteCanvas />
      <ToastContainer position="bottom-right" />
    </div>
  );
}

export default App;
