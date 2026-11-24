(function(){
  const T=window.TBH;
  const paths={
    coin:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="5.5"/><path d="M10 8v8m4-8v8m-4-4h4"/>',
    gem:'<path d="m3 8 4-5h10l4 5-9 13Z M3 8h18M7 3l5 18 5-18"/>',
    sword:'<path d="m5 19 3-3m-4-2 6 6m-3-5L18 4l3-1-1 3L9 17"/>',
    squad:'<path d="M3 20v-3a4 4 0 0 1 4-4h2m12 7v-3a4 4 0 0 0-4-4h-2M7 21v-4a5 5 0 0 1 10 0v4"/><circle cx="12" cy="7" r="3"/><path d="M5 4a3 3 0 0 0 0 6M19 4a3 3 0 0 1 0 6"/>',
    bag:'<path d="M6 9h12l2 11H4Zm3 0V6a3 3 0 0 1 6 0v3M4 14h16M10 13v3h4v-3"/>',
    camp:'<path d="M2 20 12 3l10 17H2Zm6 0 4-8 4 8M10 3l4 0"/>',
    chest:'<path d="M3 10a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v10H3Zm0 2h18M7 5v15m10-15v15M10 11v4h4v-4"/>',
    heart:'<path d="M12 21 3 12C-2 4 8 0 12 7 16 0 26 4 21 12Z"/>',
    scroll:'<path d="M6 3h13v14H8V6a3 3 0 0 0-6 0v2h6M8 17v2a3 3 0 0 0 6 0v-2M11 7h5m-5 4h5"/>',
    sound:'<path d="M3 9h4l5-4v14l-5-4H3Zm13-2a7 7 0 0 1 0 10m3-13a11 11 0 0 1 0 16"/>',
    muted:'<path d="M3 9h4l5-4v14l-5-4H3Zm13 0 5 6m0-6-5 6"/>',
    pause:'<path d="M8 5v14m8-14v14" stroke-width="3"/>',
    play:'<path d="m7 4 13 8-13 8Z"/>',
    star:'<path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z"/>'
  };
  T.uiIcon=name=>`<svg class="gameIcon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths[name]||paths.star}</svg>`;
  document.querySelectorAll('[data-ui-icon]').forEach(el=>{el.innerHTML=T.uiIcon(el.dataset.uiIcon)});
})();
