const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

const SITE = "https://converstation.ai";
const DEFAULT_IMAGE = `${SITE}/og-default.png`;

const BOT = /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|Slackbot|WhatsApp|TelegramBot|Discordbot|Pinterest|redditbot|Applebot|SkypeUriPreview|bingbot|Googlebot|embedly|vkShare|Google-InspectionTool|Iframely|Mastodon|Bluesky/i;

const esc = (s = "") =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const stripHtml = (s = "") =>
  String(s).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

exports.postpreview = onRequest({ region: "us-central1" }, async (req, res) => {
  const id = (req.path || "").split("/").filter(Boolean).pop();
  const target = `${SITE}/post.html?id=${encodeURIComponent(id || "")}`;
  const ua = req.get("user-agent") || "";

  // Log what's actually hitting us, then serve meta tags to everyone.
  // Humans get bounced client-side, crawlers read the tags.
  console.log("UA:", ua);

  let title = "Converstation AI Blog";
  let desc = "Updates, product news, and research from Converstation AI.";
  let image = DEFAULT_IMAGE;

  try {
    const snap = await db.collection("posts").doc(id).get();
    if (snap.exists) {
      const p = snap.data();
      title = p.title || title;
      desc = (p.excerpt || stripHtml(p.content) || desc).slice(0, 200);
      if (p.coverImage) image = p.coverImage;
    }
  } catch (e) {
    console.error("Firestore read failed:", e);
  }

  res.set("Cache-Control", "public, max-age=300, s-maxage=600");
  const fs = require("fs");
  const path = require("path");

  let html;
  try {
    html = fs.readFileSync(path.join(__dirname, "post-template.html"), "utf8");
  } catch (e) {
    console.error("Template read failed:", e);
    return res.redirect(302, target);
  }

  const tags = `
<title>${esc(title)} | Converstation AI</title>
<meta name="description" content="${esc(desc)}" />
<link rel="canonical" href="${SITE}/p/${esc(id)}" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="Converstation AI" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(desc)}" />
<meta property="og:image" content="${esc(image)}" />
<meta property="og:image:secure_url" content="${esc(image)}" />
<meta property="og:image:alt" content="${esc(title)}" />
<meta property="og:url" content="${SITE}/p/${esc(id)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(desc)}" />
<meta name="twitter:image" content="${esc(image)}" />
<script>window.__POST_ID = ${JSON.stringify(id)};</script>
`;

  html = html
    .replace(/<title>[\s\S]*?<\/title>/i, "")
    .replace("</head>", tags + "</head>");

  res.set("Cache-Control", "public, max-age=300, s-maxage=600");
  res.status(200).send(html);
});