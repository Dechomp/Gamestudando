let googleServices = null;

try {
  googleServices = require("../google-services.json");
} catch (_error) {
  googleServices = null;
}

export function obterGoogleWebClientId() {
  const oauthClients = googleServices?.client?.[0]?.oauth_client || [];
  const webClient = oauthClients.find(client => client.client_type === 3);

  return webClient?.client_id || null;
}
