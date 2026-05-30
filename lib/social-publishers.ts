// Social media publishing adapters
// Each returns { success, postId?, error? }

export type PublishResult = { success: boolean; postId?: string; error?: string }

// ── Helpers ───────────────────────────────────────────────────────────────────

function pEncode(s: string) {
  return encodeURIComponent(s).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase())
}

async function oauthHeader(
  method: string, url: string,
  consumerKey: string, consumerSecret: string,
  accessToken: string, tokenSecret: string
): Promise<string> {
  const nonce = crypto.randomUUID().replace(/-/g, '')
  const ts = Math.floor(Date.now() / 1000).toString()
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: ts,
    oauth_token: accessToken,
    oauth_version: '1.0',
  }
  const sorted = Object.entries(oauthParams).sort(([a], [b]) => a.localeCompare(b))
  const paramStr = sorted.map(([k, v]) => `${pEncode(k)}=${pEncode(v)}`).join('&')
  const base = `${method.toUpperCase()}&${pEncode(url)}&${pEncode(paramStr)}`
  const sigKey = `${pEncode(consumerSecret)}&${pEncode(tokenSecret)}`
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(sigKey), { name: 'HMAC', hash: 'SHA-1' }, false, ['sign'])
  const sigBytes = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(base))
  const sig = btoa(Array.from(new Uint8Array(sigBytes), c => String.fromCharCode(c)).join(''))
  const all = { ...oauthParams, oauth_signature: sig }
  return 'OAuth ' + Object.entries(all).map(([k, v]) => `${pEncode(k)}="${pEncode(v)}"`).join(', ')
}

// ── Facebook ──────────────────────────────────────────────────────────────────

export async function publishFacebook(content: string, mediaUrl?: string): Promise<PublishResult> {
  const pageId = process.env.FACEBOOK_PAGE_ID
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN
  if (!pageId || !token) return { success: false, error: 'Facebook credentials missing (FACEBOOK_PAGE_ID, FACEBOOK_PAGE_ACCESS_TOKEN)' }

  const body: Record<string, string> = { message: content, access_token: token }
  if (mediaUrl) body.link = mediaUrl

  const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) return { success: false, error: data.error?.message ?? 'Facebook post failed' }
  return { success: true, postId: data.id }
}

// ── Instagram ─────────────────────────────────────────────────────────────────

export async function publishInstagram(caption: string, mediaUrl: string): Promise<PublishResult> {
  const igId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN
  if (!igId || !token) return { success: false, error: 'Instagram credentials missing (INSTAGRAM_BUSINESS_ACCOUNT_ID, FACEBOOK_PAGE_ACCESS_TOKEN)' }
  if (!mediaUrl) return { success: false, error: 'Instagram requires a public image URL (media_url)' }

  // Step 1 — Create media container
  const cRes = await fetch(`https://graph.facebook.com/v19.0/${igId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ caption, image_url: mediaUrl, access_token: token }),
  })
  const cData = await cRes.json()
  if (!cRes.ok) return { success: false, error: cData.error?.message ?? 'Instagram container failed' }

  // Step 2 — Publish container
  const pRes = await fetch(`https://graph.facebook.com/v19.0/${igId}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ creation_id: cData.id, access_token: token }),
  })
  const pData = await pRes.json()
  if (!pRes.ok) return { success: false, error: pData.error?.message ?? 'Instagram publish failed' }
  return { success: true, postId: pData.id }
}

// ── LinkedIn ──────────────────────────────────────────────────────────────────

export async function publishLinkedIn(content: string): Promise<PublishResult> {
  const token = process.env.LINKEDIN_ACCESS_TOKEN
  const author = process.env.LINKEDIN_AUTHOR_URN  // e.g. urn:li:person:XXXX or urn:li:organization:XXXX
  if (!token || !author) return { success: false, error: 'LinkedIn credentials missing (LINKEDIN_ACCESS_TOKEN, LINKEDIN_AUTHOR_URN)' }

  const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      author,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text: content },
          shareMediaCategory: 'NONE',
        },
      },
      visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
    }),
  })
  const data = await res.json()
  if (!res.ok) return { success: false, error: data.message ?? JSON.stringify(data) }
  return { success: true, postId: data.id }
}

// ── Twitter / X ───────────────────────────────────────────────────────────────

export async function publishTwitter(content: string): Promise<PublishResult> {
  const apiKey = process.env.TWITTER_API_KEY
  const apiSecret = process.env.TWITTER_API_SECRET
  const accessToken = process.env.TWITTER_ACCESS_TOKEN
  const tokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET
  if (!apiKey || !apiSecret || !accessToken || !tokenSecret)
    return { success: false, error: 'Twitter credentials missing (TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_TOKEN_SECRET)' }

  const url = 'https://api.twitter.com/2/tweets'
  const auth = await oauthHeader('POST', url, apiKey, apiSecret, accessToken, tokenSecret)

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: content }),
  })
  const data = await res.json()
  if (!res.ok) return { success: false, error: data.detail ?? data.title ?? 'Twitter post failed' }
  return { success: true, postId: data.data?.id }
}

// ── Dispatcher ────────────────────────────────────────────────────────────────

export async function publishToplatform(
  platform: string, content: string, mediaUrl?: string
): Promise<PublishResult> {
  switch (platform) {
    case 'facebook':   return publishFacebook(content, mediaUrl)
    case 'instagram':  return publishInstagram(content, mediaUrl ?? '')
    case 'linkedin':   return publishLinkedIn(content)
    case 'twitter':    return publishTwitter(content)
    default:           return { success: false, error: `Unknown platform: ${platform}` }
  }
}
