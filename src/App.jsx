import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [translations, setTranslations] = useState([])
  const [books, setBooks] = useState([])
  const [chapters, setChapters] = useState([])
  const [verses, setVerses] = useState([])
  const [currTranslation, setCurrTranslation] = useState('')
  const [currBook, setCurrBook] = useState('')
  const [currChapter, setCurrChapter] = useState(0)
  const [currVerse, setCurrVerse] = useState(0)
  const [verseResult, setVerseResult] = useState('l')

  useEffect(() => {
    fetch('https://bible-api.com/data')
      .then(response => response.json())
      .then(data => {
        setTranslations(data.translations || [])
      })
      .catch(error => console.error('Failed to load translations:', error))
  }, [])

  function handleTranslationChange(e) {
    const value = e.target.value
    setCurrTranslation(value)
    setCurrBook('')
    setCurrChapter(0)
    setCurrVerse(0)
    setChapters([])
    setVerses([])

    fetch(`https://bible-api.com/data/${value}`)
      .then(response => response.json())
      .then(data => {
        setBooks(data.books || [])
      })
      .catch(error => console.error('Failed to load books:', error))
  }

  function handleBookChange(e) {
    const value = e.target.value
    setCurrBook(value)
    setCurrChapter(0)
    setCurrVerse(0)
    setVerses([])

    fetch(`https://bible-api.com/data/${currTranslation}/${value}`)
      .then(response => response.json())
      .then(data => {
        setChapters(data.chapters || [])
      })
      .catch(error => console.error('Failed to load chapters:', error))
  }

  function handleChapterChange(e) {
    const value = e.target.value
    setCurrChapter(value)
    setCurrVerse(0)

    fetch(`https://bible-api.com/data/${currTranslation}/${currBook}/${value}`)
      .then(response => response.json())
      .then(data => {
        setVerses(data.verses || [])
      })
      .catch(error => console.error('Failed to load verses:', error))
  }

  function handleVerseChange(e) {
    setCurrVerse(Number(e.target.value))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!currTranslation || !currBook || !currChapter || !currVerse) {
      console.error('Please select a translation, book, chapter, and verse before submitting.')
      return
    }

    fetch(`https://bible-api.com/data/${currTranslation}/${currBook}/${currChapter}`)
      .then(response => response.json())
      .then(data => {
        console.log('Verses:', data.verses)
        console.log('Verse:', data.verses[currVerse])

        setVerseResult(data.verses[currVerse - 1].text || 'No verse found.')
      })
      .catch(error => console.error('Failed to load verse:', error))
  }

  return <>
    <form id="verse-controls" onSubmit={handleSubmit}>
      <label htmlFor="translation">Translation</label>
      <select id="translation" value={currTranslation} onChange={handleTranslationChange}>
        <option value="">Select translation</option>
        {translations.map(item => (
          <option value={item.identifier} key={item.identifier}>
              {item.name}
            </option>
          ))}
      </select>

      <label htmlFor="book">Book</label>
      <select id="book" value={currBook} onChange={handleBookChange} disabled={!books.length}>
        <option value="">Select book</option>
        {books.map(item => (
          <option value={item.id} key={item.id}>
            {item.name}
          </option>
        ))}
      </select>
    
      <label htmlFor="chapter">Chapter</label>
      <select id="chapter" value={currChapter} onChange={handleChapterChange} disabled={!chapters.length}>
        <option value="">Select chapter</option>
        {chapters.map(item => (
          <option value={Number(item.chapter)} key={item.chapter}>
            {item.chapter}
          </option>
        ))}
      </select>

      <label htmlFor="verse">Verse</label>
      <select id="verse" value={currVerse} onChange={handleVerseChange} disabled={!verses.length}>
        <option value="">Select verse</option>
        {verses.map(item => (
          <option value={Number(item.verse)} key={item.verse}>
            {item.verse}
          </option>
        ))}
      </select>

      <button type="submit" disabled={!currTranslation || !currBook || !currChapter || !currVerse} onClick={handleSubmit}>Submit</button>
    </form>
    <p>{verseResult}</p>
  </>
}

export default App

