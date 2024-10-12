const url = "http://127.0.0.1:5500/songs/";

let currentsong = new Audio();

function convertToMinutesSeconds(timeInSeconds) {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);

  // Add leading zero if minutes or seconds are less than 10
  const paddedMinutes = minutes.toString().padStart(2, "0");
  const paddedSeconds = seconds.toString().padStart(2, "0");

  return `${paddedMinutes}:${paddedSeconds}`;
}

async function getSongs() {
  try {
    const response = await fetch(url);
    const result = await response.text();
    let div = document.createElement("div");
    div.innerHTML = result;
    let data = div.getElementsByTagName("a");
    songs = [];
    for (let i = 0; i < data.length; i++) {
      const element = data[i];
      if (element.href.endsWith(".mp3")) {
        songs.push(element.href.split("songs/")[1].replaceAll(".mp3", ""));
      }
    }

    return songs;
  } catch (error) {
    console.error(error);
  }
}

function playmusic(track, artistname) {
  currentsong.src = `songs/${track}.mp3`;

  currentsong.play();

  play.classList.remove("fa-circle-play"); // Remove play icon
  play.classList.add("fa-circle-pause"); // Add pause icon

  document.querySelector("#playersongname").innerHTML = track;
  document.querySelector("#playerartistname").innerHTML = artistname;
}

function playPreviousSong(songs) {
  // Get the current song's index
  let index = songs.indexOf(
    currentsong.src.split("/").slice(-1)[0].split(".mp3")[0]
  );

  // Play the previous song, or loop to the last song if at the start
  if (index > 0) {
    let previousSong = songs[index - 1].replaceAll("%20", " ");
    let artistname = document
      .querySelector("#list")
      .getElementsByTagName("li")
      [index - 1].querySelector("#artist").innerHTML;
    playmusic(previousSong, artistname);
  } else {
    let lastSong = songs[songs.length - 1].replaceAll("%20", " ");
    let artistname = document
      .querySelector("#list")
      .getElementsByTagName("li")
      [songs.length - 1].querySelector("#artist").innerHTML;
    playmusic(lastSong, artistname); // Loop to the last song
  }
}

function playNextSong(songs) {
  // Get the current song's index
  let index = songs.indexOf(
    currentsong.src.split("/").slice(-1)[0].split(".mp3")[0]
  );

  // Play the next song, or loop to the first song if at the end
  if (index < songs.length - 1) {
    let nextSong = songs[index + 1].replaceAll("%20", " ");
    let artistname = document
      .querySelector("#list")
      .getElementsByTagName("li")
      [index + 1].querySelector("#artist").innerHTML;
    playmusic(nextSong, artistname);
  } else {
    let firstSong = songs[0].replaceAll("%20", " ");
    let artistname = document
      .querySelector("#list")
      .getElementsByTagName("li")[0]
      .querySelector("#artist").innerHTML;
    playmusic(firstSong, artistname); // Loop to the first song
  }
}

async function main() {
  let songs = await getSongs();
  let play = document.querySelector("#play");
  let library = document.querySelector(".songs").getElementsByTagName("ul")[0];
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

  mobilelib();
}

function loadMusic(track, artistname) {
  currentsong.src = `songs/${track}.mp3`;

  document.querySelector("#playersongname").innerHTML = track;
  document.querySelector("#playerartistname").innerHTML = artistname;

  // Update the duration of the track when metadata is loaded
  currentsong.addEventListener("loadedmetadata", () => {
    document.querySelector("#endtime").innerHTML = convertToMinutesSeconds(
      currentsong.duration
    );
  });

  document
    .querySelector(".volume-control")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => (currentsong.volume = e.target.value));
}

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
