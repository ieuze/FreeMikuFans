const BILI_API = 'https://api.bilibili.com'
const BILI_WWW = 'https://www.bilibili.com'

const VIDEO_INFO_URL = `${BILI_API}/x/web-interface/view`
const PLAYURL_WBI_URL = `${BILI_API}/x/player/wbi/playurl`
const WBI_NAV_URL = `${BILI_API}/x/web-interface/nav`
const SEARCH_URL = `${BILI_API}/x/web-interface/search/type`
const CHANNEL_URL = `${BILI_API}/x/space/wbi/arc/search`
const SUBTITLE_META_URL = `${BILI_API}/x/player/wbi/v2`
const COMMENT_URL = `${BILI_API}/x/v2/reply/wbi/main`
const RELATED_URL = `${BILI_API}/x/web-interface/archive/related`

// Quality mapping: id -> label
const VIDEO_QUALITY_MAP = {
  127: '8K',
  126: '4K 60FPS',
  125: 'HDR 4K',
  120: '4K',
  116: '1080P 60',
  112: '1080P+',
  80: '1080P',
  74: '720P 60',
  64: '720P',
  32: '480P',
  16: '360P',
  6: '240P',
}

const AUDIO_QUALITY_MAP = {
  30280: '192K',
  30232: '132K',
  30216: '64K',
  30250: 'Dolby Atmos',
  30251: 'Hi-Res',
  30252: 'Dolby Atmos (Premium)',
}

// BV/AV conversion constants
const XOR_CODE = 23442827791579n
const MASK_CODE = 2251799813685247n
const BASE_TABLE = 'FcwAPNKTMug3GV5Lj7EJnHpWsx4tb8haYeviqBz6rkCy12mUSDQX9RdoZf'

// WBI mixin key permutation table (from PipePipe source)
const MIXIN_KEY_ENC_TABLE = [
  46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35,
  27, 43, 5, 49, 33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13,
  37, 48, 7, 16, 24, 55, 40, 61, 26, 17, 0, 1, 60, 51, 30, 4,
  22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11, 36, 20, 34, 44, 52,
]

// ---- Pure JS MD5 ----

function md5(s) {
  const rotateLeft = (x, n) => (x << n) | (x >>> (32 - n))
  const toHex = (v) => {
    let s = ''
    for (let i = 0; i < 4; i++) {
      s += '0123456789abcdef'.charAt((v >>> (i * 8 + 4)) & 0xf) +
        '0123456789abcdef'.charAt((v >>> (i * 8)) & 0xf)
    }
    return s
  }
  const padding = (msg) => {
    const origLen = msg.length * 8
    msg.push(0x80)
    while ((msg.length * 8) % 512 !== 448) msg.push(0)
    for (let i = 0; i < 8; i++) msg.push((origLen >>> (i * 8)) & 0xff)
    return msg
  }
  const strToWords = (s) => {
    const w = []
    for (let i = 0; i < s.length; i++) {
      const idx = i >> 2
      w[idx] = (w[idx] || 0) | ((s.charCodeAt(i) & 0xff) << ((i % 4) * 8))
    }
    return w
  }

  const K = [0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee,
    0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
    0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
    0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
    0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa,
    0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed,
    0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
    0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
    0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
    0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05,
    0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039,
    0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
    0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
    0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391]
  const S = [7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21]

  const bytes = padding(strToWords(s).map(w => w >>> 0))
  let a0 = 0x67452301; let b0 = 0xefcdab89; let c0 = 0x98badcfe; let d0 = 0x10325476

  for (let i = 0; i < bytes.length; i += 16) {
    const M = bytes.slice(i, i + 16)
    let A = a0; let B = b0; let C = c0; let D = d0

    for (let j = 0; j < 64; j++) {
      let F, g
      if (j < 16) { F = (B & C) | (~B & D); g = j } else if (j < 32) { F = (D & B) | (~D & C); g = (5 * j + 1) % 16 } else if (j < 48) { F = B ^ C ^ D; g = (3 * j + 5) % 16 } else { F = C ^ (B | ~D); g = (7 * j) % 16 }

      F = (F + A + K[j] + M[g]) >>> 0
      const temp = D
      D = C
      C = B
      B = (B + rotateLeft(F, S[j])) >>> 0
      A = temp
    }
    a0 = (a0 + A) >>> 0
    b0 = (b0 + B) >>> 0
    c0 = (c0 + C) >>> 0
    d0 = (d0 + D) >>> 0
  }

  return toHex(a0) + toHex(b0) + toHex(c0) + toHex(d0)
}

