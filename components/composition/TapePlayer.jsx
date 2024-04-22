"use client"

import React, { useState, useEffect } from 'react';
import * as Tone from 'tone';

const TapeMachine = ({ song = '/swag.mp3' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [player, setPlayer] = useState(null);
  const [audioBuffer, setAudioBuffer] = useState(null);
  const [rewindIntervalId, setRewindIntervalId] = useState(null);

  useEffect(() => {
    // Load the audio into the buffer
    const buffer = new Tone.ToneAudioBuffer(song, () => {
      setAudioBuffer(buffer);
    });
    // buffer.load().then(() => {
    //   setAudioBuffer(buffer);
    // });

    return () => {
      if (rewindIntervalId) {
        clearInterval(rewindIntervalId);
      }
    };
  }, [song]);

  const handlePlay = () => {
    if (!audioBuffer) return;
    if (player) {
      player.stop();
    }

    // Create a new buffer source for playback
    const newPlayer = new Tone.BufferSource(audioBuffer).toDestination();
    newPlayer.loop = true;
    newPlayer.start();
    setPlayer(newPlayer);
    setIsPlaying(true);
  };

  const handlePause = () => {
    if (player) {
      player.stop(); // Stop the current playback
      setIsPlaying(false);
    }
  };

  const handleRewind = (start) => {
    if (!audioBuffer || !isPlaying) return;

    if (start) {
      // Start rewinding by manipulating the playback rate negatively in intervals
      if (rewindIntervalId) clearInterval(rewindIntervalId);
      const id = setInterval(() => {
        if (player) {
          player.stop();
          const newPosition = Math.max(player.playbackTime - 0.5, 0);
          player.start(0, newPosition);
        }
      }, 100);
      setRewindIntervalId(id);
    } else {
      clearInterval(rewindIntervalId);
      setRewindIntervalId(null);
      // Resume normal playback
      handlePlay();
    }
  };

  return (
    <div>
      <button onClick={handlePlay} disabled={isPlaying}>
        Play
      </button>
      <button onClick={handlePause} disabled={!isPlaying}>
        Pause
      </button>
      <button
        onMouseDown={() => handleRewind(true)}
        onMouseUp={() => handleRewind(false)}
        onMouseLeave={() => handleRewind(false)}
        onTouchStart={() => handleRewind(true)}
        onTouchEnd={() => handleRewind(false)}
        disabled={!isPlaying}>
        Rewind
      </button>
    </div>
  );
};

export default TapeMachine;
