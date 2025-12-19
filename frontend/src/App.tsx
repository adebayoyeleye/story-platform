import { useEffect, useState } from 'react'
import type { Story } from './types' // Import the shape we just made

function App() {
  // State to hold the list of stories
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // useEffect runs once when the component mounts
  useEffect(() => {
    fetch('/api/stories') // The Proxy sends this to localhost:8080
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        return response.json()
      })
      .then(data => {
        setStories(data)
        setLoading(false)
      })
      .catch(err => {
        console.error("Error fetching stories:", err)
        setError('Failed to load stories. Is the Backend running?')
        setLoading(false)
      })
  }, [])

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ borderBottom: '2px solid #333', paddingBottom: '10px' }}>Story Platform 📚</h1>
      
      {/* Status Messages */}
      {loading && <p>Loading stories...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* The List of Stories */}
      <div style={{ marginTop: '20px' }}>
        {stories.map(story => (
          <div key={story.id} style={{ 
              border: '1px solid #ddd', 
              padding: '20px', 
              borderRadius: '8px', 
              marginBottom: '20px',
              backgroundColor: '#f9f9f9'
            }}>
            <h2>{story.title}</h2>
            <p><strong>By:</strong> {story.author}</p>
            <p><em>{story.synopsis}</em></p>
            
            <details>
              <summary>View Chapters ({story.chapters ? story.chapters.length : 0})</summary>
              <div style={{ paddingLeft: '20px', marginTop: '10px' }}>
                {story.chapters && story.chapters.map((chapter, index) => (
                  <div key={index} style={{ marginBottom: '10px' }}>
                    <h4>{chapter.title}</h4>
                    <p>{chapter.content}</p>
                  </div>
                ))}
              </div>
            </details>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App