"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import * as Tone from "tone";

import { TurnTableSVG } from "./TurnTableSVg";

export const Player = ({ song = "/swag.mp3" }) => {
  // State to manage the playing status
  const [isPlaying, setIsPlaying] = useState(false);
  const [player, setPlayer] = useState(null);
  const [rewindIntervalId, setRewindIntervalId] = useState(null);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [reverse, setReverse] = useState(false);
  const [pitchShift, setPitchShift] = useState(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [filterFreq, setFilterFreq] = useState(2000); // Default frequency
  const [filter, setFilter] = useState(null);

  // Initialize and load the audio player on component mount
  useEffect(() => {
    const loadPlayer = async () => {
      const player = new Tone.Player(song).toDestination();
      // const pitchShift = new Tone.PitchShift().toDestination();
      const filter = new Tone.Filter(
        filterFreq,
        "lowpass",
        -48
      ).toDestination(); // Low-pass filter
      player.chain(filter);

      await Tone.loaded();

      setPlayer(player);
      setPitchShift(pitchShift);
      setFilter(filter);
      setDuration(player.buffer.duration);
    };

    loadPlayer();

    return () => {
      clearInterval(rewindIntervalId);
      player?.dispose();
      pitchShift?.dispose();
      filter?.dispose();
    };
  }, []);

  // Update the current position of the song
  useEffect(() => {
    const updatePosition = setInterval(() => {
      if (player && Tone.Transport.state === "started") {
        setPosition(Tone.Transport.seconds);
      }
    }, 100);

    return () => clearInterval(updatePosition);
  }, [player]);

  // Function to toggle play/pause based on isPlaying state
  const handlePlayPause = async () => {
    if (!player) return; // Do nothing if the player is not loaded

    if (Tone.context.state !== "running") {
      await Tone.start(); // Start the Tone context
    }

    if (isPlaying) {
      Tone.Transport.pause();
      setIsPlaying(false);
    } else {
      // Connect the player to the transport and start it at the beginning of the Transport's timeline
      player.sync().start(0);
      Tone.Transport.start();
      setIsPlaying(true);
    }
  };

  // Function to stop the audio
  const handleStop = () => {
    if (!player) return; // Do nothing if the player is not loaded

    // Stop the transport and unsync the player so it can restart from the beginning next time
    Tone.Transport.stop();
    player.unsync();
    setIsPlaying(false);
  };

  // Function to start rewinding
  const startRewind = () => {
    if (player) {
      player.reverse = !player.reverse; // Toggle the reverse state
      player.playbackRate = playbackRate - 0.3; // Slow down the playback rate
    }
    const intervalId = setInterval(() => {
      const currentPosition = Tone.Transport.seconds;
      Tone.Transport.seconds = Math.max(currentPosition - 0.5, 0);
    }, 100); // rewind 0.5 seconds every 100 ms
    setRewindIntervalId(intervalId);
  };

  // Function to stop rewinding
  const stopRewind = () => {
    if (player) {
      player.reverse = !player.reversel // Toggle the reverse state
      player.playbackRate = playbackRate; // Reset playback rate
    }
    clearInterval(rewindIntervalId);
    setReverse(false);
  };

  const handleChangePosition = (e) => {
    const newPos = parseFloat(e.target.value);
    if (player) {
      Tone.Transport.seconds = newPos;
      setPosition(newPos);
    }
  };

  const updatePlaybackRate = (e) => {
    const newValue = parseFloat(e.target.value);
    if (player) {
      player.playbackRate = newValue;
      setPlaybackRate(newValue);
    }
  };

  const updateFilterFrequency = (e) => {
    const newFreq = parseFloat(e.target.value);
    if (filter) {
      filter.frequency.value = newFreq;
      setFilterFreq(newFreq);
    }
  };

  return (
    <div>
      <TurnTableSVG />
      <div id="controls" className="flex flex-row justify-between pb-4">
        <button
          onClick={handlePlayPause}
          className="border border-black border-solid"
        >
          play/pause
        </button>

        <button onClick={handleStop}>stop</button>

        <button
          onMouseDown={startRewind}
          onMouseUp={stopRewind}
          onMouseLeave={stopRewind}
          onTouchStart={startRewind}
          onTouchEnd={stopRewind}
        >
          rewind
        </button>
      </div>
      fwequeswie
      <input
        type="range"
        min="500"
        max="5000"
        value={filterFreq}
        onChange={updateFilterFrequency}
        style={{ width: "100%" }}
        step="10"
      />
      tempo
      <input
        type="range"
        min={0.9}
        max={1.1}
        value={playbackRate}
        onChange={updatePlaybackRate}
        style={{ width: "100%" }}
        step="0.01"
      />
      <input
        type="range"
        min="0"
        max={duration}
        value={position}
        onChange={handleChangePosition}
        style={{ width: "100%" }}
      />
      <div>{`Time: ${position.toFixed(2)} / ${duration.toFixed(2)}`}</div>
    </div>
  );
};
