import { useState, useEffect } from 'react'

const DEFAULT_FEEDS = [
  { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
  { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index' },
  { name: 'Kotaku', url: 'https://kotaku.com/rss' },
]

const PROXY = 'https://api.rss2json.com/v1/api.json?rss_url='

export default function RSSFeed() {
  const [feeds, setFeeds] = useState(() => {
    const saved = localStorage.getItem('rss_feeds')
    return saved ? JSON.parse(saved) : DEFAULT_FEEDS
  })
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFeed, setActiveFeed] = useState(0)
  const [newFeedName, setNewFeedName] = useState('')
  const [newFeedUrl, setNewFeedUrl] = useState('')
  const [managing, setManaging] = useState(false)

  useEffect(() => {
    fetchFeed(feeds[activeFeed])
  }, [activeFeed, feeds])

  useEffect(() => {
    localStorage.setItem('rss_feeds', JSON.stringify(feeds))
  }, [feeds])

  const fetchFeed = async (feed) => {
    if (!feed) return
    setLoading(true)
    setArticles([])
    try {
      const res = await fetch(`${PROXY}${encodeURIComponent(feed.url)}`)
      const data = await res.json()
      if (data.items) setArticles(data.items.slice(0, 10))
    } catch (e) {
      console.log('Feed error', e)
    }
    setLoading(false)
  }

  const addFeed = () => {
    if (!newFeedName.trim() || !newFeedUrl.trim()) return
    const updated = [...feeds, { name: newFeedName, url: newFeedUrl }]
    setFeeds(updated)
    setNewFeedName('')
    setNewFeedUrl('')
  }

  const removeFeed = (index) => {
    const updated = feeds.filter((_, i) => i !== index)
    setFeeds(updated)
    if (activeFeed >= updated.length) setActiveFeed(0)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric'
    })
  }

  return (
    <div>
      {/* Feed Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        {feeds.map((feed, i) => (
          <button
            key={i}
            onClick={() => setActiveFeed(i)}
            style={{
              padding: '6px 14px',
              background: activeFeed === i ? 'var(--accent)' : '#0f1117',
              color: activeFeed === i ? '#fff' : '#888',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            {feed.name}
          </button>
        ))}
        <button
          onClick={() => setManaging(!managing)}
          style={{
            padding: '6px 14px',
            background: managing ? '#2a2d3e' : 'none',
            color: 'var(--accent)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px'
          }}
        >
          {managing ? 'Done' : '+ Manage Feeds'}
        </button>
      </div>

      {/* Manage Feeds */}
      {managing && (
        <div style={{
          background: 'var(--card-inner)',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={newFeedName}
              onChange={(e) => setNewFeedName(e.target.value)}
              placeholder="Feed name..."
              style={{
                flex: 1,
                minWidth: '120px',
                padding: '7px 10px',
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                color: 'var(--text)',
                fontSize: '13px'
              }}
            />
            <input
              type="text"
              value={newFeedUrl}
              onChange={(e) => setNewFeedUrl(e.target.value)}
              placeholder="Feed URL..."
              style={{
                flex: 2,
                minWidth: '200px',
                padding: '7px 10px',
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                color: 'var(--text)',
                fontSize: '13px'
              }}
            />
            <button
              onClick={addFeed}
              style={{
                padding: '7px 16px',
                background: 'var(--accent)',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              Add
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {feeds.map((feed, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                background: 'var(--card)',
                borderRadius: '6px'
              }}>
                <span style={{ color: 'var(--text)', fontSize: '13px' }}>{feed.name}</span>
                <button
                  onClick={() => removeFeed(i)}
                  style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '16px' }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Articles */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading articles...</p>
      ) : articles.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No articles found.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
          {articles.map((article, i) => (
            <a
              key={i}
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                padding: '12px',
                background: 'var(--card-inner)',
                borderRadius: '8px',
                textDecoration: 'none',
                borderLeft: '3px solid var(--accent)'
              }}
            >
              <p style={{ color: 'var(--text)', fontSize: '14px', marginBottom: '4px', lineHeight: '1.4' }}>
                {article.title}
              </p>
              <span style={{ color: 'var(--text-dim)', fontSize: '11px' }}>{formatDate(article.pubDate)}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}