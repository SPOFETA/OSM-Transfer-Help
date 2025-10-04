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

async function getOsmBaseDomain() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      try {
        const url = new URL(tabs[0].url);
        const hostname = url.hostname;

        if (hostname.includes("onlinesoccermanager.nl")) {
          resolve("onlinesoccermanager.nl");
        } else if (hostname.includes("onlinesoccermanager.com")) {
          resolve("onlinesoccermanager.com");
        } else {
          resolve("onlinesoccermanager.com");
        }
      } catch (err) {
        resolve("onlinesoccermanager.com");
      }
    });
  });
}

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
    console.warn("[OSM Extension] Token or IDs unavailable!");
    return { players: [], balance: 0, balanceBreakdown: {} };
  }

  const { leagueId, teamId } = osmIds;


  try {
    const osmBaseDomain = await getOsmBaseDomain();

    const response = await fetch(
      `https://web-api.${osmBaseDomain}/api/v1/leagues/${leagueId}/teams/${teamId}/transferplayers/0`,
      { headers: { Authorization: `Bearer ${osmToken}` } }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[OSM Extension] Error searching for players:", response.status, errorText);
      return { players: [], balance: 0, error: true };
    }

    const responseBalance = await fetch(
     `https://web-api.${osmBaseDomain}/api/v1/leagues/${leagueId}/teams/${teamId}/finances/balanceandsavings`,
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
    7: "LM", 10: "RM", 12: "RB", 3: "CB", 9: "LB", 6: "GK"
  };

  return players
    .map(item => {
      const p = item.player || {};
      const value = p.value;
      const price = item.price;

      let rating;
      if (["ST", "RW", "LW"].includes(map[p.specificPosition])) {
        rating = p.statAtt;
      } else if (["CAM", "CM", "CDM", "LM"].includes(map[p.specificPosition])) {
        rating = p.statOvr;
      } else if(["RB", "CB", "LB", "GK"].includes(map[p.specificPosition])) {
        rating = p.statDef;
      } else {
        rating = p.statOvr;
      }

      return {
        full_name: p.fullName,
        position: map[p.specificPosition] || p.specificPosition,
        age: p.age,
        rating,
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