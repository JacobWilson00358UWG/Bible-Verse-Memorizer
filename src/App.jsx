import { useState, useEffect, useRef } from 'react'
import './App.css'
import VerseControls from './VerseControls'
import VerseBlank from './VerseBlank'

function App() {
  const blankRefs = useRef([])

  const [verseFormatted, setVerseFormatted] = useState([])

  /**
   * Recieves the raw and formatted versions of the selected verse from the VerseControls component.
   * 
   * @param {*} raw 
   * @param {*} formatted 
   */
  function handleVerseSelected(raw, numWordsMissing) {
    setVerseFormatted(formatAsBlankedVerse(raw, numWordsMissing))
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

    if (allCorrect) {
      alert('All answers are correct!')
    }
  }

  /**
   * Returns a list of objects representing the verse, with a specified number of words replaced by blanks.
   * Each object describes whether the word is blanked and the word itself.
   * 
   * @param {string} verse - The verse to format and blank.
   * @param {number} numWordsMissing - The number of words to replace with blanks.
   * @returns {Array} - A list of objects representing the formatted and blanked verse.
   */
  function formatAsBlankedVerse(verse, numWordsMissing) {
    let result = []

    let verseWordsBuffer = verse.split(' ')
    let numWordsMissingActual = Math.min(numWordsMissing, verseWordsBuffer.length)

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

  return <>
    <VerseControls onVersesSelected={handleVerseSelected} />
    <form id="verse-entry" onSubmit={handleVerseSubmitted}>
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
      {verseFormatted.some(el => el.isBlanked) && (
        <button id="submit-verses" type="submit">Check</button>
      )}
    </form>
  </>
}

export default App