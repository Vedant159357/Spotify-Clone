// Queue system and state management
let songQueue = [];
let currentSongIndex = -1;
let isShuffleActive = false;
let isRepeatActive = false;
let songs = [];
let isMiniPlayer = false;
let isDarkTheme = true;

// Audio Context for visualizer
let audioContext = null;
let analyser = null;
let dataArray = null;
let canvas = null;
let canvasCtx = null;

// Default thumbnail for songs
const defaultThumbnail =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23333'/%3E%3Cpath d='M70 50 L70 150 L150 100 Z' fill='%2300ff88'/%3E%3C/svg%3E";

// Predefined Seedhe Maut songs
const seedheMautSongs = [
  {
    id: 1,
    title: "Luka Chippi",
    artist: "Seedhe Maut",
    thumbnail: defaultThumbnail,
    audioFile: "songs/Luka Chippi.mp3",
    duration: "2:21", // Will be dynamically updated
  },
  {
    id: 2,
    title: "KODAK",
    artist: "Seedhe Maut",
    thumbnail: defaultThumbnail,
    audioFile: "songs/KODAK.mp3",
    duration: "6:16", // Will be dynamically updated
  },
  {
    id: 3,
    title: "Namastute",
    artist: "Seedhe Maut",
    thumbnail: defaultThumbnail,
    audioFile: "songs/Namastute.mp3",
    duration: "2:00",
  },
  {
    id: 4,
    title: "11K",
    artist: "Seedhe Maut",
    thumbnail: defaultThumbnail,
    audioFile: "songs/11K.mp3",
    duration: "2:59",
  },
  {
    id: 5,
    title: "Naksha",
    artist: "Seedhe Maut",
    thumbnail: defaultThumbnail,
    audioFile: "songs/Naksha.mp3",
    duration: "3:49",
  },
  {
    id: 6,
    title: "Nanchaku",
    artist: "Seedhe Maut",
    thumbnail: defaultThumbnail,
    audioFile: "songs/Nanchaku.mp3",
    duration: "3:18",
  },
  {
    id: 7,
    title: "SHUTDOWN",
    artist: "Seedhe Maut",
    thumbnail: defaultThumbnail,
    audioFile: "songs/SHUTDOWN.mp3",
    duration: "1:56",
  },
  {
    id: 8,
    title: "Raat ki Rani",
    artist: "Seedhe Maut",
    thumbnail: defaultThumbnail,
    audioFile: "songs/Raat ki Rani.mp3",
    duration: "3:57",
  },
  {
    id: 9,
    title: "Khatta Flow",
    artist: "Seedhe Maut",
    thumbnail: defaultThumbnail,
    audioFile: "songs/Khatta Flow.mp3",
    duration: "2:39",
  },
  {
    id: 10,
    title: "Hola Amigo",
    artist: "Seedhe Maut",
    thumbnail: defaultThumbnail,
    audioFile: "songs/Hola Amigo.mp3",
    duration: "4:03",
  },
  {
    id: 11,
    title: "TT",
    artist: "Seedhe Maut",
    thumbnail: defaultThumbnail,
    audioFile: "songs/TT.mp3",
    duration: "6:05",
  },
  {
    id: 12,
    title: "Akatsuki",
    artist: "Seedhe Maut",
    thumbnail: defaultThumbnail,
    audioFile: "songs/Akatsuki.mp3",
    duration: "2:35",
  },
  {
    id: 13,
    title: "Bure Din",
    artist: "Seedhe Maut",
    thumbnail: defaultThumbnail,
    audioFile: "songs/Bure Din.mp3",
    duration: "4:25",
  },
  {
    id: 14,
    title: "Kaanch ke Ghar",
    artist: "Seedhe Maut",
    thumbnail: defaultThumbnail,
    audioFile: "songs/Kaanch ke Ghar.mp3",
    duration: "5:32",
  },
  {
    id: 15,
    title: "101",
    artist: "Seedhe Maut",
    thumbnail: defaultThumbnail,
    audioFile: "songs/101.mp3",
    duration: "3:17",
  },
];

// Function to load songs into the grid
function loadSongs() {
  const songGrid = document.querySelector(".song-grid");
  songGrid.innerHTML = ""; // Clear existing songs

  songs.forEach((song) => {
    const songItem = document.createElement("div");
    songItem.className = "song-item";
    songItem.innerHTML = `
      <img src="${song.thumbnail}" alt="${song.title}" class="song-thumbnail">
      <div class="song-info">
        <span class="song-name">${song.title}</span>
        <span class="song-artist">${song.artist}</span>
        <span class="song-duration">${song.duration}</span>
      </div>
    `;
    songGrid.appendChild(songItem);
  });
}

