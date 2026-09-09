(function () {
  var frame = document.getElementById("frame");
  if (!frame) return;

  var layers = Array.prototype.slice.call(frame.querySelectorAll(".layer"));
  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  if (prefersReducedMotion.matches) return;

  var rafId = null;
  var targetX = 0;
  var targetY = 0;

  function applyParallax() {
    rafId = null;
    layers.forEach(function (layer) {
      var depth = parseFloat(layer.dataset.depth) || 0;
      var moveX = targetX * depth * 26;
      var moveY = targetY * depth * 26;
      layer.style.setProperty("--px", moveX + "px");
      layer.style.setProperty("--py", moveY + "px");
    });
  }

  function onPointerMove(event) {
    var rect = frame.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    targetX = (event.clientX - cx) / (rect.width / 2);
    targetY = (event.clientY - cy) / (rect.height / 2);
    targetX = Math.max(-1, Math.min(1, targetX));
    targetY = Math.max(-1, Math.min(1, targetY));
    if (!rafId) rafId = requestAnimationFrame(applyParallax);
  }

  function onPointerLeave() {
    targetX = 0;
    targetY = 0;
    if (!rafId) rafId = requestAnimationFrame(applyParallax);
  }

  var hero = document.querySelector(".hero");
  hero.addEventListener("mousemove", onPointerMove);
  hero.addEventListener("mouseleave", onPointerLeave);
})();
