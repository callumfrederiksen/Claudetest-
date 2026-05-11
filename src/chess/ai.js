import { allLegalMoves, applyMove, gameStatus, isWhite } from './engine'

const VALUES = { P: 100, N: 320, B: 330, R: 500, Q: 900, K: 20000 }

const PST = {
  P: [
    [  0,  0,  0,  0,  0,  0,  0,  0],
    [ 50, 50, 50, 50, 50, 50, 50, 50],
    [ 10, 10, 20, 30, 30, 20, 10, 10],
    [  5,  5, 10, 25, 25, 10,  5,  5],
    [  0,  0,  0, 20, 20,  0,  0,  0],
    [  5, -5,-10,  0,  0,-10, -5,  5],
    [  5, 10, 10,-20,-20, 10, 10,  5],
    [  0,  0,  0,  0,  0,  0,  0,  0],
  ],
  N: [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50],
  ],
  B: [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20],
  ],
  R: [
    [  0,  0,  0,  5,  5,  0,  0,  0],
    [ -5,  0,  0,  0,  0,  0,  0, -5],
    [ -5,  0,  0,  0,  0,  0,  0, -5],
    [ -5,  0,  0,  0,  0,  0,  0, -5],
    [ -5,  0,  0,  0,  0,  0,  0, -5],
    [ -5,  0,  0,  0,  0,  0,  0, -5],
    [  5, 10, 10, 10, 10, 10, 10,  5],
    [  0,  0,  0,  5,  5,  0,  0,  0],
  ],
  Q: [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [ -5,  0,  5,  5,  5,  5,  0, -5],
    [  0,  0,  5,  5,  5,  5,  0, -5],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20],
  ],
  K: [
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [ 20, 20,  0,  0,  0,  0, 20, 20],
    [ 20, 30, 10,  0,  0, 10, 30, 20],
  ],
}

function evaluate(board) {
  let score = 0
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const p = board[r][c]
      if (!p) continue
      const w = isWhite(p)
      const t = p.toUpperCase()
      const pst = PST[t]
      const v = VALUES[t] + (pst ? pst[w ? r : 7 - r][c] : 0)
      score += w ? v : -v
    }
  return score
}

function order(moves, board) {
  return [...moves].sort((a, b) => {
    const va = board[a.to[0]][a.to[1]] ? (VALUES[board[a.to[0]][a.to[1]].toUpperCase()] || 0) : 0
    const vb = board[b.to[0]][b.to[1]] ? (VALUES[board[b.to[0]][b.to[1]].toUpperCase()] || 0) : 0
    return vb - va
  })
}

function minimax(state, depth, alpha, beta) {
  const s = gameStatus(state)
  if (s.over) return s.draw ? 0 : s.winner === 'white' ? 100000 : -100000
  if (depth === 0) return evaluate(state.board)

  const moves = order(
    allLegalMoves(state.board, { ep: state.ep, castle: state.castle }, state.white),
    state.board
  )

  if (state.white) {
    let best = -Infinity
    for (const mv of moves) {
      best = Math.max(best, minimax(applyMove(state, mv), depth - 1, alpha, beta))
      alpha = Math.max(alpha, best)
      if (beta <= alpha) break
    }
    return best
  } else {
    let best = Infinity
    for (const mv of moves) {
      best = Math.min(best, minimax(applyMove(state, mv), depth - 1, alpha, beta))
      beta = Math.min(beta, best)
      if (beta <= alpha) break
    }
    return best
  }
}

export function getBestMove(state, depth = 3) {
  const moves = order(
    allLegalMoves(state.board, { ep: state.ep, castle: state.castle }, state.white),
    state.board
  )
  if (!moves.length) return null

  const max = state.white
  let best = moves[0]
  let bestScore = max ? -Infinity : Infinity

  for (const mv of moves) {
    const score = minimax(applyMove(state, mv), depth - 1, -Infinity, Infinity)
    if (max ? score > bestScore : score < bestScore) {
      bestScore = score
      best = mv
    }
  }
  return best
}
