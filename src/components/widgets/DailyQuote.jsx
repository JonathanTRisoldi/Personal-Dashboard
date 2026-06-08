import { useState, useEffect } from 'react'

const quotes = [
  { q: "The only way to do great work is to love what you do.", a: "Steve Jobs" },
  { q: "Life is what happens when you're busy making other plans.", a: "John Lennon" },
  { q: "The future belongs to those who believe in the beauty of their dreams.", a: "Eleanor Roosevelt" },
  { q: "It is during our darkest moments that we must focus to see the light.", a: "Aristotle" },
  { q: "Whoever is happy will make others happy too.", a: "Anne Frank" },
  { q: "Do not go where the path may lead, go instead where there is no path and leave a trail.", a: "Ralph Waldo Emerson" },
  { q: "You will face many defeats in life, but never let yourself be defeated.", a: "Maya Angelou" },
  { q: "In the end, it's not the years in your life that count. It's the life in your years.", a: "Abraham Lincoln" },
  { q: "Never let the fear of striking out keep you from playing the game.", a: "Babe Ruth" },
  { q: "Life is either a daring adventure or nothing at all.", a: "Helen Keller" },
  { q: "Many of life's failures are people who did not realize how close they were to success when they gave up.", a: "Thomas A. Edison" },
  { q: "You have brains in your head. You have feet in your shoes. You can steer yourself any direction you choose.", a: "Dr. Seuss" },
  { q: "If life were predictable it would cease to be life, and be without flavor.", a: "Eleanor Roosevelt" },
  { q: "If you look at what you have in life, you'll always have more.", a: "Oprah Winfrey" },
  { q: "If you want to live a happy life, tie it to a goal, not to people or things.", a: "Albert Einstein" },
  { q: "Never let the fear of striking out keep you from playing the game.", a: "Babe Ruth" },
  { q: "Money and success don't change people; they merely amplify what is already there.", a: "Will Smith" },
  { q: "Your time is limited, so don't waste it living someone else's life.", a: "Steve Jobs" },
  { q: "Not how long, but how well you have lived is the main thing.", a: "Seneca" },
  { q: "If life were predictable it would cease to be life, and be without flavor.", a: "Eleanor Roosevelt" },
]

export default function DailyQuote() {
  const [quote, setQuote] = useState(null)

  useEffect(() => {
    pickQuote()
  }, [])

  const pickQuote = () => {
    const random = quotes[Math.floor(Math.random() * quotes.length)]
    setQuote(random)
  }

  if (!quote) return null

  return (
    <div style={{ textAlign: 'center', padding: '8px 0' }}>
      <p style={{
        color: 'var(--text)',
        fontSize: '18px',
        fontStyle: 'italic',
        lineHeight: '1.6',
        marginBottom: '12px'
      }}>
        "{quote.q}"
      </p>
      <p style={{ color: 'var(--accent)', fontSize: '14px', marginBottom: '16px' }}>— {quote.a}</p>
      <button
        onClick={pickQuote}
        style={{
          padding: '8px 20px',
          background: 'none',
          color: 'var(--text-muted)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '13px'
        }}
      >
        New Quote
      </button>
    </div>
  )
}