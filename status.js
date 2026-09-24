(function () {
  const HOST = 'd1.proxify.host:26188';
  const API = 'https://api.mcsrvstat.us/3/' + HOST;
  function $(id) { return document.getElementById(id); }
  async function refresh() {
    const el = {
      online: $('srv-online'),
      players: $('srv-players'),
      ping: $('srv-ping'),
      ver: $('srv-ver'),
      dot: $('srv-dot'),
      box: $('server-status'),
    };
    if (!el.online) return;
    const t0 = performance.now();
    try {
      const res = await fetch(API + '?_=' + Date.now(), { cache: 'no-store' });
      const ms = Math.round(performance.now() - t0);
      const data = await res.json();
      const on = !!data.online;
      el.online.textContent = on ? 'ONLINE' : 'OFFLINE';
      el.online.className = 'srv-val ' + (on ? 'on' : 'off');
      el.dot.className = 'srv-dot ' + (on ? 'on' : 'off');
      el.players.textContent = on && data.players
        ? ((data.players.online ?? 0) + ' / ' + (data.players.max ?? '?'))
        : '—';
      el.ping.textContent = on ? (ms + ' ms') : '—';
      el.ver.textContent = (data.version && String(data.version)) || '—';
      if (el.box) el.box.classList.toggle('offline', !on);
    } catch (e) {
      el.online.textContent = 'OFFLINE';
      el.online.className = 'srv-val off';
      el.dot.className = 'srv-dot off';
      el.players.textContent = '—';
      el.ping.textContent = '—';
      el.ver.textContent = '—';
    }
  }
  refresh();
  setInterval(refresh, 30000);
})();
