import { forwardRef, useImperativeHandle, useState } from 'react'
import './VerseBlank.css'

const STATUS = Object.freeze({
    CORRECT: 'correct',
    INCORRECT: 'incorrect',
    UNANSWERED: 'unanswered'
});

const VerseBlank = forwardRef(({answer}, ref) => {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState(STATUS.UNANSWERED);
  const trimmedAnswer = (answer || '').replaceAll(/[.,!?;:“”"]+/g, '').trim();

  /**
   * Checks if the entered word matches the correct answer.
   * If it does, disables the input and colors it green; otherwise, colors it red.
   * 
   * @returns whether the entered word matches the correct answer.
   */
  function isCorrect() {
    const result = value === trimmedAnswer;
    setStatus(result ? STATUS.CORRECT : STATUS.INCORRECT);
    console.log(`Entered word: ${value}, Correct answer: ${trimmedAnswer}, Is correct: ${result}`);
    return result;
  }
  useImperativeHandle(ref, () => ({ isCorrect }));

  let denewlinedAnswer = (answer || '').replace(/\s+/g, ' ').trim();
  let punctuationAtStart = (denewlinedAnswer || '').match(/^[“”"]+/);
  let punctuationAtEnd = (denewlinedAnswer || '').match(/[.,!?;:“”"]+$/);

  return (
    <span className="verse-blank">
      {punctuationAtStart && (<span className="punctuation">{punctuationAtStart[0]}</span>)}
      <input type="text"
        disabled={status === STATUS.CORRECT} className={status}
        value={value} answer={trimmedAnswer}
        onChange={(e) => setValue(e.target.value)}
      />
      {punctuationAtEnd && (<span className="punctuation">{punctuationAtEnd[0]}</span>)}
    </span>
  )
})

export default VerseBlank;