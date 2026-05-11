import { useState, useEffect, useCallback, useRef } from 'react'
import Board from './Board'
import { INIT, applyMove, gameStatus, inCheck } from '../chess/engine'
import { getBestMove } from '../chess/ai'
import { api } from '../api/client'
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
  const [state, setState]     = useState(INIT)
  const [status, setStatus]   = useState({ over: false })
  const [thinking, setThink]  = useState(false)
  const [recorded, setRec]    = useState(false)
  const timer = useRef(null)

  useEffect(() => {
    if (state.white || status.over) return
    setThink(true)
    timer.current = setTimeout(() => {
      const mv = getBestMove(state, 3)
      if (mv) {
        const next = applyMove(state, mv)
        setState(next)
        setStatus(gameStatus(next))
      }
      setThink(false)
    }, 60)
    return () => clearTimeout(timer.current)
  }, [state.white, status.over]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!status.over || recorded) return
    const token = localStorage.getItem('chess_token')
    if (!token) return
    const result = status.draw ? 'draw' : status.winner === 'white' ? 'win' : 'loss'
    api.recordResult(token, result).catch(console.error)
    setRec(true)
  }, [status.over, recorded])

  const handleMove = useCallback(mv => {
    if (!state.white || thinking || status.over) return
    const next = applyMove(state, mv)
    setState(next)
    setStatus(gameStatus(next))
  }, [state, thinking, status.over])

  function reset() {
    clearTimeout(timer.current)
    setState(INIT)
    setStatus({ over: false })
    setThink(false)
    setRec(false)
  }

  const checked = !status.over && inCheck(state.board, state.white)
  const turn = state.white ? 'White' : 'Black'

  let statusText = thinking ? 'AI is thinking…' : `${turn}'s turn`
  if (!thinking && checked) statusText = `${turn} is in check!`
  if (status.over && status.draw)  statusText = 'Stalemate — Draw!'
  if (status.over && !status.draw) statusText =
    `Checkmate — ${status.winner === 'white' ? 'You win! 🏆' : 'AI wins!'}`

  const sbCls = `sbar${
    status.over && !status.draw
      ? status.winner === 'white' ? ' won' : ' lost'
      : status.over ? ' draw'
      : checked    ? ' chk'
      : thinking   ? ' think'
      : ''
  }`

  const pairs = []
  for (let i = 0; i < state.moves.length; i += 2)
    pairs.push({ w: state.moves[i], b: state.moves[i + 1] })

  return (
    <div className="gpage">
      <header className="ghdr">
        <button className="bbk" onClick={onBack}>&#8592; Dashboard</button>
        <span className="logo">&#9820; Chess Arena</span>
        <span className="uchip">{user.username}</span>
      </header>

      <main className="gmain">
        <div className="bcol">
          <div className="ptag black-pt">
            <span>&#9820; AI Opponent</span>
            {thinking && (
              <span className="dots"><span/><span/><span/></span>
            )}
          </div>

          <div className={sbCls}>{statusText}</div>

          <Board
            state={state}
            onMove={handleMove}
            disabled={status.over || thinking || !state.white}
          />

          <div className="ptag white-pt">
            <span>&#9816; {user.username} (You — White)</span>
          </div>

          {!status.over && (
            <button className="bng secondary" onClick={reset}>Resign</button>
          )}
        </div>

        <aside className="gaside">
          {status.over && (
            <div className={`rcard ${
              status.draw ? 'draw' : status.winner === 'white' ? 'win' : 'loss'
            }`}>
              <div className="rico">
                {status.draw ? '🤝' : status.winner === 'white' ? '🏆' : '🤖'}
              </div>
              <h3>{
                status.draw ? 'Draw!' :
                status.winner === 'white' ? 'You Win!' : 'AI Wins!'
              }</h3>
              <p>{status.draw ? 'Stalemate' : 'Checkmate'} &mdash; result saved.</p>
              <button className="bng" onClick={reset}>Play Again</button>
              <button className="bng secondary" onClick={onBack}>Dashboard</button>
            </div>
          )}

          <div className="acard">
            <h3>
              Move History
              <span className="mcnt">{state.moves.length} moves</span>
            </h3>
            <div className="mlist" id="mlist">
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

          <div className="acard">
            <h3>AI Info</h3>
            <div className="ai-info">
              <div className="ai-row"><span>Algorithm</span><strong>Minimax</strong></div>
              <div className="ai-row"><span>Depth</span><strong>3 plies</strong></div>
              <div className="ai-row"><span>Pruning</span><strong>Alpha-Beta</strong></div>
              <div className="ai-row"><span>Evaluation</span><strong>PST + material</strong></div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}
