import { useState, useEffect, useRef } from 'react'
import './App.css'
import VerseBlank from './VerseBlank'

function App() {
  const [translations, setTranslations] = useState([])
  const [books, setBooks] = useState([])
  const [chapters, setChapters] = useState([])
  const [verses, setVerses] = useState([])
  const [currTranslation, setCurrTranslation] = useState('')
  const [currBook, setCurrBook] = useState('')
  const [currChapter, setCurrChapter] = useState(0)
  const [currVerse, setCurrVerse] = useState(0)
  
  const [numWordsMissing, setNumWordsMissing] = useState(0)
  const [verseRaw, setVerseRaw] = useState('')
  const [verseFormatted, setVerseFormatted] = useState([])
  const blankRefs = useRef([])
  
  
  useEffect(() => {
    fetch('https://bible-api.com/data')
      .then(response => response.json())
      .then(data => {
        setTranslations(data.translations || [])
      })
      .catch(error => console.error('Failed to load translations:', error))
  }, [])

  /**
   * Handles the change of translation selection.
   * Resets the current book, chapter, and verse, and fetches the books for the selected translation.
   */
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

  /**
   * Handles the change of book selection.
   * Resets the current chapter and verse, and fetches the chapters for the selected book. 
   */
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

  /**
   * Handles the change of chapter selection.
   * Resets the current verse and fetches the verses for the selected chapter.
   */
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

  /**
   * Handles the change of the verse selection.
   */
  function handleVerseChange(e) {
    setCurrVerse(Number(e.target.value))
  }

  /**
   * Fetches the selected verse and generates a version of the verse with a specified number of words replaced by blanks.
   */
  function handleVerseSelected(e) {
    e.preventDefault()
    if (!currTranslation || !currBook || !currChapter || !currVerse) {
      console.error('Please select a translation, book, chapter, and verse before submitting.')
      return
    }

    fetch(`https://bible-api.com/data/${currTranslation}/${currBook}/${currChapter}`)
      .then(response => response.json())
      .then(data => {
        let verseText = data.verses[currVerse - 1]?.text || 'No verse found.'
        setVerseRaw(verseText)//"currVerse - 1" because the list is 0-indexed but verse selection is 1-indexed
        setVerseFormatted(formatAsBlankedVerse(verseText))
      })
      .catch(error => console.error('Failed to load verse:', error))
  }

  /**
   * Returns a list of objects representing the verse, with a specified number of words replaced by blanks.
   * Each object describes whether the word is blanked and the word itself.
   * 
   * @param {string} verse - The verse to format and blank.
   * @returns {Array} - A list of objects representing the formatted and blanked verse.
   */
  function formatAsBlankedVerse(verse) {
    let result = []
    
    let verseWordsBuffer = verse.split(' ')
    //Using "setNumWordsMissing" updates too late so we use a local value instead
    let numWordsMissingActual = Math.min(numWordsMissing, verseWordsBuffer.length)
    setNumWordsMissing(numWordsMissingActual)

    verseWordsBuffer.forEach(word => {
      result.push({
        isBlanked: false,
        verse: word
      })
    });
    
    for (let i = 0; i < numWordsMissingActual; i++) {
      //Select a random index that has not already been blanked
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * result.length)
      } while (result[randomIndex].isBlanked)
      result[randomIndex].isBlanked = true;
    }
    console.log('Formatted and blanked verse:', result)

    return result
  }

  /**
   * Checks if all VerseBlank components have the correct answer entered.
   * Uses the isCorrect method of each VerseBlank component to determine correctness.
   */
  function handleVerseSubmitted(e) {
    e.preventDefault()

    let allCorrect = true;
    for (const ref of blankRefs.current.filter(ref => ref)) {
      if (typeof ref.isCorrect === 'function') {
        allCorrect &= ref.isCorrect()
      }
    }

    console.log('All VerseBlanks correct:', allCorrect)
  }

  function handleNumWordsMissingChange(e) {
    setNumWordsMissing(Number(e.target.value))
  }

  return <>
    <form id="verse-controls" onSubmit={handleVerseSelected}>
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

      <label htmlFor="numWordsMissing">Number of Words Missing</label>
      <input type="number" id="numWordsMissing" value={numWordsMissing} onChange={handleNumWordsMissingChange} min="0" />

      <button type="submit" disabled={!currTranslation || !currBook || !currChapter || !currVerse}>Submit</button>
    </form>
    <form id="verse-entry" onSubmit={handleVerseSubmitted}>
      <p>{verseRaw}</p>
      <hr style={{ margin: '10px 0' }} />
      {
        verseFormatted.map((element, index) => {
          if (element.isBlanked) {
            return (
              <>
                <VerseBlank key={index} answer={element.verse}
                  ref={node => {
                    blankRefs.current[index] = node
                  }}
                />
                {" "}
              </>
            )
          }

          return (
            <span key={index}>
              {element.verse + " "}
            </span>
          )
        })
      }
      <button type="submit">Submit Verse</button>
    </form>
  </>
}

export default App
