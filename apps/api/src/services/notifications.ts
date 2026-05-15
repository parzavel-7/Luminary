/**
 * Service to handle outgoing notifications to third-party platforms
 */
export async function sendSlackNotification(webhookUrl: string, payload: {
  title: string;
  message: string;
  score?: number;
  url?: string;
  status: 'success' | 'warning' | 'error';
}) {
  const color = payload.status === 'success' ? '#2ebac5' : payload.status === 'warning' ? '#f59e0b' : '#ef4444';
  
  const slackBody = {
    attachments: [
      {
        fallback: `${payload.title}: ${payload.message}`,
        color: color,
        title: payload.title,
        title_link: payload.url,
        text: payload.message,
        fields: [
          {
            title: "Compliance Score",
            value: payload.score ? `${payload.score}%` : "N/A",
            short: true
          },
          {
            title: "Status",
            value: payload.status.toUpperCase(),
            short: true
          }
        ],
        footer: "Luminary Compliance Hub",
        ts: Math.floor(Date.now() / 1000)
      }
    ]
  };

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackBody)
    });
    return res.ok;
  } catch (error) {
    console.error("Slack notification error:", error);
    return false;
  }
}

export async function sendDiscordNotification(webhookUrl: string, payload: {
  title: string;
  message: string;
  score?: number;
  url?: string;
  status: 'success' | 'warning' | 'error';
}) {
  const color = payload.status === 'success' ? 0x2ebac5 : payload.status === 'warning' ? 0xf59e0b : 0xef4444;

  const discordBody = {
    embeds: [
      {
        title: payload.title,
        url: payload.url,
        description: payload.message,
        color: color,
        fields: [
          {
            name: "Compliance Score",
            value: payload.score ? `${payload.score}%` : "N/A",
            inline: true
          },
          {
            name: "Status",
            value: payload.status.toUpperCase(),
            inline: true
          }
        ],
        footer: {
          text: "Luminary Compliance Hub"
        },
        timestamp: new Date().toISOString()
      }
    ]
  };

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordBody)
    });
    return res.ok;
  } catch (error) {
    console.error("Discord notification error:", error);
    return false;
  }
}
