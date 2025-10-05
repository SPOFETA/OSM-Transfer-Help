(function() {
  const cookies = document.cookie.split(";");
  const tokenCookie = cookies.find(c => c.trim().startsWith("access_token="));

  if (tokenCookie) {
    const token = tokenCookie.split("=")[1];
    chrome.runtime.sendMessage({ type: "OSM_TOKEN", token });
  } else {
    console.warn("[OSM Extension] No cookie found!");
    }

  function getLeagueAndTeamId() {
    const cookies = document.cookie.split("; ");
    const sessionCookie = cookies.find(c => c.startsWith("session="));
    if (!sessionCookie) return null;

    try {
      const decoded = decodeURIComponent(sessionCookie.split("=")[1]);
      const data = JSON.parse(decoded);
      return { leagueId: data.leagueId, teamId: data.teamId };
    } catch (e) {
      return null;
    }
  }

  function getLeagueAndTeam_LocalStorage() {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const match = key.match(/^TeamTactic_(\d+)_(\d+)$/);
    if (match) {
      return { leagueId: match[1], teamId: match[2] };
    }
  }
    return null;
  }

  const ids = getLeagueAndTeamId() || getLeagueAndTeam_LocalStorage();
  if (ids) {
    chrome.runtime.sendMessage({ type: "OSM_IDS", ids });
  }
})();