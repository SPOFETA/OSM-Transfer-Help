chrome.runtime.sendMessage({ type: "GET_PLAYERS" }, (response) => {
  const container = document.getElementById("players");
  container.innerHTML = "";

  if (!response || response.error) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "no-players";

    const icon = document.createElement("div");
    icon.className = "no-players-icon";
    icon.textContent = "⚠️";

    const msg = document.createElement("p");
    msg.innerHTML = "<strong>Error:</strong> Unable to load data.";

    const hint = document.createElement("div");
    hint.style.marginTop = "10px";
    hint.style.fontSize = "11px";
    hint.style.opacity = "0.7";
    hint.textContent = "Make sure you are logged in OSM.";

    errorDiv.appendChild(icon);
    errorDiv.appendChild(msg);
    errorDiv.appendChild(hint);

    container.appendChild(errorDiv);
    return;
  }

  const players = response.players || [];
  const balance = response.balance || 0;
  const balanceBreakdown = response.balanceBreakdown || {};

  // Format numbers with proper currency
  const formatMoney = (value) => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + "M";
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + "K";
    }
    return value.toFixed(2);
  };

  // Balance Section (SAFE)
  const balanceSection = document.createElement("div");
  balanceSection.className = "balance-section";

  const balanceHeader = document.createElement("div");
  balanceHeader.className = "balance-header";

  const balanceTitle = document.createElement("div");
  balanceTitle.className = "balance-title";
  balanceTitle.textContent = "Available Balance";

  const balanceAmount = document.createElement("div");
  balanceAmount.className = "balance-amount";
  balanceAmount.textContent = `€${formatMoney(balance)}`;

  balanceHeader.appendChild(balanceTitle);
  balanceHeader.appendChild(balanceAmount);
  balanceSection.appendChild(balanceHeader);

  const breakdown = document.createElement("div");
  breakdown.className = "balance-breakdown";

  const balanceItem = document.createElement("div");
  balanceItem.className = "balance-item";
  const balanceLabel = document.createElement("div");
  balanceLabel.className = "balance-item-label";
  balanceLabel.textContent = "Balance";
  const balanceValue = document.createElement("div");
  balanceValue.className = "balance-item-value";
  balanceValue.textContent = `€${formatMoney(balanceBreakdown.balance || 0)}`;
  balanceItem.appendChild(balanceLabel);
  balanceItem.appendChild(balanceValue);

  const savingsItem = document.createElement("div");
  savingsItem.className = "balance-item";
  const savingsLabel = document.createElement("div");
  savingsLabel.className = "balance-item-label";
  savingsLabel.textContent = "Savings";
  const savingsValue = document.createElement("div");
  savingsValue.className = "balance-item-value";
  savingsValue.textContent = `€${formatMoney(balanceBreakdown.savings || 0)}`;
  savingsItem.appendChild(savingsLabel);
  savingsItem.appendChild(savingsValue);

  breakdown.appendChild(balanceItem);
  breakdown.appendChild(savingsItem);
  balanceSection.appendChild(breakdown);

  container.appendChild(balanceSection);

  // No players
  if (players.length === 0) {
    const noPlayersDiv = document.createElement("div");
    noPlayersDiv.className = "no-players";

    const icon = document.createElement("div");
    icon.className = "no-players-icon";
    icon.textContent = "😔";

    const msg = document.createElement("p");
    msg.textContent = "No profitable player found within your budget.";

    const hint = document.createElement("div");
    hint.style.marginTop = "10px";
    hint.style.fontSize = "11px";
    hint.style.opacity = "0.7";
    hint.textContent = "Try again later once you have increased your balance.";

    noPlayersDiv.appendChild(icon);
    noPlayersDiv.appendChild(msg);
    noPlayersDiv.appendChild(hint);

    container.appendChild(noPlayersDiv);
    return;
  }

  // Players title
  const playersTitle = document.createElement("div");
  playersTitle.className = "players-title";

  const playersHeader = document.createElement("div");
  playersHeader.style.display = "flex";
  playersHeader.style.justifyContent = "space-between";
  playersHeader.style.alignItems = "center";
  playersHeader.style.margin = "15px 0 10px 0";
  playersHeader.style.paddingBottom = "8px";
  playersHeader.style.borderBottom = "1px solid rgba(255,255,255,0.2)";

  const playersHeaderText = document.createElement("span");
  playersHeaderText.style.fontSize = "14px";
  playersHeaderText.style.fontWeight = "600";
  playersHeaderText.textContent = "⚽ Available players";

  playersHeader.appendChild(playersHeaderText);
  playersTitle.appendChild(playersHeader);
  container.appendChild(playersTitle);

  // List players (SAFE)
  players.forEach((p, index) => {
    const playerCard = document.createElement("div");
    playerCard.className = "player-card";
    playerCard.style.animationDelay = `${index * 0.1}s`;

    // Header
    const header = document.createElement("div");
    header.className = "player-header";

    const name = document.createElement("div");
    name.className = "player-name";
    name.textContent = p.full_name || "Unknown";

    const posBadge = document.createElement("div");
    posBadge.className = "position-badge";
    posBadge.textContent = p.position || "-";

    header.appendChild(name);
    header.appendChild(posBadge);
    playerCard.appendChild(header);

    // Stats
    const stats = document.createElement("div");
    stats.className = "player-stats";

    const statValue = document.createElement("div");
    statValue.className = "stat";
    const statLabelValue = document.createElement("div");
    statLabelValue.className = "stat-label";
    statLabelValue.textContent = "Value";
    const statValueValue = document.createElement("div");
    statValueValue.className = "stat-value";
    statValueValue.textContent = `€${formatMoney(p.value)}`;
    statValue.appendChild(statLabelValue);
    statValue.appendChild(statValueValue);

    const statPrice = document.createElement("div");
    statPrice.className = "stat";
    const statLabelPrice = document.createElement("div");
    statLabelPrice.className = "stat-label";
    statLabelPrice.textContent = "Price";
    const statValuePrice = document.createElement("div");
    statValuePrice.className = "stat-value";
    statValuePrice.textContent = `€${formatMoney(p.price)}`;
    statPrice.appendChild(statLabelPrice);
    statPrice.appendChild(statValuePrice);

    stats.appendChild(statValue);
    stats.appendChild(statPrice);
    playerCard.appendChild(stats);

    // Profit section
    const profitSection = document.createElement("div");
    profitSection.className = "profit-section";

    const profitLabel = document.createElement("div");
    profitLabel.className = "profit-label";
    profitLabel.textContent = "Max Profit";

    const profitValue = document.createElement("div");
    profitValue.className = "profit-value";

    const profitIcon = document.createElement("div");
    profitIcon.className = "profit-icon";
    profitIcon.textContent = "💰";

    const profitText = document.createElement("span");
    profitText.textContent = `€${formatMoney(p.max_profit)}`;

    profitValue.appendChild(profitIcon);
    profitValue.appendChild(profitText);
    profitSection.appendChild(profitLabel);
    profitSection.appendChild(profitValue);

    playerCard.appendChild(profitSection);

    // Affordability warning
    if (p.price > balance) {
      const warn = document.createElement("div");
      warn.className = "affordability-warning";
      warn.textContent = "⚠️ Over budget";
      playerCard.appendChild(warn);
    }

    container.appendChild(playerCard);
  });
});
