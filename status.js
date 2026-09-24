(function () {
  const HOST = 'd1.proxify.host:26188';
  const API = 'https://api.mcsrvstat.us/3/' + HOST;
  // Fixed display version for the site (not from ping)
  const DISPLAY_VERSION = '1.21.4-1.21.11';
  // Optional: plugin HTTP status (TPS). Set after opening HTTPS proxy to LifeStatus.
  const TPS_API = null; // e.g. 'https://status.yourdomain.com/status'

  function $(id) { return document.getElementById(id); }

  function setOffline(el) {
    el.online.textContent = 'OFFLINE';
    el.online.className = 'srv-val off';
    el.dot.className = 'srv-dot off';
    el.players.textContent = '—';
    el.ping.textContent = '—';
    el.tps.textContent = '—';
    el.ver.textContent = DISPLAY_VERSION;
    if (el.motd) el.motd.textContent = '';
    if (el.box) el.box.classList.add('offline');
  }

  async function fetchTps() {
    if (!TPS_API) return null;
    try {
      const r = await fetch(TPS_API + '?_=' + Date.now(), { cache: 'no-store' });
      if (!r.ok) return null;
      const j = await r.json();
      if (j && j.tps && typeof j.tps['1m'] === 'number') return j.tps['1m'];
      return null;
    } catch (_) {
      return null;
    }
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
      const [res, tpsVal] = await Promise.all([
        fetch(API + '?_=' + Date.now(), { cache: 'no-store' }),
        fetchTps(),
      ]);
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

      if (on && tpsVal != null) {
        el.tps.textContent = tpsVal.toFixed(1);
        el.tps.className = 'srv-val ' + (tpsVal >= 18 ? 'on' : tpsVal >= 15 ? '' : 'off');
        el.tps.title = 'TPS 1m from LifeStatus plugin';
      } else if (on) {
        el.tps.textContent = 'N/A';
        el.tps.className = 'srv-val';
        el.tps.title = 'Поставь LifeStatus.jar на сервер и открой HTTP для TPS';
      } else {
        el.tps.textContent = '—';
        el.tps.className = 'srv-val';
        el.tps.title = '';
      }

      // Always show fixed range on the site
      el.ver.textContent = DISPLAY_VERSION;

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
