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
      player.reverse = !player.reversel; // Toggle the reverse state
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

  // Function to gradually increase playback rate to simulate tape start
  const tapeStart = async () => {
    if (!player) return;
    if (Tone.context.state !== "running") {
      await Tone.start(); // Start the Tone context if not already running
    }
    player.reverse = false; // Ensure playback is not in reverse
    player.playbackRate = 0.1; // Start at a low rate
    player.sync().start(0);
    Tone.Transport.start();

    const accelerate = setInterval(() => {
      if (player.playbackRate < 1) {
        player.playbackRate += 0.1; // Incrementally increase playback rate
        setPlaybackRate(player.playbackRate);
      } else {
        clearInterval(accelerate);
        player.playbackRate = 1; // Ensure playback rate is set to normal
        setPlaybackRate(1);
      }
    }, 100); // Adjust the interval as needed for a smoother increase
  };

  // Function to gradually decrease playback rate to simulate tape stop
  const tapeStop = () => {
    if (!player) return;

    const decelerate = setInterval(() => {
      if (player.playbackRate > 0.1) {
        player.playbackRate -= 0.1; // Incrementally decrease playback rate
        setPlaybackRate(player.playbackRate);
      } else {
        clearInterval(decelerate);
        Tone.Transport.stop();
        player.unsync();
        player.playbackRate = 1; // Reset playback rate for future plays
        setIsPlaying(false);
        setPlaybackRate(1);
      }
    }, 100); // Adjust the interval as needed for a smoother decrease
  };

  // Function to increase playback rate by 20%
  const fastForwardStart = () => {
    if (!player) return;
    if (Tone.context.state !== "running") {
      Tone.start(); // Ensure the audio context is running
    }
    const increasedRate = playbackRate * 1.2;
    player.playbackRate = increasedRate; // Set playback rate to 120% of current rate
    setPlaybackRate(increasedRate);

    if (Tone.Transport.state !== "started") {
      player.sync().start(0); // Sync and start player if not already playing
      Tone.Transport.start();
      setIsPlaying(true);
    }
  };

  // Function to reset playback rate to normal
  const fastForwardStop = () => {
    if (!player) return;
    player.playbackRate = 1; // Reset playback rate to normal
    setPlaybackRate(1);
  };

  return (
    <div>
      <TurnTableSVG />
      <div id="controls" className="flex flex-row justify-between pb-4">
        {/* <button
          onClick={handlePlayPause}
          className="border border-black border-solid"
        >
          play/pause
        </button> */}

        {/* <button onClick={handleStop}>stop</button> */}
      </div>

      <div className="flex justify-between pb-5">
        <button onClick={tapeStart}>Tape Start</button>
        <button onClick={tapeStop}>Tape Stop</button>
      </div>

      <div className="flex justify-between">
        <button
          onMouseDown={startRewind}
          onMouseUp={stopRewind}
          onMouseLeave={stopRewind}
          onTouchStart={startRewind}
          onTouchEnd={stopRewind}
        >
          Reverse
        </button>
        <button
          onMouseDown={fastForwardStart}
          onMouseUp={fastForwardStop}
          onMouseLeave={fastForwardStop}
        >
          Fast Forward
        </button>{" "}
      </div>
      {/* fwequeswie
      <input
        type="range"
        min="500"
        max="5000"
        value={filterFreq}
        onChange={updateFilterFrequency}
        style={{ width: "100%" }}
        step="10"
      /> */}

      <label>
        tempo{" "}
        <input
          type="range"
          min={0.9}
          max={1.1}
          value={playbackRate}
          onChange={updatePlaybackRate}
          style={{ width: "100%" }}
          step="0.01"
        />
      </label>
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
