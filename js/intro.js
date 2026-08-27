(function () {
  var intro = document.getElementById("intro");
  if (!intro) return;

  function endIntro() {
    if (!intro || intro.classList.contains("done")) return;
    intro.classList.add("open");
    setTimeout(function () {
      intro.classList.add("done");
      setTimeout(function () {
        if (intro && intro.parentNode) intro.parentNode.removeChild(intro);
      }, 700);
    }, 1100);
  }

  setTimeout(function () { intro.classList.add("show-dragon"); }, 80);
  setTimeout(function () { intro.classList.add("breathe"); }, 400);
  setTimeout(endIntro, 5200);

  var skip = document.getElementById("introSkip");
  if (skip) skip.addEventListener("click", endIntro);
  intro.addEventListener("click", function (e) {
    if (e.target.id === "introSkip") return;
    if (intro.classList.contains("breathe")) endIntro();
  });
})();
