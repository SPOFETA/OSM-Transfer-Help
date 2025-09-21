let osmToken = null;

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "OSM_TOKEN") {
    osmToken = msg.token;
    console.log("[OSM Extension] Token recebido do content.js:", osmToken.substring(0, 20) + "...");
    chrome.storage.local.set({ osmToken });
  }
});

async function getTransferPlayers() {
  if (!osmToken) {
    const data = await chrome.storage.local.get("osmToken");
    osmToken = data.osmToken;
    if (osmToken) {
      console.log("[OSM Extension] Token recuperado do storage:", osmToken.substring(0, 20) + "...");
    } else {
      console.warn("[OSM Extension] Nenhum token disponível!");
      return [];
    }
  }

  console.log("[OSM Extension] A chamar API com token:", osmToken.substring(0, 20) + "...");

  const response = await fetch(
    "https://web-api.onlinesoccermanager.com/api/v1/leagues/126217657/teams/9/transferplayers/0",
    { headers: { Authorization: `Bearer ${osmToken}` } }
  );

  console.log("[OSM Extension] Status da resposta:", response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[OSM Extension] Erro ao buscar jogadores:", response.status, errorText);
    return [];
  }

  const players = await response.json();
  console.log("[OSM Extension] Resposta JSON da API:", players);

  return processPlayers(players);
}

function processPlayers(players) {
  const map = {
    4: "ST", 11: "RW", 8: "LW", 1: "CAM", 2: "CM", 5: "CDM",
    7: "LM", 12: "RB", 3: "CB", 9: "LB", 6: "GK"
  };

  return players
    .map(item => {
      const p = item.player || {};
      const value = p.value;
      const price = item.price;
      return {
        full_name: p.fullName,
        position: map[p.specificPosition] || p.specificPosition,
        value,
        price,
        max_profit: (value * 2.5) - price
      };
    })
    .filter(p => p.price <= 1.5 * p.value)
    .sort((a, b) => b.max_profit - a.max_profit);
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "GET_PLAYERS") {
    getTransferPlayers().then(sendResponse);
    return true;
  }
});