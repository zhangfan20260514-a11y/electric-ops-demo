(function () {
  var queued = false;

  function enhancePreviewCards() {
    queued = false;

    document
      .querySelectorAll('.ep-preview-drawer .ep-mind-node > header > img')
      .forEach(function (image) {
        var icon = document.createElement('span');
        icon.className = 'ep-mind-icon';
        image.parentNode.insertBefore(icon, image);
        icon.appendChild(image);
      });

    document
      .querySelectorAll('.ep-preview-drawer .ep-mind-node > header > b')
      .forEach(function (title) {
        var fullTitle = title.textContent.trim();
        if (!fullTitle) return;
        title.title = fullTitle;
        title.setAttribute('aria-label', fullTitle);
      });
  }

  function scheduleEnhancement() {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(enhancePreviewCards);
  }

  new MutationObserver(scheduleEnhancement).observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhancePreviewCards, { once: true });
  } else {
    enhancePreviewCards();
  }
})();
