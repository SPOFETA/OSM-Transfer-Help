chrome.runtime.sendMessage({ type: "GET_PLAYERS" }, (players) => {
  const container = document.getElementById("players");
  container.innerHTML = "";

  if (!players || players.length === 0) {
    container.innerHTML = `
      <div class="no-players">
        <div class="no-players-icon">😔</div>
        <p>Nenhum jogador encontrado ou erro ao carregar dados.</p>
      </div>
    `;
    return;
  }

  // Format numbers with proper currency
  const formatMoney = (value) => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toString();
  };

  players.forEach((p, index) => {
    const playerCard = document.createElement("div");
    playerCard.className = "player-card";
    playerCard.style.animationDelay = `${index * 0.1}s`;
    
    playerCard.innerHTML = `
      <div class="player-header">
        <div class="player-name">${p.full_name}</div>
        <div class="position-badge">${p.position}</div>
      </div>
      <div class="player-stats">
        <div class="stat">
          <div class="stat-label">Valor</div>
          <div class="stat-value">€${formatMoney(p.value)}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Preço</div>
          <div class="stat-value">€${formatMoney(p.price)}</div>
        </div>
      </div>
      <div class="profit-section">
        <div class="profit-label">Lucro Máximo</div>
        <div class="profit-value">
          <div class="profit-icon">💰</div>
          €${formatMoney(p.max_profit)}
        </div>
      </div>
    `;
    
    container.appendChild(playerCard);
  });
});