// Initialize the application
document.addEventListener("DOMContentLoaded", function () {
  setupKeyboardShortcuts();
  setupThemeToggle();

  // Add mini player button click handler
  document
    .querySelector(".mini-player-btn")
    .addEventListener("click", toggleMiniPlayer);
  // Initialize songs
  songs = seedheMautSongs;
  songQueue = [...songs];
  loadSongs();

  // Search functionality
  const searchInput = document.querySelector(".search-input");
  searchInput.addEventListener("input", function (e) {
    const searchTerm = e.target.value.toLowerCase();
    const filteredSongs = songs.filter(
      (song) =>
        song.title.toLowerCase().includes(searchTerm) ||
        song.artist.toLowerCase().includes(searchTerm)
    );
    displaySearchResults(filteredSongs);
  });

  // Double click to toggle mini player
  document
    .getElementById("player-controls")
    .addEventListener("dblclick", toggleMiniPlayer);

  // Add click event to song items
  document.querySelector(".song-grid").addEventListener("click", function (e) {
    const songItem = e.target.closest(".song-item");
    if (songItem) {
      const index = Array.from(songItem.parentElement.children).indexOf(
        songItem
      );
      currentSongIndex = index;
      playSongAtIndex(currentSongIndex);
    }
  });

  // Initialize scroll behavior
  initializeScroll();

  // Show keyboard shortcuts info on '?' key press
  document.addEventListener("keydown", function (e) {
    if (e.key === "?") {
      document
        .querySelector(".keyboard-shortcuts-info")
        .classList.toggle("show");
    }
  });
});

// Setup audio visualizer
function setupAudioVisualizer() {
  try {
    canvas = document.getElementById("equalizer");
    if (!canvas) {
      console.error("Equalizer canvas not found");
      return;
    }

    canvasCtx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Only initialize audio context after user interaction
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;

      const audioSource = audioContext.createMediaElementSource(audioElement);
      audioSource.connect(analyser);
      analyser.connect(audioContext.destination);

      dataArray = new Uint8Array(analyser.frequencyBinCount);
    }

    drawVisualizer();
  } catch (error) {
    console.error("Error setting up audio visualizer:", error);
  }
}

// Draw visualizer
function drawVisualizer() {
  requestAnimationFrame(drawVisualizer);

  const WIDTH = canvas.width;
  const HEIGHT = canvas.height;
  const bufferLength = analyser.frequencyBinCount;

  analyser.getByteFrequencyData(dataArray);

  canvasCtx.fillStyle = "rgba(0, 0, 0, 0.2)";
  canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

  const barWidth = (WIDTH / bufferLength) * 2.5;
  let barHeight;
  let x = 0;

  for (let i = 0; i < bufferLength; i++) {
    barHeight = dataArray[i] / 2;

    canvasCtx.fillStyle = `rgb(0, ${255 * (barHeight / 100)}, 136)`;
    canvasCtx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

    x += barWidth + 1;
  }
}

// Setup keyboard shortcuts
function setupKeyboardShortcuts() {
  document.addEventListener("keydown", function (e) {
    if (e.target.tagName === "INPUT") return; // Ignore if typing in input field

    switch (e.code) {
      case "Space":
        e.preventDefault();
        playSong();
        break;
      case "ArrowRight":
        nextSong();
        break;
      case "ArrowLeft":
        prevSong();
        break;
      case "KeyM":
        toggleMiniPlayer();
        break;
      case "KeyN":
        audioElement.muted = !audioElement.muted;
        break;
      case "KeyS":
        document.querySelector(".shuffle-btn").click();
        break;
      case "KeyR":
        document.querySelector(".repeat-btn").click();
        break;
    }
  });
}

// Toggle mini player
function toggleMiniPlayer() {
  const playerControls = document.getElementById("player-controls");
  const miniPlayerBtn = document.querySelector(".mini-player-btn");
  isMiniPlayer = !isMiniPlayer;
  playerControls.classList.toggle("mini-player");
  miniPlayerBtn.textContent = isMiniPlayer ? "📺" : "📱";
  miniPlayerBtn.classList.toggle("active");
}

// Setup theme toggle
function setupThemeToggle() {
  const themeToggle = document.querySelector(".theme-toggle");
  const themeIcon = document.querySelector(".theme-icon");

  themeToggle.addEventListener("click", () => {
    isDarkTheme = !isDarkTheme;
    document.body.classList.toggle("light-theme");
    themeIcon.textContent = isDarkTheme ? "🌙" : "☀️";
  });
}

// Function to display search results
function displaySearchResults(filteredSongs) {
  const songGrid = document.querySelector(".song-grid");
  songGrid.innerHTML = "";

  filteredSongs.forEach((song) => {
    const songItem = document.createElement("div");
    songItem.className = "song-item";
    songItem.innerHTML = `
      <img src="${song.thumbnail}" alt="${song.title}" class="song-thumbnail">
      <div class="song-info">
        <span class="song-name">${song.title}</span>
        <span class="song-artist">${song.artist}</span>
        <span class="song-duration">${song.duration}</span>
      </div>
    `;
    songGrid.appendChild(songItem);
  });
}

