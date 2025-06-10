import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Chatbot from './components/Chatbot';
import './index.css';

function App() {
    return (
         
             <div className="App">
              <Chatbot/>
            </div>
    );
}

export default App;