// ---- BV / AV conversion ----

export function bv2av(bvid) {
  if (!bvid || typeof bvid !== 'string') return null
  if (!/^BV1[\dA-Za-z]{9}$/.test(bvid)) return null

  const arr = [...bvid]
  ;[arr[3], arr[9]] = [arr[9], arr[3]]
  ;[arr[4], arr[7]] = [arr[7], arr[4]]
  const sub = arr.slice(3).join('')
  let r = 0n
  for (const ch of sub) {
    const idx = BASE_TABLE.indexOf(ch)
    if (idx === -1) return null
    r = r * 58n + BigInt(idx)
  }
  return Number(r & MASK_CODE ^ XOR_CODE)
}

export function av2bv(aid) {
  const bytes = ['B', 'V', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0']
  const maxAid = 1n << 51n
  let bvIndex = bytes.length - 1
  let tmp = (maxAid | BigInt(aid)) ^ XOR_CODE
  while (tmp > 0n) {
    bytes[bvIndex] = BASE_TABLE[Number(tmp % 58n)]
    tmp = tmp / 58n
    bvIndex -= 1
  }
  ;[bytes[3], bytes[9]] = [bytes[9], bytes[3]]
  ;[bytes[4], bytes[7]] = [bytes[7], bytes[4]]
  return bytes.join('')
}

// ---- WBI Signing ----

let wbiKeysCache = { imgKey: '', subKey: '', expiresAt: 0 }

function getMixinKey(imgKey, subKey) {
  const raw = imgKey + subKey
  let result = ''
  for (let i = 0; i < 64; i++) {
    result += raw[MIXIN_KEY_ENC_TABLE[i]]
  }
  return result.substring(0, 32)
}

function encodeWbiParam(value) {
  return encodeURIComponent(String(value)).replaceAll('%20', '+')
}

export async function fetchWbiKeys() {
  if (wbiKeysCache.expiresAt > Date.now()) {
    return { imgKey: wbiKeysCache.imgKey, subKey: wbiKeysCache.subKey }
  }

  const response = await biliFetch(WBI_NAV_URL)
  if (!response.ok) throw new Error(`WBI nav fetch failed: ${response.status}`)
  const json = await response.json()

  const imgUrl = json.data?.wbi_img?.img_url
  const subUrl = json.data?.wbi_img?.sub_url

  if (!imgUrl || !subUrl) throw new Error('WBI keys not found in nav response')

  const extractKey = (url) => {
    const segments = url.split('/')
    const filename = segments[segments.length - 1]
    return filename ? filename.split('.')[0] : null
  }
  const imgKey = extractKey(imgUrl)
  const subKey = extractKey(subUrl)

  if (!imgKey || !subKey) throw new Error('Could not extract WBI keys from URLs')

  wbiKeysCache = { imgKey, subKey, expiresAt: Date.now() + 7200000 }
  return { imgKey, subKey }
}

export async function encWbi(url, params = {}) {
  const { imgKey, subKey } = await fetchWbiKeys()
  const mixinKey = getMixinKey(imgKey, subKey)

  const sortedParams = Object.keys(params).sort().reduce((acc, key) => {
    acc[key] = params[key]
    return acc
  }, {})

  const wts = Math.floor(Date.now() / 1000)
  sortedParams.wts = String(wts)

  // Hash uses URL-encoded params (percent-encoded spaces)
  const hashQueryStr = Object.keys(sortedParams)
    .map((key) => `${encodeWbiParam(key)}=${encodeWbiParam(sortedParams[key])}`)
    .join('&')
  const sign = md5(hashQueryStr + mixinKey)

  // Actual URL uses raw params
  sortedParams.w_rid = sign
  const finalQueryStr = Object.keys(sortedParams)
    .map((key) => `${key}=${sortedParams[key]}`)
    .join('&')

  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}${finalQueryStr}`
}

// ---- DeviceForger ----

const GPU_POOL = [
  { vendor: 'NVIDIA', model: 'NVIDIA GeForce RTX 4090 D (0x00002685)' },
  { vendor: 'NVIDIA', model: 'NVIDIA GeForce RTX 4080 SUPER (0x00002683)' },
  { vendor: 'NVIDIA', model: 'NVIDIA GeForce RTX 4070 Ti (0x00002786)' },
  { vendor: 'NVIDIA', model: 'NVIDIA GeForce RTX 4060 (0x00002882)' },
  { vendor: 'NVIDIA', model: 'NVIDIA GeForce RTX 3090 (0x00002204)' },
  { vendor: 'NVIDIA', model: 'NVIDIA GeForce RTX 3080 (0x00002216)' },
  { vendor: 'NVIDIA', model: 'NVIDIA GeForce RTX 3070 (0x00002484)' },
  { vendor: 'NVIDIA', model: 'NVIDIA GeForce RTX 3060 Ti (0x00002486)' },
  { vendor: 'AMD', model: 'AMD Radeon RX 7900 XTX (0x0000744C)' },
  { vendor: 'AMD', model: 'AMD Radeon RX 7800 XT (0x0000747F)' },
  { vendor: 'AMD', model: 'AMD Radeon RX 7700 XT (0x0000747E)' },
  { vendor: 'Intel', model: 'Intel(R) Arc(TM) A770 Graphics (0x000056A0)' },
  { vendor: 'Intel', model: 'Intel(R) UHD Graphics 770 (0x0000468A)' },
  { vendor: 'Intel', model: 'Intel(R) Iris(R) Xe Graphics (0x00009A49)' },
]

function buildAngleRendererInfo(vendor, gpuModel) {
  return `ANGLE (${vendor}, ${gpuModel} Direct3D11 vs_5_0 ps_5_0, D3D11)Google Inc. (${vendor})`
}

const WEBGL_VERSIONS = [
  'WebGL 1.0 (OpenGL ES 2.0 Chromium)',
  'WebGL 1.0 (OpenGL ES 2.0 ANGLE)',
  'WebGL 2.0 (OpenGL ES 3.0 Chromium)',
  'WebGL 2.0 (OpenGL ES 3.0 ANGLE)',
]

function b64Encode(str) {
  return btoa(unescape(encodeURIComponent(str)))
}

class DeviceForger {
  constructor() {
    this._generate()
  }

  _generate() {
    this.chromeMajor = 130 + Math.floor(Math.random() * 8)
    this.chromeVersion = `${this.chromeMajor}.0.0.0`
    const gpuEntry = GPU_POOL[Math.floor(Math.random() * GPU_POOL.length)]
    this.gpuVendor = gpuEntry.vendor
    this.gpuModel = gpuEntry.model
    this.angleRendererInfo = buildAngleRendererInfo(gpuEntry.vendor, gpuEntry.model)
    this.webglVersion = WEBGL_VERSIONS[Math.floor(Math.random() * WEBGL_VERSIONS.length)]
    this.screenWidth = 1920 + Math.floor(Math.random() * 400)
    this.screenHeight = 1080 + Math.floor(Math.random() * 200)
    this.colorDepth = 24
    this.pixelRatio = 1 + Math.random()
  }

  getUserAgent() {
    return `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${this.chromeVersion} Safari/537.36`
  }

  getWebGlVersionBase64() {
    return b64Encode(this.webglVersion)
  }

  getWebGLRendererInfoBase64() {
    return b64Encode(this.angleRendererInfo)
  }
}

const deviceForger = new DeviceForger()

// ---- Cookie Generation ----

function randomHex(len) {
  const bytes = new Uint8Array(Math.ceil(len / 2))
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, len)
}

function generateBuvid3() {
  const hex1 = randomHex(8)
  const hex2 = randomHex(4)
  const hex3 = randomHex(4)
  const hex4 = randomHex(4)
  const hex5 = randomHex(12)
  return `${hex1}-${hex2}-${hex3}-${hex4}-${hex5}infoc`
}

function generateBuvid4() {
  const hex = randomHex(8)
  const rand = Math.floor(Math.random() * 9999999999)
  const ts = Date.now()
  return `${hex}-${rand}-${ts}-infoc`
}

export function generateBilibiliCookies() {
  const buvid3 = generateBuvid3()
  const buvid4 = generateBuvid4()
  const uuid = randomHex(32)
  const lsid = `${randomHex(8)}_${randomHex(8)}`

  return {
    buvid3,
    buvid4,
    uuid: uuid.toUpperCase(),
    lsid,
    cookieStr: `buvid3=${buvid3}; buvid4=${buvid4}; _uuid=${uuid.toUpperCase()}; b_lsid=${lsid};`
  }
}

let currentCookies = generateBilibiliCookies()

export function refreshCookie() {
  currentCookies = generateBilibiliCookies()
}

// ---- dm_img params ----

function getWh(w, h) {
  const rnd = Math.floor(Math.random() * 114)
  return [2 * w + 2 * h + 3 * rnd, 4 * w - h + rnd, rnd]
}

function getOf(scrollTop, scrollLeft) {
  const rnd = Math.floor(Math.random() * 514)
  return [3 * scrollTop + 2 * scrollLeft + rnd, 4 * scrollTop - 4 * scrollLeft + 2 * rnd, rnd]
}

export function generateDmImgParams() {
  const w = deviceForger.screenWidth + Math.floor(Math.random() * 20 - 10)
  const h = deviceForger.screenHeight + Math.floor(Math.random() * 20 - 10)
  const wh = getWh(w, h)
  const ofv = getOf(0, 0)

  return {
    dm_img_list: '[]',
    dm_img_str: deviceForger.getWebGlVersionBase64(),
    dm_cover_img_str: deviceForger.getWebGLRendererInfoBase64(),
    dm_img_inter: JSON.stringify({ ds: [], wh, of: ofv }),
  }
}

// ---- HTTP Helper ----

export function getBaseHeaders(extra = {}) {
  return {
    'User-Agent': deviceForger.getUserAgent(),
    Referer: BILI_WWW,
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    Accept: 'application/json, text/plain, */*',
    Origin: BILI_WWW,
    ...extra,
  }
}

export function setAuthHeader(headers = {}) {
  return { ...headers, Cookie: currentCookies.cookieStr }
}

export async function biliFetch(url, options = {}) {
  const headers = { ...getBaseHeaders(), ...options.headers }
  const response = await fetch(url, { ...options, headers })

  if (response.status === 412) {
    refreshCookie()
    deviceForger._generate()
    const retryHeaders = { ...getBaseHeaders(), ...options.headers }
    return fetch(url, { ...options, headers: retryHeaders })
  }

  return response
}

export async function biliApiGet(url) {
  const response = await biliFetch(url)
  if (!response.ok) throw new Error(`Bilibili API error: ${response.status}`)
  const json = await response.json()
  if (json.code !== 0) {
    if (json.code === -352) {
      refreshCookie()
      deviceForger._generate()
      throw new Error(`Bilibili risk control (-352): ${json.message}`)
    }
    throw new Error(`Bilibili API error: ${json.code} ${json.message}`)
  }
  return json.data
}

// ---- Video Info Extraction ----

export async function getBilibiliVideoInfo(bvid, page = 1) {
  if (!bvid) throw new Error('BV id is required')

  let resolvedBvid = bvid
  if (bvid.startsWith('av')) {
    const aid = parseInt(bvid.slice(2), 10)
    if (isNaN(aid)) throw new Error(`Invalid AV id: ${bvid}`)
    resolvedBvid = av2bv(aid)
    if (!resolvedBvid) throw new Error(`Could not convert AV id: ${bvid}`)
  }

  const videoData = await biliApiGet(`${VIDEO_INFO_URL}?bvid=${resolvedBvid}&p=${page}`)

  const pages = videoData.pages || []
  const activePage = pages[page - 1] || pages[0] || {}
  const cid = activePage.cid
  if (!cid) throw new Error('Could not get cid for video')

  // Build playurl params
  const playParams = {
    avid: String(videoData.aid),
    bvid: resolvedBvid,
    cid: String(cid),
    qn: '120',
    fnver: '0',
    fnval: '4048',
    fourk: '1',
    ...generateDmImgParams(),
  }

  let playUrl = await encWbi(PLAYURL_WBI_URL, playParams)
  let dashData

  try {
    dashData = await biliApiGet(playUrl)
  } catch (err) {
    // Fallback: try without 4K
    if (err.message.includes('-352') || err.message.includes('412')) {
      delete playParams.fourk
      playParams.qn = '80'
      playUrl = await encWbi(PLAYURL_WBI_URL, playParams)
      dashData = await biliApiGet(playUrl)
    } else {
      throw err
    }
  }

  return {
    raw: videoData,
    dash: dashData,
    bvid: resolvedBvid,
    aid: videoData.aid,
    cid,
    page,
    title: videoData.title || '',
    description: videoData.desc || '',
    duration: videoData.duration || 0,
    owner: videoData.owner || {},
    stat: videoData.stat || {},
    pages,
    pic: fixUrl(videoData.pic),
    pubdate: videoData.pubdate || 0,
    tname: videoData.tname || '',
    tid: videoData.tid || 0,
  }
}

// ---- DASH Stream Parsing ----

export function parseBilibiliDashStreams(videoInfo) {
  const dash = videoInfo.dash?.dash || videoInfo.dash
  if (!dash) return { videoStreams: [], audioStreams: [] }

  const videoStreams = (dash.video || []).map((stream) => {
    const qualityLabel = VIDEO_QUALITY_MAP[stream.id] || `${stream.height}P`

    return {
      itag: stream.id,
      url: stream.baseUrl || stream.base_url,
      backupUrl: stream.backupUrl || stream.backup_url || [],
      mimeType: stream.mimeType || 'video/mp4',
      codecs: stream.codecs || '',
      width: stream.width || 0,
      height: stream.height || 0,
      bitrate: stream.bandwidth || 0,
      frameRate: stream.frameRate || '',
      qualityLabel,
      quality: qualityLabel,
      hasAudio: false,
      isDash: true,
      segmentBase: stream.SegmentBase || null,
    }
  }).sort((a, b) => b.height - a.height)

  const audioStreams = []
  const addAudio = (stream) => {
    const qualityLabel = AUDIO_QUALITY_MAP[stream.id] || `${Math.round(stream.bandwidth / 1000)}K`
    audioStreams.push({
      itag: stream.id,
      url: stream.baseUrl || stream.base_url,
      backupUrl: stream.backupUrl || stream.backup_url || [],
      mimeType: stream.mimeType || 'audio/mp4',
      codecs: stream.codecs || '',
      bitrate: stream.bandwidth || 0,
      qualityLabel,
      quality: qualityLabel,
      hasVideo: false,
      isDash: true,
      segmentBase: stream.SegmentBase || null,
    })
  }

  ;(dash.audio || []).forEach(addAudio)

  // Dolby Atmos
  if (dash.dolby?.audio) {
    ;(Array.isArray(dash.dolby.audio) ? dash.dolby.audio : [dash.dolby.audio]).forEach(addAudio)
  }

  // Hi-Res FLAC
  if (dash.flac?.audio) {
    const flacStream = Array.isArray(dash.flac.audio) ? dash.flac.audio[0] : dash.flac.audio
    if (flacStream) addAudio(flacStream)
  }

  return { videoStreams, audioStreams }
}

// ---- DASH Manifest Generation (Phase 2) ----

export function generateBilibiliDashManifest(videoInfo, options = {}) {
  const { videoStreams, audioStreams } = parseBilibiliDashStreams(videoInfo)
  if (videoStreams.length === 0 && audioStreams.length === 0) {
    return null
  }

  const duration = videoInfo.duration || 0
  const durationStr = `PT${duration}S`

  let xml = '<?xml version="1.0" encoding="utf-8"?>\n'
  xml += '<MPD xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n'
  xml += '     xmlns="urn:mpeg:dash:schema:mpd:2011"\n'
  xml += '     profiles="urn:mpeg:dash:profile:isoff-live:2011"\n'
  xml += '     minBufferTime="PT1.5S"\n'
  xml += '     type="static"\n'
  xml += `     mediaPresentationDuration="${durationStr}">\n`
  xml += '  <Period id="0">\n'

  // Video adaptation set
  if (videoStreams.length > 0) {
    xml += '    <AdaptationSet mimeType="video/mp4" contentType="video">\n'
    for (const stream of videoStreams) {
      const baseUrl = stream.url
      const codecAttr = stream.codecs ? ` codecs="${escapeXml(stream.codecs)}"` : ''
      const bwAttr = stream.bitrate ? ` bandwidth="${stream.bitrate}"` : ''
      const wAttr = stream.width ? ` width="${stream.width}"` : ''
      const hAttr = stream.height ? ` height="${stream.height}"` : ''
      const frAttr = stream.frameRate ? ` frameRate="${stream.frameRate}"` : ''

      xml += `      <Representation id="${stream.itag}"${codecAttr}${bwAttr}${wAttr}${hAttr}${frAttr}>\n`
      xml += `        <BaseURL>${escapeXml(baseUrl)}</BaseURL>\n`

      if (stream.segmentBase) {
        xml += `        <SegmentBase indexRange="${stream.segmentBase.indexRange}" indexRangeExact="true">\n`
        xml += `          <Initialization range="${stream.segmentBase.Initialization}"/>\n`
        xml += '        </SegmentBase>\n'
      }

      xml += '      </Representation>\n'
    }
    xml += '    </AdaptationSet>\n'
  }

  // Audio adaptation set
  if (audioStreams.length > 0) {
    xml += '    <AdaptationSet mimeType="audio/mp4" contentType="audio">\n'
    for (const stream of audioStreams) {
      const baseUrl = stream.url
      const codecAttr = stream.codecs ? ` codecs="${escapeXml(stream.codecs)}"` : ''
      const bwAttr = stream.bitrate ? ` bandwidth="${stream.bitrate}"` : ''

      xml += `      <Representation id="${stream.itag}"${codecAttr}${bwAttr}>\n`
      xml += `        <BaseURL>${escapeXml(baseUrl)}</BaseURL>\n`

      if (stream.segmentBase) {
        xml += `        <SegmentBase indexRange="${stream.segmentBase.indexRange}" indexRangeExact="true">\n`
        xml += `          <Initialization range="${stream.segmentBase.Initialization}"/>\n`
        xml += '        </SegmentBase>\n'
      }

      xml += '      </Representation>\n'
    }
    xml += '    </AdaptationSet>\n'
  }

  xml += '  </Period>\n'
  xml += '</MPD>\n'

  const encoded = encodeURIComponent(xml)
  return `data:application/dash+xml;charset=UTF-8,${encoded}`
}

function escapeXml(str) {
  return String(str).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll('\'', '&apos;')
}

function fixUrl(url) {
  if (!url) return ''
  return url.startsWith('//') ? `https:${url}` : url
}

// ---- Search ----

export async function searchBilibili(query, page = 1, searchType = 'video') {
  const params = new URLSearchParams({
    search_type: searchType,
    keyword: query,
    page: String(page),
  })
  const data = await biliApiGet(`${SEARCH_URL}?${params.toString()}`)

  const results = (data.result || []).filter((item) => item.type === 'video').map((item) => {
    const author = item.author || item.mid || ''
    const bvid = item.bvid || ''
    const avid = item.aid || 0

    return {
      type: 'video',
      title: item.title?.replaceAll(/<[^>]*>/g, '') || '',
      videoId: bvid || `av${avid}`,
      author: typeof author === 'string' ? author : String(author),
      authorId: String(item.mid || ''),
      videoThumbnails: [{ url: fixUrl(item.pic), width: 196, height: 110 }],
      viewCount: item.play || 0,
      lengthSeconds: item.duration || 0,
      publishedText: item.pubdate || '',
      description: item.description || '',
    }
  })

  return {
    results,
    total: data.numResults || data.pages || 0,
    page,
  }
}

// ---- Channel ----

export async function getBilibiliChannelInfo(mid) {
  const params = {
    mid: String(mid),
    ps: '30',
    pn: '1',
    ...generateDmImgParams(),
  }
  const url = await encWbi(CHANNEL_URL, params)
  const data = await biliApiGet(url)

  return {
    name: data.mid?.name || '',
    mid: data.mid?.mid || mid,
    avatar: data.mid?.face || '',
    sign: data.mid?.sign || '',
    videos: (data.list?.vlist || []).map((v) => ({
      bvid: v.bvid || '',
      title: v.title || '',
      pic: fixUrl(v.pic),
      duration: v.length || 0,
      play: v.play || 0,
      videoReview: v.video_review || 0,
      created: v.created || 0,
      description: v.description || '',
    })),
    total: data.page?.count || 0,
  }
}

// ---- Subtitles (BCC -> SRT) ----

export async function getBilibiliSubtitles(bvid, cid) {
  const params = { bvid, cid: String(cid) }
  const url = await encWbi(SUBTITLE_META_URL, params)
  const data = await biliApiGet(url)

  const subtitles = data.subtitle?.subtitles || []
  if (subtitles.length === 0) return []

  const results = []
  for (const sub of subtitles) {
    try {
      const resp = await biliFetch(sub.subtitle_url.startsWith('//') ? `https:${sub.subtitle_url}` : sub.subtitle_url)
      const bccData = await resp.json()
      const srtContent = bcc2srt(bccData)
      results.push({
        language: sub.lan_doc || sub.lan || 'unknown',
        languageCode: sub.lan || 'unknown',
        url: sub.subtitle_url,
        srt: srtContent,
      })
    } catch (e) {
      console.error('Failed to fetch subtitle:', sub.subtitle_url, e)
    }
  }

  return results
}

export function bcc2srt(bccJson) {
  const body = bccJson.body
  if (!body || !Array.isArray(body)) return ''

  let srt = ''
  for (let i = 0; i < body.length; i++) {
    const item = body[i]
    const startMs = Math.round(item.from * 1000)
    const endMs = Math.round(item.to * 1000)
    const content = item.content || ''

    srt += `${i + 1}\n`
    srt += `${formatSrtTime(startMs)} --> ${formatSrtTime(endMs)}\n`
    srt += `${content}\n\n`
  }

  return srt
}

function formatSrtTime(ms) {
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  const millis = ms % 1000
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(millis).padStart(3, '0')}`
}

