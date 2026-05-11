import { useState } from 'react'
import { legalMoves, isWhite } from '../chess/engine'
import './Board.css'

const GLYPHS = {
  K:'♔', Q:'♕', R:'♖', B:'♗', N:'♘', P:'♙',
  k:'♚', q:'♛', r:'♜', b:'♝', n:'♞', p:'♟',
}
const FILES = ['a','b','c','d','e','f','g','h']
const RANKS = ['8','7','6','5','4','3','2','1']

export default function Board({ state, onMove, disabled = false }) {
  const [sel, setSel] = useState(null)
  const [hints, setHints] = useState([])

  const { board, white, ep, castle, moves } = state
  const s = { ep, castle }
  const last = moves.at(-1)

  function click(r, c) {
    if (disabled) return
    const piece = board[r][c]

    if (sel) {
      const mv = hints.find(m => m.to[0] === r && m.to[1] === c)
      if (mv) { setSel(null); setHints([]); onMove(mv); return }
    }

    if (piece && isWhite(piece) === white) {
      setSel([r, c])
      setHints(legalMoves(board, r, c, s))
    } else {
      setSel(null); setHints([])
    }
  }

  return (
    <div className="bwrap">
      <div className="brd">
        {[0,1,2,3,4,5,6,7].map(r => (
          <div key={r} className="brow">
            <span className="blbl">{RANKS[r]}</span>
            {[0,1,2,3,4,5,6,7].map(c => {
              const piece = board[r][c]
              const light = (r + c) % 2 === 0
              const isSel  = sel && sel[0] === r && sel[1] === c
              const isHint = hints.some(m => m.to[0] === r && m.to[1] === c)
              const isLast = last && (
                (last.from[0] === r && last.from[1] === c) ||
                (last.to[0]   === r && last.to[1]   === c)
              )
              return (
                <div
                  key={c}
                  className={`sq ${light?'lt':'dk'}${isSel?' sel':''}${isLast&&!isSel?' lst':''}`}
                  onClick={() => click(r, c)}
                >
                  {isHint && !piece && <div className="dot" />}
                  {isHint &&  piece && <div className="ring" />}
                  {piece && <span className="glyph">{GLYPHS[piece]}</span>}
                </div>
              )
            })}
          </div>
        ))}
        <div className="brow frow">
          <span className="blbl" />
          {[0,1,2,3,4,5,6,7].map(c => (
            <span key={c} className="blbl fc">{FILES[c]}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
