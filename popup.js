chrome.runtime.sendMessage({ type: "GET_PLAYERS" }, (response) => {
  const content = document.getElementById("content");
  content.innerHTML = "";

  const formatMoney = (value) => {
    if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1) + "B";
    if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + "M";
    if (value >= 1_000) return (value / 1_000).toFixed(1) + "K";
    return value.toFixed(2);
  };

  if (!response || response.error) {
    content.innerHTML = `
      <div class="no-players">
        <div class="no-players-icon">⚠️</div>
        <p><strong>Error:</strong> Unable to load data.</p>
        <div style="margin-top:10px;font-size:11px;opacity:0.7;">
          Make sure you are logged in OSM.
        </div>
      </div>`;
    return;
  }

  const { players = [], balance = 0, balanceBreakdown = {} } = response;

  // Saldo
  const balanceCard = document.createElement("div");
  balanceCard.className = "balance-card";
  balanceCard.innerHTML = `
    <div class="balance-header">
      <span class="balance-title">Available Balance</span>
      <span class="balance-total">€${formatMoney(balance)}</span>
    </div>
    <div class="balance-details">
      <div class="balance-item">
        <span class="balance-label">Balance</span>
        <span class="balance-value">€${formatMoney(balanceBreakdown.balance || 0)}</span>
      </div>
      <div class="balance-item" style="text-align:right;">
        <span class="balance-label">Savings</span>
        <span class="balance-value">€${formatMoney(balanceBreakdown.savings || 0)}</span>
      </div>
    </div>`;
  content.appendChild(balanceCard);

  // Título
  const sectionTitle = document.createElement("div");
  sectionTitle.className = "section-title";
  sectionTitle.textContent = "Available players";
  content.appendChild(sectionTitle);

  if (players.length === 0) {
    content.innerHTML += `
      <div class="no-players">
        <div class="no-players-icon">😔</div>
        <p>No profitable players found within your budget.</p>
        <div style="margin-top:10px;font-size:11px;opacity:0.7;">
          Try again later.
        </div>
      </div>`;
    return;
  }

  // Lista de jogadores
  const playerList = document.createElement("div");
  playerList.className = "player-list";

  players.forEach((p) => {
  const ratio = p.value > 0 ? (p.price / p.value).toFixed(2) : 0;

    const card = document.createElement("div");
    card.className = "player-card";
    card.innerHTML = `
      <div class="card-top">
        <div class="player-info">
          <div class="player-name">${p.full_name || "Unknown"}</div>
          <div class="player-meta">
            ${p.age ? p.age + " years" : ""} 
            • <span class="ratio">${ratio}x</span>
          </div>
        </div>
        <div class="badges">
          <div class="rating">${p.rating || "?"}</div>
          <div class="position">${p.position || "-"}</div>
        </div>
      </div>
      <div class="card-bottom">
        <div class="stat">
          <div class="stat-label">Value</div>
          <div class="stat-value">€${formatMoney(p.value)}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Price</div>
          <div class="stat-value">€${formatMoney(p.price)}</div>
        </div>
        <div class="stat profit">
          <div class="stat-label">Max Profit</div>
          <div class="stat-value">
            <svg class="profit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
            </svg>
            €${formatMoney(p.max_profit)}
          </div>
        </div>
      </div>`;
    playerList.appendChild(card);
  });


  content.appendChild(playerList);
});
