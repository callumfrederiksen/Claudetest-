import { useState, useCallback } from 'react'
import Board from './Board'
import { INIT, applyMove, gameStatus, inCheck } from '../chess/engine'
import './Game.css'

const GLYPHS = {
  K:'♔', Q:'♕', R:'♖', B:'♗', N:'♘', P:'♙',
  k:'♚', q:'♛', r:'♜', b:'♝', n:'♞', p:'♟',
}
const FILES = 'abcdefgh'
const RANKS = '87654321'

function alg(mv) {
  const g = mv.piece ? GLYPHS[mv.piece] : ''
  return `${g}${FILES[mv.from[1]]}${RANKS[mv.from[0]]}–${FILES[mv.to[1]]}${RANKS[mv.to[0]]}`
}

export default function Game({ user, onBack }) {
  const [state, setState] = useState(INIT)
  const [status, setStatus] = useState({ over: false })

  const handleMove = useCallback(mv => {
    const next = applyMove(state, mv)
    setState(next)
    setStatus(gameStatus(next))
  }, [state])

  function reset() {
    setState(INIT)
    setStatus({ over: false })
  }

  const checked = !status.over && inCheck(state.board, state.white)
  const turn = state.white ? 'White' : 'Black'

  let statusText = `${turn}'s turn`
  if (checked) statusText = `${turn} is in check!`
  if (status.over && status.draw) statusText = 'Stalemate — Draw!'
  if (status.over && !status.draw)
    statusText = `Checkmate — ${status.winner === 'white' ? 'White' : 'Black'} wins!`

  const statusCls = `sbar${status.over ? ' over' : checked ? ' chk' : ''}`

  const whiteMoves = []
  const blackMoves = []
  state.moves.forEach((mv, i) => {
    if (i % 2 === 0) whiteMoves.push(mv)
    else blackMoves.push(mv)
  })
  const pairs = whiteMoves.map((wm, i) => ({ w: wm, b: blackMoves[i] }))

  return (
    <div className="gpage">
      <header className="ghdr">
        <button className="bbk" onClick={onBack}>&#8592; Dashboard</button>
        <span className="logo">&#9820; Chess Arena</span>
        <span className="uchip">{user.username}</span>
      </header>

      <main className="gmain">
        <div className="bcol">
          <div className={statusCls}>{statusText}</div>
          <Board state={state} onMove={handleMove} disabled={status.over} />
          <button className="bng" onClick={reset}>New Game</button>
        </div>

        <aside className="gaside">
          <div className="acard">
            <h3>Move History</h3>
            <div className="mlist">
              {pairs.length === 0
                ? <p className="empty">No moves yet</p>
                : <ol className="mpairs">
                    {pairs.map(({ w, b }, i) => (
                      <li key={i}>
                        <span className="wm">{alg(w)}</span>
                        {b && <span className="bm">{alg(b)}</span>}
                      </li>
                    ))}
                  </ol>
              }
            </div>
          </div>

          <div className="acard aicard">
            <h3>AI Opponent</h3>
            <p>Minimax AI is coming in Step 3. Playing two-player mode for now.</p>
            <div className="airow">
              <span className="aidot" />
              Two-player mode
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}
