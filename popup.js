chrome.runtime.sendMessage({ type: "GET_PLAYERS" }, (response) => {
  const container = document.getElementById("players");
  container.innerHTML = "";

  // Verificar se houve erro
  if (!response || response.error) {
    container.innerHTML = `
      <div class="no-players">
        <div class="no-players-icon">⚠️</div>
        <p><strong>Erro:</strong> Unable to load data.</p>
        <div style="margin-top: 10px; font-size: 11px; opacity: 0.7;">
          Make sure you are logged in OSM.
        </div>
      </div>
    `;
    return;
  }

  const players = response.players || [];
  const balance = response.balance || 0;
  const balanceBreakdown = response.balanceBreakdown || {};

  // Format numbers with proper currency
  const formatMoney = (value) => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toFixed(2);
  };

  //  Balance Section
  const balanceSection = document.createElement("div");
  balanceSection.className = "balance-section";
  balanceSection.innerHTML = `
  <div class="balance-header">
    <div class="balance-title">Available Balance</div>
    <div class="balance-amount">
      €${formatMoney(balance)}
    </div>
  </div>
  <div class="balance-breakdown">
    <div class="balance-item">
      <div class="balance-item-label">Balance</div>
      <div class="balance-item-value">€${formatMoney(balanceBreakdown.balance || 0)}</div>
    </div>
    <div class="balance-item">
      <div class="balance-item-label">Savings</div>
      <div class="balance-item-value">€${formatMoney(balanceBreakdown.savings || 0)}</div>
    </div>
  </div>
  `;
  container.appendChild(balanceSection);

  // Check if there are no players
  if (players.length === 0) {
    const noPlayersDiv = document.createElement("div");
    noPlayersDiv.className = "no-players";
    noPlayersDiv.innerHTML = `
      <div class="no-players-icon">😔</div>
      <p>No profitable player found within your budget.</p>
      <div style="margin-top: 10px; font-size: 11px; opacity: 0.7;">
        Try again later once you have increased your balance.
      </div>
    `;
    container.appendChild(noPlayersDiv);
    return;
  }

  // Add title for players section
  const playersTitle = document.createElement("div");
  playersTitle.className = "players-title";
  playersTitle.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin: 15px 0 10px 0; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.2);">
      <span style="font-size: 14px; font-weight: 600;">⚽ Available players</span>
    </div>
  `;
  container.appendChild(playersTitle);

  // List players
  players.forEach((p, index) => {
    const playerCard = document.createElement("div");
    playerCard.className = "player-card";
    playerCard.style.animationDelay = `${index * 0.1}s`;
    
    // Determine affordability
    const canAfford = p.price <= balance;
    const affordabilityClass = canAfford ? "affordable" : "too-expensive";
    
    playerCard.innerHTML = `
      <div class="player-header">
        <div class="player-name">${p.full_name}</div>
        <div class="position-badge ${affordabilityClass}">${p.position}</div>
      </div>
      <div class="player-stats">
        <div class="stat">
          <div class="stat-label">Value</div>
          <div class="stat-value">€${formatMoney(p.value)}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Price</div>
          <div class="stat-value">€${formatMoney(p.price)}</div>
        </div>
      </div>
      <div class="profit-section">
        <div class="profit-label">Max Profit</div>
        <div class="profit-value">
          <div class="profit-icon">💰</div>
          €${formatMoney(p.max_profit)}
        </div>
      </div>
      ${!canAfford ? '<div class="affordability-warning">⚠️ Over budget</div>' : ''}
    `;
    
    container.appendChild(playerCard);
  });
});