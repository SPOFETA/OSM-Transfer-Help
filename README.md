# ⚽ OSM Transfer Helper – Browser Extension

A **browser extension** that connects to OSM and shows a list of the most “profitable” players on the transfer market.  

---

## 📸 Screenshot

**Main popup view**
(assets/scrnshot1.png)

---
## ✨ Features

- Fetches the transfer list and shows:
  - **Name**
  - **Age**
  - **Rating**
  - **Position**
  - **Market Value**
  - **Price**
  - **Maximum Possible Profit**
- Calculates and sorts players by **potential profit (descending)**.
- Filters out players where the **price/market value ratio > 1.5**.
- Automatically hides players you can’t afford, so you only see those that fit within your **current balance**.
- Displays your **total balance** (account + savings) in a styled section at the top of the popup.

> ⚠️ This is still an early-stage project but already working in my browser.  
> I thought it’d be fun to share and get some feedback from the community.  

---

## 🛠️ Installation (Developer Mode)

Since this extension isn’t published on the Chrome Web Store yet, you need to install it manually:

1. **Download or clone this repository.**
   ```bash
   git clone https://github.com/your-username/osm-transfer-helper.git
   
Or download as a .zip by clicking the "code" green button and extract it.

2. **Open Google Chrome (or any Chromium-based browser like Edge or Brave).**

3. **Go to the extensions page:**
  chrome://extensions/

3. **In the top-right corner, enable Developer Mode.**

4. **Click Load unpacked and select the folder where the extension files are located.**

The extension should now appear in your browser toolbar. Pin it for quick access!

[▶️ Watch tutorial on YouTube](https://www.youtube.com/watch?v=1oR9x9n-Ycg)

## 💻 Usage

1. **Open OSM in your browser and log into your account.**

2. **Click on the OSM Transfer Helper extension icon.**
  
  - The popup will display:
  
    - Your current balance (account + savings).
  
    - A list of the most profitable transfer targets, sorted by potential profit.
  
    - Only affordable players will be shown, based on your available balance.

## 💡 Contributing

Suggestions and feedback are more than welcome! Feel free to open issues or share your thoughts on what could make this extension more useful.

   
