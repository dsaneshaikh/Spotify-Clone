let currentsong = new Audio();
let currFolder;
let library;

function convertToMinutesSeconds(timeInSeconds) {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);

  // Add leading zero if minutes or seconds are less than 10
  const paddedMinutes = minutes.toString().padStart(2, "0");
  const paddedSeconds = seconds.toString().padStart(2, "0");

  return `${paddedMinutes}:${paddedSeconds}`;
}

async function getSongs(folder) {
  try {
    currFolder = folder;
    const response = await fetch(`http://127.0.0.1:5500/${folder}`);
    const result = await response.text();

    // Create a temporary div to parse the HTML response
    let div = document.createElement("div");
    div.innerHTML = result;

    // Get all <a> tags (links to files)
    let data = div.getElementsByTagName("a");
    let songs = [];

    for (let i = 0; i < data.length; i++) {
      const element = data[i];
      // Ensure that we are only processing .mp3 files
      if (element.href.endsWith(".mp3")) {
        // Extract the song's file name, considering different folder structures
        let songName = element.href.split("/").pop().replaceAll(".mp3", "");
        songs.push(songName);
      }
    }
    library = document.querySelector(".songs").getElementsByTagName("ul")[0];
    library.innerHTML = "";
    for (const song of songs) {
      library.innerHTML += `<li class="song-card">
        <i class="fa-solid fa-music"></i> 
        <div class="info">
          <p class="songname">${song.replaceAll("%20", " ")}</p> 
          <p id="artist">Danish</p> 
        </div>
        <div class="play-section">
          <p id="playnow">Play now</p>
          <i class="fa-solid fa-play"></i>
        </div>
      </li>`;
    }

    if (songs.length > 0) {
      const firstSong = songs[0].replaceAll("%20", " ");
      let artistname = document
        .querySelector("#list")
        .getElementsByTagName("li")[0]
        .querySelector("#artist").innerHTML;
      loadMusic(firstSong, artistname);
    }

    Array.from(
      document.querySelector("#list").getElementsByTagName("li")
    ).forEach((e) => {
      let songname = e.querySelector(".songname").innerHTML;
      let artistname = e.querySelector("#artist").innerHTML;
      e.querySelector(".play-section").addEventListener("click", (e) => {
        playmusic(songname, artistname);
      });
    });

    return songs;
  } catch (error) {
    console.error("Error in getSongs:", error);
  }
}

function playmusic(track, artistname) {
  currentsong.src = `${currFolder}/${track}.mp3`;

  currentsong.addEventListener(
    "canplaythrough",
    () => {
      currentsong.play();
    },
    { once: true }
  ); // 'once: true' ensures that the event listener is removed after the first event triggers

  play.classList.remove("fa-circle-play"); // Remove play icon
  play.classList.add("fa-circle-pause"); // Add pause icon

  document.querySelector("#playersongname").innerHTML = track;
  document.querySelector("#playerartistname").innerHTML = artistname;
}
function playPreviousSong() {
  // Get the current song's name without .mp3 and decode it
  let currentSongName = decodeURIComponent(
    currentsong.src.split("/").pop().replace(".mp3", "").trim()
  );
  console.log("Current song name:", currentSongName); // Debug log

  // Get all songs in the current library and decode them
  let currentSongs = Array.from(library.getElementsByTagName("li")).map((e) =>
    decodeURIComponent(e.querySelector(".songname").innerHTML.trim())
  );

  // Log the currentSongs array for debugging
  console.log("Current songs in library:", currentSongs);

  // Find the current song's index
  let index = currentSongs.indexOf(currentSongName);

  // If the current song index is found, play the previous song
  if (index !== -1) {
    if (index > 0) {
      // Play the previous song if not the first one
      let previousSong = currentSongs[index - 1];
      let artistname = library
        .getElementsByTagName("li")
        [index - 1].querySelector("#artist").innerHTML;
      playmusic(previousSong, artistname);
    } else {
      // Loop to the last song if at the start
      let lastSong = currentSongs[currentSongs.length - 1];
      let artistname = library
        .getElementsByTagName("li")
        [currentSongs.length - 1].querySelector("#artist").innerHTML;
      playmusic(lastSong, artistname);
    }
  } else {
    console.warn("Current song not found in the current folder's songs.");
  }
}

