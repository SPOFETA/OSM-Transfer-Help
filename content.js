(function() {
  const cookies = document.cookie.split(";");
  const tokenCookie = cookies.find(c => c.trim().startsWith("access_token="));

  if (tokenCookie) {
    const token = tokenCookie.split("=")[1];
    console.log("[OSM Extension] Token encontrado no cookie:", token.substring(0, 20) + "...");
    chrome.runtime.sendMessage({ type: "OSM_TOKEN", token });
  } else {
    console.warn("[OSM Extension] Nenhum cookie access_token encontrado!");
    }
})();
