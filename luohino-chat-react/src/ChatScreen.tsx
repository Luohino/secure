import React, { useState, useEffect, useRef } from 'react';
import Peer, { DataConnection, MediaConnection } from 'peerjs';

// Since crypto-js is a global script, we need to declare it
declare const CryptoJS: any;

interface ChatScreenProps {
  user: string;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ user }) => {
  const [peer, setPeer] = useState<Peer | null>(null);
  const [connection, setConnection] = useState<DataConnection | null>(null);
  const [messages, setMessages] = useState<
    { text: string; type: 'sent' | 'received' | 'system' }[]
  >([]);
  const [friendId, setFriendId] = useState('');
  const [currentCall, setCurrentCall] = useState<MediaConnection | null>(
    null
  );
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceActivity, setVoiceActivity] = useState('speaking-none');
  const [lastCallType, setLastCallType] = useState({ video: false, audio: false });

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const ENCRYPTION_KEY = 'SecureChat2024!@#$%^&*()_+';
  const otherUser = user === 'Luohino' ? 'Tanaya' : 'Luohino';

  useEffect(() => {
    const newPeer = new Peer(user.toLowerCase(), {
      debug: 1,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' },
        ],
      },
      secure: window.location.protocol === 'https:',
    });

    setPeer(newPeer);

    newPeer.on('open', (id) => {
      addSystemMessage(`Connected as ${user} (ID: ${id})`);
      addSystemMessage(`Ready to connect with ${otherUser}`);
    });

    newPeer.on('connection', (conn) => {
      setConnection(conn);
    });

    newPeer.on('call', (call) => {
      if (window.confirm(`Incoming call from ${otherUser}. Accept?`)) {
        navigator.mediaDevices
          .getUserMedia({ video: true, audio: true })
          .then((stream) => {
            setLocalStream(stream);
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = stream;
            }
            call.answer(stream);
            setCurrentCall(call);
            call.on('stream', (remoteStream) => {
              setRemoteStream(remoteStream);
              if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remoteStream;
              }
            });
          })
          .catch((err) => {
            console.error('Failed to get local stream', err);
          });
      }
    });

    return () => {
      newPeer.destroy();
    };
  }, [user, otherUser]);

  useEffect(() => {
    if (connection) {
      connection.on('data', (data: any) => {
        const decryptedMessage = decryptMessage(data);
        addMessage(decryptedMessage, 'received');
      });
      connection.on('open', () => {
        addSystemMessage(`${otherUser} is now connected!`);
      });
    }
  }, [connection, otherUser]);

  useEffect(() => {
    if (localStream && remoteStream) {
      const localAudioContext = new window.AudioContext();
      const localSource = localAudioContext.createMediaStreamSource(localStream);
      const localAnalyser = localAudioContext.createAnalyser();
      localAnalyser.fftSize = 256;
      localSource.connect(localAnalyser);

      const remoteAudioContext = new window.AudioContext();
      const remoteSource = remoteAudioContext.createMediaStreamSource(remoteStream);
      const remoteAnalyser = remoteAudioContext.createAnalyser();
      remoteAnalyser.fftSize = 256;
      remoteSource.connect(remoteAnalyser);

      const voiceDetectionInterval = setInterval(() => {
        const localSpeaking = isAudioActive(localAnalyser);
        const remoteSpeaking = isAudioActive(remoteAnalyser);

        if (localSpeaking && remoteSpeaking) {
          setVoiceActivity('speaking-self');
        } else if (localSpeaking) {
          setVoiceActivity('speaking-self');
        } else if (remoteSpeaking) {
          setVoiceActivity('speaking-peer');
        } else {
          setVoiceActivity('speaking-none');
        }
      }, 100);

      return () => {
        clearInterval(voiceDetectionInterval);
        localAudioContext.close();
        remoteAudioContext.close();
      };
    }
  }, [localStream, remoteStream]);

  const isAudioActive = (analyser: AnalyserNode) => {
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);
    const sum = dataArray.reduce((a, b) => a + b, 0);
    const average = sum / dataArray.length;
    return average > 15;
  };

  useEffect(() => {
    const callHealthTimer = setInterval(() => {
      if (currentCall && currentCall.peerConnection) {
        if (
          currentCall.peerConnection.connectionState === 'disconnected' ||
          currentCall.peerConnection.connectionState === 'failed'
        ) {
          console.log('Call disconnected, attempting to reconnect...');
          addSystemMessage('Call disconnected, attempting to reconnect...');
          endCall();
          startCall(lastCallType.video);
        }
      }
    }, 2000);

    return () => {
      clearInterval(callHealthTimer);
    };
  }, [currentCall]);

  const addMessage = (
    text: string,
    type: 'sent' | 'received' | 'system'
  ) => {
    setMessages((prevMessages) => [...prevMessages, { text, type }]);
  };

  const addSystemMessage = (text: string) => {
    addMessage(text, 'system');
  };

  const encryptMessage = (message: string) => {
    return CryptoJS.AES.encrypt(message, ENCRYPTION_KEY).toString();
  };

  const decryptMessage = (encryptedMessage: string) => {
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  };

  const handleConnect = () => {
    if (peer && friendId) {
      const conn = peer.connect(friendId.toLowerCase());
      setConnection(conn);
    }
  };

  const handleSendMessage = (message: string) => {
    if (connection && message) {
      const encryptedMessage = encryptMessage(message);
      connection.send(encryptedMessage);
      addMessage(message, 'sent');
    }
  };

  const startCall = (video: boolean) => {
    setLastCallType({ video, audio: true });
    navigator.mediaDevices
      .getUserMedia({ video, audio: true })
      .then((stream) => {
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        if (peer && connection) {
          const call = peer.call(connection.peer, stream);
          setCurrentCall(call);
          call.on('stream', (remoteStream) => {
            setRemoteStream(remoteStream);
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
            }
          });
        }
      });
  };

  const endCall = () => {
    if (currentCall) {
      currentCall.close();
    }
    setCurrentCall(null);
    setLocalStream(null);
    setRemoteStream(null);
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const startScreenShare = () => {
    navigator.mediaDevices.getDisplayMedia({ video: true, audio: true }).then((stream) => {
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      if (peer && connection) {
        const call = peer.call(connection.peer, stream);
        setCurrentCall(call);
        call.on('stream', (remoteStream) => {
          setRemoteStream(remoteStream);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        });
      }
    });
  };

  return (
    <div id="chatScreen" className="container">
      <div className="left-panel">
        <div className="user-info">
          <div className="user-avatar" id="userAvatar"></div>
          <div id="userName">{user}</div>
        </div>

        <div id="statusIndicator" className="status-indicator status-offline">
          <div className="status-dot"></div>
          <span id="statusText">Connecting...</span>
        </div>

        <div className={`voice-activity ${voiceActivity}`} id="voiceActivity">
          <div className="voice-indicator">
            <div className="voice-dot" id="voiceDot"></div>
            <span id="voiceText">
              {voiceActivity === 'speaking-self'
                ? `${user} is speaking`
                : voiceActivity === 'speaking-peer'
                ? `${otherUser} is speaking`
                : 'No one speaking'}
            </span>
          </div>
        </div>

        <div className="call-controls">
          <button className="control-btn voice-btn" onClick={() => startCall(false)}>
            Voice Call
          </button>
          <button className="control-btn video-btn" onClick={() => startCall(true)}>
            Video Call
          </button>
          <button className="control-btn screen-btn" id="screenShareBtn" onClick={startScreenShare}>
            Screen Share
          </button>
          <button className="control-btn end-btn" id="endCallBtn" onClick={endCall} disabled={!currentCall}>
            End Call
          </button>
        </div>

        <div className="audio-controls" id="audioControls">
          <button className="audio-control-btn" id="muteBtn" onClick={toggleMute}>
            {isMuted ? 'Unmute' : 'Mute'}
          </button>
          <button className="audio-control-btn" id="speakerBtn">
            Speaker
          </button>
          <button className="audio-control-btn" id="bluetoothBtn">
            Bluetooth
          </button>
          <button className="audio-control-btn" id="micBtn">
            Microphone
          </button>
        </div>

        <div className="video-container">
          <div className="video-wrapper">
            <video ref={localVideoRef} autoPlay muted playsInline></video>
            <div className="video-label">You</div>
          </div>
          <div className="video-wrapper">
            <video ref={remoteVideoRef} autoPlay playsInline controls></video>
            <div className="video-label" id="remoteLabel">
              {otherUser}
            </div>
          </div>
        </div>
      </div>

      <div className="right-panel">
        <div className="connect-section" id="connectSection">
          <div className="input-group">
            <input
              type="text"
              id="friendIdInput"
              placeholder={`Type '${otherUser.toLowerCase()}' to connect`}
              value={friendId}
              onChange={(e) => setFriendId(e.target.value)}
            />
            <button className="btn" id="connectBtn" onClick={handleConnect}>
              Connect
            </button>
          </div>
        </div>

        <div className="messages-container" id="messagesContainer">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.type}`}>
              {msg.text}
            </div>
          ))}
        </div>

        <div className="input-group">
          <input
            type="text"
            id="messageInput"
            placeholder="Type your message..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
          />
          <button
            className="btn"
            id="sendBtn"
            onClick={() => {
              const input = document.getElementById(
                'messageInput'
              ) as HTMLInputElement;
              handleSendMessage(input.value);
              input.value = '';
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;