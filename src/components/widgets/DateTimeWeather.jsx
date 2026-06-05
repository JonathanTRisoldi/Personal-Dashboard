import { useState, useEffect } from 'react'

const quotes_list = [
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
  { q: "Your time is limited, so don't waste it living someone else's life.", a: "Steve Jobs" },
  { q: "Not how long, but how well you have lived is the main thing.", a: "Seneca" },
  { q: "Money and success don't change people; they merely amplify what is already there.", a: "Will Smith" },
  { q: "If you want to live a happy life, tie it to a goal, not to people or things.", a: "Albert Einstein" },
  { q: "If you look at what you have in life, you'll always have more.", a: "Oprah Winfrey" },
  { q: "In three words I can sum up everything I've learned about life: it goes on.", a: "Robert Frost" },
  { q: "Love the life you live. Live the life you love.", a: "Bob Marley" },
  { q: "Be yourself; everyone else is already taken.", a: "Oscar Wilde" },
]

export default function DateTimeWeather() {
  const [time, setTime] = useState(new Date())
  const [weather, setWeather] = useState(null)
  const [quote, setQuote] = useState(null)

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    setQuote(quotes_list[Math.floor(Math.random() * quotes_list.length)])
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords
        console.log('Location:', latitude, longitude)
        const key = import.meta.env.VITE_OPENWEATHER_KEY
        console.log('Key:', key)
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${key}&units=imperial`
        )
        const data = await res.json()
        console.log('Weather data:', data)
        if (data.main) setWeather(data)
      } catch (e) {
        console.log('Weather error:', e)
      }
    }, (err) => {
      console.log('Location error:', err)
    })
  }, [])

  const formatDate = (date) => date.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  const formatTime = (date) => date.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit'
  })

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr 1fr',
      alignItems: 'center',
      gap: '16px'
    }}>
      {/* Time & Date */}
      <div>
        <div style={{ fontSize: '40px', fontWeight: 'bold', color: '#fff', lineHeight: 1 }}>
          {formatTime(time)}
        </div>
        <div style={{ fontSize: '14px', color: '#888', marginTop: '6px' }}>
          {formatDate(time)}
        </div>
      </div>

      {/* Quote */}
      <div style={{ textAlign: 'center', padding: '0 16px', borderLeft: '1px solid #2a2d3e', borderRight: '1px solid #2a2d3e' }}>
        {quote && (
          <>
            <p style={{
              color: '#e0e0e0',
              fontSize: '13px',
              fontStyle: 'italic',
              lineHeight: '1.5',
              marginBottom: '6px'
            }}>
              "{quote.q}"
            </p>
            <p style={{ color: '#6c63ff', fontSize: '12px' }}>— {quote.a}</p>
            <button
              onClick={() => setQuote(quotes_list[Math.floor(Math.random() * quotes_list.length)])}
              style={{
                marginTop: '8px',
                padding: '4px 12px',
                background: 'none',
                color: '#555',
                border: '1px solid #2a2d3e',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              New Quote
            </button>
          </>
        )}
      </div>

      {/* Weather */}
      <div style={{ textAlign: 'center' }}>
        {weather ? (
          <>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#fff' }}>
              {Math.round(weather.main.temp)}°F
            </div>
            <div style={{ fontSize: '14px', color: '#888', textTransform: 'capitalize' }}>
              {weather.weather[0].description}
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
              {weather.name}
            </div>
          </>
        ) : (
          <div style={{ color: '#555', fontSize: '13px' }}>Weather loading...</div>
        )}
      </div>
    </div>
  )
}