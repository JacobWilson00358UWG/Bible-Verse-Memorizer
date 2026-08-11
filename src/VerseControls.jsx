import { useState, useEffect } from 'react'
import './VerseControls.css'

/**
 * Component for selecting a Bible verse and specifying the number of words to be replaced by blanks.
 * Fetches available translations, books, chapters, and verses from the Bible API.
 * Allows the user to select a translation, book, chapter, and verse, and specify how many words should be blanked.
 * Calls the onVerseSelected callback with the raw and formatted versions of the selected verse to propogate the data to the parent component.
 */
function VerseControls({onVerseSelected}) {
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

    useEffect(() => {
        fetch('https://bible-api.com/data')
            .then(response => response.json())
            .then(data => setTranslations(data.translations || []) )
            .catch(error => console.error('Failed to load translations:', error))
        }, []
    )

//  <Event Handlers>

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
            .then(data => setBooks(data.books || []) )
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
            .then(data => setChapters(data.chapters || []) )
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
        .then(data => setVerses(data.verses || []) )
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
        if (currTranslation && currBook && currChapter && currVerse) {
            fetch(`https://bible-api.com/data/${currTranslation}/${currBook}/${currChapter}`)
                .then(response => response.json())
                .then(data => {
                    //"currVerse - 1" because the list is 0-indexed but verse selection is 1-indexed
                    let verseText = data.verses[currVerse - 1]?.text || 'No verse found.'
                    setVerseRaw(verseText)
                    onVerseSelected?.(verseText, numWordsMissing)
                })
                .catch(error => console.error('Failed to load verse:', error))
        } else {
            alert('Please select a translation, book, chapter, and verse before submitting.')
        }
    }

    /**
     * Handles the change of the number of words to be replaced by blanks in the verse.
     */
    function handleNumWordsMissingChange(e) {
        setNumWordsMissing(Number(e.target.value))
    }

//  </Event Handlers>
    
    /**
     * Exposes the unformatted verse for the parent component via a ref.
     * 
     * @returns the unformatted verse
     */
    function getVerseRaw() {
        return verseRaw
    }

    return (
        <form id="verse-controls" onSubmit={handleVerseSelected}>
            <label htmlFor="translation">Translation</label>
            <select id="translation" value={currTranslation} onChange={handleTranslationChange}>
                <option value="">Select translation</option>
                {translations.map(item => (
                    <option value={item.identifier} key={item.identifier}>{item.name}</option>
                ))}
            </select>

            <label htmlFor="book">Book</label>
            <select id="book" value={currBook} onChange={handleBookChange} disabled={!books.length}>
                <option value="">Select book</option>
                {books.map(item => (
                    <option value={item.id} key={item.id}>{item.name}</option>
                ))}
            </select>

            <label htmlFor="chapter">Chapter</label>
            <select id="chapter" value={currChapter} onChange={handleChapterChange} disabled={!chapters.length}>
                <option value="">Select chapter</option>
                {chapters.map(item => (
                    <option value={Number(item.chapter)} key={item.chapter}>{item.chapter}</option>
                ))}
            </select>

            <label htmlFor="verse">Verse</label>
            <select id="verse" value={currVerse} onChange={handleVerseChange} disabled={!verses.length}>
                <option value="">Select verse</option>
                {verses.map(item => (
                    <option value={Number(item.verse)} key={item.verse}>{item.verse}</option>
                ))}
            </select>

            <label htmlFor="numWordsMissing">Number of Words Missing</label>
            <input type="number" id="numWordsMissing" value={numWordsMissing} onChange={handleNumWordsMissingChange} min="0" />

            <button type="submit" disabled={!currTranslation || !currBook || !currChapter || !currVerse}>Submit</button>
        </form>
    );
}

export default VerseControls;