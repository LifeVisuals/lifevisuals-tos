(function () {
  // Real status via mcsrvstat.us (Server List Ping).
  // TPS is NOT in the Minecraft protocol — needs Spark/TabTPS/plugin on the server.
  const HOST = 'd1.proxify.host:26188';
  const API = 'https://api.mcsrvstat.us/3/' + HOST;

  function $(id) { return document.getElementById(id); }

  function setOffline(el) {
    el.online.textContent = 'OFFLINE';
    el.online.className = 'srv-val off';
    el.dot.className = 'srv-dot off';
    el.players.textContent = '—';
    el.ping.textContent = '—';
    el.tps.textContent = '—';
    el.ver.textContent = '—';
    if (el.motd) el.motd.textContent = '';
    if (el.box) el.box.classList.add('offline');
  }

  async function refresh() {
    const el = {
      online: $('srv-online'),
      players: $('srv-players'),
      ping: $('srv-ping'),
      tps: $('srv-tps'),
      ver: $('srv-ver'),
      motd: $('srv-motd'),
      dot: $('srv-dot'),
      box: $('server-status'),
    };
    if (!el.online) return;

    const t0 = performance.now();
    try {
      const res = await fetch(API + '?_=' + Date.now(), { cache: 'no-store' });
      const ms = Math.round(performance.now() - t0);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const on = !!data.online;

      el.online.textContent = on ? 'ONLINE' : 'OFFLINE';
      el.online.className = 'srv-val ' + (on ? 'on' : 'off');
      el.dot.className = 'srv-dot ' + (on ? 'on' : 'off');

      if (on && data.players) {
        el.players.textContent =
          (data.players.online ?? 0) + ' / ' + (data.players.max ?? '?');
      } else {
        el.players.textContent = '—';
      }

      el.ping.textContent = on ? ms + ' ms' : '—';

      // Real TPS cannot be read from outside without a server plugin.
      el.tps.textContent = on ? 'N/A' : '—';
      el.tps.title = on
        ? 'TPS only via Spark / TabTPS / plugin on the server'
        : '';

      el.ver.textContent = (data.version && String(data.version)) || '—';

      if (el.motd) {
        const clean =
          (data.motd && (data.motd.clean || data.motd.raw)) || null;
        const text = Array.isArray(clean) ? clean.join(' ') : clean;
        el.motd.textContent = text ? String(text).trim() : '';
      }

      if (el.box) el.box.classList.toggle('offline', !on);
    } catch (e) {
      setOffline(el);
    }
  }

  refresh();
  setInterval(refresh, 20000);
})();