function playNextSong() {
  // Get the current song's name without .mp3 and decode it
  let currentSongName = decodeURIComponent(
    currentsong.src.split("/").pop().replace(".mp3", "").trim()
  );
  console.log("Current song name:", currentSongName); // Debug log

  // Get all songs in the current library and decode them
  let currentSongs = Array.from(library.getElementsByTagName("li")).map((e) =>
    decodeURIComponent(e.querySelector(".songname").innerHTML.trim())
  );

  // Log the currentSongs array for debugging
  console.log("Current songs in library:", currentSongs);

  // Find the current song's index
  let index = currentSongs.indexOf(currentSongName);

  // If the current song index is found, play the next song
  if (index !== -1) {
    if (index < currentSongs.length - 1) {
      // Play the next song if not the last one
      let nextSong = currentSongs[index + 1];
      let artistname = library
        .getElementsByTagName("li")
        [index + 1].querySelector("#artist").innerHTML;
      playmusic(nextSong, artistname);
    } else {
      // Loop to the first song if at the end
      let firstSong = currentSongs[0];
      let artistname = library
        .getElementsByTagName("li")[0]
        .querySelector("#artist").innerHTML;
      playmusic(firstSong, artistname);
    }
  } else {
    console.warn("Current song not found in the current folder's songs.");
  }
}

async function main() {
  const dir = "Songs/artists/pritam";
  let songs = await getSongs(dir);
  let play = document.querySelector("#play");

  play.addEventListener("click", (e) => {
    let playing;
    if (currentsong.paused) {
      currentsong.play();
      play.classList.remove("fa-circle-play"); // Remove play icon
      play.classList.add("fa-circle-pause"); // Add pause icon
    } else {
      console.log("pause");
      currentsong.pause();
      play.classList.remove("fa-circle-pause"); // Remove pause icon
      play.classList.add("fa-circle-play"); // Add play icon
    }
  });

  currentsong.addEventListener("timeupdate", () => {
    document.querySelector("#starttime").innerHTML =
      convertToMinutesSeconds(currentsong.currentTime) + "/";
    document.querySelector("#endtime").innerHTML = convertToMinutesSeconds(
      currentsong.duration
    );
    document.querySelector(".circle").style.left =
      (currentsong.currentTime / currentsong.duration) * 100 + "%";
  });

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentsong.currentTime = (percent * currentsong.duration) / 100;
  });

  // Add event listener for backward button
  document.querySelector("#backward").addEventListener("click", () => {
    currentsong.pause();
    playPreviousSong(songs);
  });

  // Add event listener for forward button
  document.querySelector("#forward").addEventListener("click", () => {
    currentsong.pause();
    playNextSong(songs);
  });

  const searchIcon = document.getElementById("search-icon"); // The search icon that opens the input
  const searchContainer = document.getElementById("searchContainer");
  const searchInput = document.getElementById("mobsearchinput");
  const closeSearch = document.getElementById("closeSearch");

  // Open the search input
  searchIcon.addEventListener("click", function () {
    if (window.innerWidth <= 700) {
      searchContainer.style.display = "block";
      searchInput.classList.add("show"); // Show and expand the search input
    }
  });

  // Close the search input
  closeSearch.addEventListener("click", function () {
    searchInput.classList.remove("show");
    setTimeout(() => {
      searchContainer.style.display = "none"; // Hide the container after transition ends
    }, 300); // Timeout matches the CSS transition duration (0.3s)
  });

  currentsong.addEventListener("ended", (e) => {
    playNextSong(songs);
  });
  mobilelib();

  // Volume slider function

  document
    .querySelector(".volume-control")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => (currentsong.volume = e.target.value));

  // Mute Function

  document
    .querySelector(".volume-control>img")
    .addEventListener("click", (e) => {
      if (window.innerWidth > 700) {
        if (!currentsong.muted) {
          currentsong.muted = true;
          document.querySelector(".volume-control>img").src =
            "Assets/muted.svg";
          document.querySelector(".volume-control>input").value = 0;
        } else {
          currentsong.muted = false;

          document.querySelector(".volume-control>img").src =
            "Assets/volume.svg";
          document.querySelector(".volume-control>input").value = 1;
        }
      }
    });
}