// ---- Comments ----

export async function getBilibiliComments(oid, page = 1, sort = 1) {
  const params = {
    oid: String(oid),
    type: '1',
    pn: String(page),
    ps: '20',
    sort: String(sort),
    web_location: '333.788',
  }
  const url = await encWbi(COMMENT_URL, params)
  const data = await biliApiGet(url)

  const replies = data.replies || []
  return {
    comments: replies.map((r) => ({
      id: String(r.rpid || r.id || ''),
      author: r.member?.uname || '',
      authorId: String(r.member?.mid || ''),
      avatar: r.member?.avatar || '',
      content: r.content?.message || '',
      likes: r.like || 0,
      rpidStr: r.rpid_str || '',
      ctime: r.ctime || 0,
      replyCount: r.rcount || 0,
    })),
    cursor: data.cursor || {},
    total: data.page?.count || data.total || 0,
  }
}

// ---- Related Videos ----

export async function getBilibiliRelated(bvid) {
  const data = await biliApiGet(`${RELATED_URL}${bvid}`)
  return (data || []).map((v) => ({
    bvid: v.bvid || '',
    title: v.title || '',
    pic: v.pic || '',
    duration: v.duration || 0,
    play: v.stat?.view || 0,
    author: v.owner?.name || v.author || '',
    authorId: String(v.owner?.mid || ''),
  }))
}
