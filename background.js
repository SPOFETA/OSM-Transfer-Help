let osmToken = null;
let osmIds = null;

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "OSM_TOKEN") {
    osmToken = msg.token;
    chrome.storage.local.set({ osmToken });
  }
  if (msg.type === "OSM_IDS") {
    osmIds = msg.ids;
    chrome.storage.local.set({ osmIds });
  }
});

async function getTransferPlayers() {
  if (!osmToken) {
    const data = await chrome.storage.local.get("osmToken");
    osmToken = data.osmToken;
  }

  if (!osmIds) {
    const data = await chrome.storage.local.get("osmIds");
    osmIds = data.osmIds;
  }

   if (!osmToken || !osmIds) {
    console.warn("[OSM Extension] Token ou IDs indisponíveis!");
    return { players: [], balance: 0, balanceBreakdown: {} };
  }

  const { leagueId, teamId } = osmIds;


  try {
    // Fetch players
    const response = await fetch(
      `https://web-api.onlinesoccermanager.com/api/v1/leagues/${leagueId}/teams/${teamId}/transferplayers/0`,
      { headers: { Authorization: `Bearer ${osmToken}` } }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[OSM Extension] Error searching for players:", response.status, errorText);
      return { players: [], balance: 0, error: true };
    }

    // Fetch balance/savings
    const responseBalance = await fetch(
     `https://web-api.onlinesoccermanager.com/api/v1/leagues/${leagueId}/teams/${teamId}/finances/balanceandsavings`,
      { headers: { Authorization: `Bearer ${osmToken}` } }
    );

    if (!responseBalance.ok) {
      const errorText = await responseBalance.text();
      console.error("[OSM Extension] Error searching for balance:", responseBalance.status, errorText);
      return { players: [], balance: 0, error: true };
    }

    const players = await response.json();
    const balanceData = await responseBalance.json();
    const availableBalance = (balanceData.balance || 0) + (balanceData.savings || 0);

    const processedPlayers = processPlayers(players, availableBalance);

    // Return players and balance
    return {
      players: processedPlayers,
      balance: availableBalance,
      balanceBreakdown: {
        balance: balanceData.balance || 0,
        savings: balanceData.savings || 0
      },
      error: false
    };

  } catch (error) {
    console.error("[OSM Extension] Error in request:", error);
    return { players: [], balance: 0, error: true };
  }
}

function processPlayers(players, availableBalance) {
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
    .filter(p => p.price <= availableBalance)
    .sort((a, b) => b.max_profit - a.max_profit);
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "GET_PLAYERS") {
    getTransferPlayers().then(sendResponse);
    return true;
  }
});