function loadMusic(track, artistname) {
  currentsong.src = `${currFolder}/${track}.mp3`;

  document.querySelector("#playersongname").innerHTML = track;
  document.querySelector("#playerartistname").innerHTML = artistname;

  // Update the duration of the track when metadata is loaded
  currentsong.addEventListener("loadedmetadata", () => {
    document.querySelector("#endtime").innerHTML = convertToMinutesSeconds(
      currentsong.duration
    );
  });
}

async function getArtists() {
  const response = await fetch(`http://127.0.0.1:5500/Songs/Artists`);
  const result = await response.text();
  const artistCard = document.querySelector(".artistCard");
  let div = document.createElement("div");
  div.innerHTML = result;
  let anchors = Array.from(div.getElementsByTagName("a"));
  for (let index = 0; index < anchors.length; index++) {
    if (anchors[index].href.includes("/Songs/Artists/")) {
      let folder = anchors[index].href.split("Songs/Artists/")[1];

      const response = await fetch(
        `http://127.0.0.1:5500/Songs/Artists/${folder}/info.json`
      );
      const result = await response.json();

      artistCard.innerHTML += `<div class="artist">
        <img src="http://127.0.0.1:5500/Songs/Artists/${folder}/cover.jpg" alt="" class="artistImg">
        <h2 class="artistName">${result.tittle}</h2>
        <h3 class="identity">Artist</h3>
        </div>`;
      Array.from(document.querySelectorAll(".artist")).forEach((e) => {
        e.addEventListener("click", async (event) => {
          let folder =
            event.currentTarget.querySelector(".artistName").innerHTML;
          await getSongs(`Songs/Artists/${folder}`);
          play.classList.remove("fa-circle-pause"); // Remove pause icon
          play.classList.add("fa-circle-play"); // Add play icon
          console.log("done");
        });
      });
    }
  }
}
async function getAlbums() {
  const response = await fetch(`http://127.0.0.1:5500/Songs/Albums`);
  const result = await response.text();
  const albumCard = document.querySelector(".albumCard");
  let div = document.createElement("div");
  div.innerHTML = result;
  let anchors = Array.from(div.getElementsByTagName("a"));
  for (let index = 0; index < anchors.length; index++) {
    console.log(anchors[index].href);
    if (anchors[index].href.includes("/Songs/Albums/")) {
      let folder = decodeURIComponent(
        anchors[index].href.split("Songs/Albums/")[1]
      );
      console.log(folder);
      const response = await fetch(
        `http://127.0.0.1:5500/Songs/albums/${folder}/info.json`
      );
      const result = await response.json();
      console.log(result);
      albumCard.innerHTML += `<div class="album">
              <img src="http://127.0.0.1:5500/Songs/Albums/${folder}/cover.jpg" alt="" class="albumImg">
              <h2 class="albumName">${result.tittle}</h2>
              <h3 class="artists">Artist</h3>
            </div>`;
    }
  }
}

getArtists();
getAlbums();

function mobilelib() {
  let visible = false;
  let library = document.querySelector(".library");
  let hamburger = document.querySelector(".hamburger");

  hamburger.addEventListener("click", () => {
    if (!visible) {
      library.style.left = `0%`;
      visible = true;
    } else {
      library.style.left = "-100%";
      visible = false;
    }
  });
}

main();
