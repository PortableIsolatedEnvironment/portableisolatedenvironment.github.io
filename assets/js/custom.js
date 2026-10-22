function togglePresentationIcons() {
  const wrapper = document.getElementById("presentation-icons-wrapper");
  if (wrapper.style.maxHeight && wrapper.style.maxHeight !== "0px") {
    wrapper.style.maxHeight = "0";
    document.getElementById("presentations-icon").classList.remove("bi-folder2-open");
    document.getElementById("presentations-icon").classList.add("bi-folder2");
  } else {
    wrapper.style.maxHeight = wrapper.scrollHeight + "px";
    document.getElementById("presentations-icon").classList.remove("bi-folder2");
    document.getElementById("presentations-icon").classList.add("bi-folder2-open");
  }
}


document.querySelectorAll(".memoriam[data-audio]").forEach((el) => {
  const FADE_MS = 400;
  const audio = new Audio(el.dataset.audio);
  audio.preload = "auto";
  audio.loop = true;
  let frame = null;
  let hovering = false;

  function fadeTo(target, onDone) {
    cancelAnimationFrame(frame);
    const start = audio.volume;
    const startTime = performance.now();
    const step = (now) => {
      const t = Math.min(Math.max((now - startTime) / FADE_MS, 0), 1);
      audio.volume = Math.min(Math.max(start + (target - start) * t, 0), 1);
      if (t < 1) frame = requestAnimationFrame(step);
      else if (onDone) onDone();
    };
    frame = requestAnimationFrame(step);
  }

  function start() {
    if (audio.paused) audio.volume = 0;
    audio
      .play()
      .then(() => el.classList.remove("audio-blocked"))
      .catch((err) => {
        // Browsers block sound until the visitor has interacted with the page
        if (err.name === "NotAllowedError") el.classList.add("audio-blocked");
        else console.warn("memoriam audio failed:", err.name, err.message);
      });
    fadeTo(1);
  }

  // Unlock playback on the first interaction anywhere on the page
  function unlock() {
    document.removeEventListener("pointerdown", unlock);
    document.removeEventListener("keydown", unlock);
    if (hovering) return start();
    audio.muted = true;
    audio
      .play()
      .then(() => {
        if (!hovering) {
          audio.pause();
          audio.currentTime = 0;
        }
      })
      .catch(() => {})
      .finally(() => (audio.muted = false));
  }
  document.addEventListener("pointerdown", unlock);
  document.addEventListener("keydown", unlock);

  el.addEventListener("mouseenter", () => {
    hovering = true;
    start();
  });

  el.addEventListener("click", () => {
    if (audio.paused) start();
  });

  el.addEventListener("mouseleave", () => {
    hovering = false;
    fadeTo(0, () => audio.pause());
  });
});