// Initialize smooth scrolling
function initializeScroll() {
  const container = document.querySelector(".container");
  const songGrid = document.querySelector(".song-grid");

  // Set initial container height
  updateContainerHeight();

  // Add smooth scrolling
  container.style.scrollBehavior = "smooth";

  // Add scroll event listener for infinite scroll effect
  container.addEventListener("scroll", function () {
    const scrollPosition = container.scrollTop;
    const totalHeight = container.scrollHeight;
    const containerHeight = container.clientHeight;

    // If user has scrolled to bottom, load more content if available
    if (scrollPosition + containerHeight >= totalHeight - 100) {
      // Here you could load more songs if available
      console.log("Reached bottom of scroll");
    }
  });

  // Handle window resize
  window.addEventListener("resize", updateContainerHeight);
}

function updateContainerHeight() {
  const container = document.querySelector(".container");
  const songGrid = document.querySelector(".song-grid");
  const containerHeight = window.innerHeight - 240;
  container.style.height = `${containerHeight}px`;
  songGrid.style.minHeight = `calc(100vh - 240px)`;
}

// Audio player functionality
const audioElement = document.getElementById("audioElement");
const progressSlider = document.querySelector(".progress-slider");
const playBtn = document.querySelector(".play-btn");
const prevBtn = document.querySelector(".prev-btn");
const nextBtn = document.querySelector(".next-btn");
const shuffleBtn = document.querySelector(".shuffle-btn");
const repeatBtn = document.querySelector(".repeat-btn");
const volumeSlider = document.querySelector(".volume-slider");
const currentTimeDisplay = document.querySelector(".time-display:first-child");
const durationDisplay = document.querySelector(".time-display:last-child");

// Volume control
volumeSlider.addEventListener("input", function (e) {
  audioElement.volume = e.target.value / 100;
});

// Shuffle functionality
shuffleBtn.addEventListener("click", function () {
  isShuffleActive = !isShuffleActive;
  this.classList.toggle("active");
  if (isShuffleActive) {
    shuffleQueue();
  } else {
    resetQueue();
  }
});

// Repeat functionality
repeatBtn.addEventListener("click", function () {
  isRepeatActive = !isRepeatActive;
  this.classList.toggle("active");
  audioElement.loop = isRepeatActive;
});

function shuffleQueue() {
  for (let i = songQueue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [songQueue[i], songQueue[j]] = [songQueue[j], songQueue[i]];
  }
}

function resetQueue() {
  songQueue = [...songs];
  currentSongIndex = songQueue.findIndex(
    (song) =>
      song.title === document.querySelector(".current-song-name").textContent
  );
}

// Set up event listeners
playBtn.addEventListener("click", playSong);
prevBtn.addEventListener("click", prevSong);
nextBtn.addEventListener("click", nextSong);
progressSlider.addEventListener("input", progressSliderChange);
audioElement.addEventListener("timeupdate", updateProgress);
audioElement.addEventListener("loadedmetadata", updateDuration);
audioElement.addEventListener("ended", handleSongEnd);

function handleSongEnd() {
  if (!isRepeatActive) {
    nextSong();
  }
}

// Audio control functions
function playSong() {
  if (audioElement.paused) {
    // Initialize audio context on first play
    if (!audioContext) {
      setupAudioVisualizer();
    }
    audioElement.play().catch((error) => {
      console.log("Error playing audio:", error);
      alert(
        "Unable to play audio. Please make sure audio files are available."
      );
    });
    playBtn.textContent = "⏸";
    playBtn.classList.add("playing");
  } else {
    audioElement.pause();
    playBtn.textContent = "▶";
    playBtn.classList.remove("playing");
  }
}

function prevSong() {
  if (currentSongIndex > 0) {
    currentSongIndex--;
    playSongAtIndex(currentSongIndex);
  }
}

function nextSong() {
  if (currentSongIndex < songQueue.length - 1) {
    currentSongIndex++;
    playSongAtIndex(currentSongIndex);
  } else if (isRepeatActive) {
    currentSongIndex = 0;
    playSongAtIndex(currentSongIndex);
  }
}

function playSongAtIndex(index) {
  const song = songQueue[index];
  if (!song.audioFile) {
    console.log("No audio file available for this song");
    alert("This song is not available for playback.");
    return;
  }

  audioElement.src = song.audioFile;
  document.querySelector(".current-song-thumbnail").src = song.thumbnail;
  document.querySelector(".current-song-name").textContent = song.title;
  document.querySelector(".current-song-artist").textContent = song.artist;

  audioElement.play().catch((error) => {
    console.log("Error playing audio:", error);
    alert("Unable to play audio. Please make sure audio files are available.");
  });
  playBtn.textContent = "⏸";
  playBtn.classList.add("playing");
}

function progressSliderChange(e) {
  const progress = e.target.value;
  audioElement.currentTime = (progress * audioElement.duration) / 100;
}

function updateProgress(e) {
  const progress = (audioElement.currentTime / audioElement.duration) * 100;
  progressSlider.value = progress;
  currentTimeDisplay.textContent = formatTime(audioElement.currentTime);
}

function updateDuration(e) {
  durationDisplay.textContent = formatTime(audioElement.duration);
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  seconds = Math.floor(seconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
