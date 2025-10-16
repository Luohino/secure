import React, { useState, useEffect, useRef } from 'react';
import LoginScreen from './LoginScreen';
import ChatScreen from './ChatScreen';
import './App.css';

function App() {
  const [user, setUser] = useState<string | null>(null);
  const silentAudioRef = useRef<HTMLAudioElement>(null);

  const handleLogin = (loggedInUser: string) => {
    setUser(loggedInUser);
  };

  useEffect(() => {
    const manageSilentAudio = (play: boolean) => {
      if (silentAudioRef.current) {
        if (play) {
          silentAudioRef.current.play().catch(e => console.log('Silent audio play failed:', e));
        } else {
          silentAudioRef.current.pause();
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (user) {
          manageSilentAudio(true);
        }
      } else {
        manageSilentAudio(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  return (
    <div className="App">
      <audio ref={silentAudioRef} loop src="data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhIAAAAAEA" hidden></audio>
      {!user ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <ChatScreen user={user} />
      )}
    </div>
  );
}

export default App;