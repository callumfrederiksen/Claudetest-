export const INITIAL_BOARD = [
  ['r','n','b','q','k','b','n','r'],
  ['p','p','p','p','p','p','p','p'],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  ['P','P','P','P','P','P','P','P'],
  ['R','N','B','Q','K','B','N','R'],
]

export const isWhite = p => Boolean(p && p === p.toUpperCase())
export const isBlack = p => Boolean(p && p === p.toLowerCase())

const enemy  = (p, w) => w ? isBlack(p) : isWhite(p)
const friend = (p, w) => w ? isWhite(p) : isBlack(p)
const ok     = (r, c) => r >= 0 && r <= 7 && c >= 0 && c <= 7

function rawMoves(board, row, col, state) {
  const piece = board[row][col]
  if (!piece) return []
  const w = isWhite(piece)
  const t = piece.toUpperCase()
  const acc = []

  const hop = (dr, dc) => {
    const r = row + dr, c = col + dc
    if (ok(r, c) && !friend(board[r][c], w))
      acc.push({ from: [row, col], to: [r, c] })
  }

  const slide = (dr, dc) => {
    let r = row + dr, c = col + dc
    while (ok(r, c)) {
      if (friend(board[r][c], w)) break
      acc.push({ from: [row, col], to: [r, c] })
      if (board[r][c]) break
      r += dr; c += dc
    }
  }

  if (t === 'P') {
    const dir = w ? -1 : 1
    const start = w ? 6 : 1
    const nr = row + dir
    if (ok(nr, col) && !board[nr][col]) {
      acc.push({ from: [row, col], to: [nr, col] })
      if (row === start && !board[row + 2 * dir][col])
        acc.push({ from: [row, col], to: [row + 2 * dir, col], epTarget: [nr, col] })
    }
    for (const dc of [-1, 1]) {
      const tc = col + dc
      if (!ok(nr, tc)) continue
      if (enemy(board[nr][tc], w))
        acc.push({ from: [row, col], to: [nr, tc] })
      else if (state.ep && state.ep[0] === nr && state.ep[1] === tc)
        acc.push({ from: [row, col], to: [nr, tc], ep: true })
    }
  } else if (t === 'N') {
    for (const [dr, dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]])
      hop(dr, dc)
  } else if (t === 'B') {
    for (const [dr, dc] of [[-1,-1],[-1,1],[1,-1],[1,1]]) slide(dr, dc)
  } else if (t === 'R') {
    for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) slide(dr, dc)
  } else if (t === 'Q') {
    for (const [dr, dc] of [[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]]) slide(dr, dc)
  } else if (t === 'K') {
    for (const [dr, dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]) hop(dr, dc)
    const cr = w ? 7 : 0
    if (row === cr && col === 4) {
      const cs = state.castle || {}
      if ((w ? cs.K : cs.k) && !board[cr][5] && !board[cr][6])
        acc.push({ from: [row, col], to: [cr, 6], castle: w ? 'K' : 'k' })
      if ((w ? cs.Q : cs.q) && !board[cr][3] && !board[cr][2] && !board[cr][1])
        acc.push({ from: [row, col], to: [cr, 2], castle: w ? 'Q' : 'q' })
    }
  }
  return acc
}

function applyBoard(board, move) {
  const b = board.map(r => [...r])
  const [fr, fc] = move.from
  const [tr, tc] = move.to
  const piece = b[fr][fc]
  b[tr][tc] = piece
  b[fr][fc] = null
  if (move.ep) b[isWhite(piece) ? tr + 1 : tr - 1][tc] = null
  if (move.castle === 'K') { b[7][5] = 'R'; b[7][7] = null }
  if (move.castle === 'Q') { b[7][3] = 'R'; b[7][0] = null }
  if (move.castle === 'k') { b[0][5] = 'r'; b[0][7] = null }
  if (move.castle === 'q') { b[0][3] = 'r'; b[0][0] = null }
  if (piece === 'P' && tr === 0) b[tr][tc] = 'Q'
  if (piece === 'p' && tr === 7) b[tr][tc] = 'q'
  return b
}

export function inCheck(board, white) {
  const king = white ? 'K' : 'k'
  let kr = -1, kc = -1
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (board[r][c] === king) { kr = r; kc = c }
  if (kr < 0) return true
  const s0 = { ep: null, castle: {} }
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const p = board[r][c]
      if (!p || (white ? isWhite(p) : isBlack(p))) continue
      if (rawMoves(board, r, c, s0).some(m => m.to[0] === kr && m.to[1] === kc)) return true
    }
  return false
}

export function legalMoves(board, row, col, state) {
  const piece = board[row][col]
  if (!piece) return []
  const w = isWhite(piece)
  return rawMoves(board, row, col, state).filter(mv => {
    if (mv.castle) {
      if (inCheck(board, w)) return false
      const passCol = (mv.castle === 'K' || mv.castle === 'k') ? 5 : 3
      const pb = board.map(r => [...r])
      pb[mv.from[0]][passCol] = board[mv.from[0]][4]
      pb[mv.from[0]][4] = null
      if (inCheck(pb, w)) return false
    }
    return !inCheck(applyBoard(board, mv), w)
  })
}

export function allLegalMoves(board, state, white) {
  const moves = []
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const p = board[r][c]
      if (!p || isWhite(p) !== white) continue
      moves.push(...legalMoves(board, r, c, state))
    }
  return moves
}

export function applyMove(state, move) {
  const board = applyBoard(state.board, move)
  const piece = state.board[move.from[0]][move.from[1]]
  const [fr, fc] = move.from
  const [tr, tc] = move.to
  const castle = { ...state.castle }
  if (piece === 'K') { castle.K = false; castle.Q = false }
  if (piece === 'k') { castle.k = false; castle.q = false }
  if ((fr === 7 && fc === 0) || (tr === 7 && tc === 0)) castle.Q = false
  if ((fr === 7 && fc === 7) || (tr === 7 && tc === 7)) castle.K = false
  if ((fr === 0 && fc === 0) || (tr === 0 && tc === 0)) castle.q = false
  if ((fr === 0 && fc === 7) || (tr === 0 && tc === 7)) castle.k = false
  return {
    board,
    white: !isWhite(piece),
    ep: move.epTarget || null,
    castle,
    moves: [...state.moves, { ...move, piece }],
  }
}

export function gameStatus(state) {
  const { board, white, ep, castle } = state
  if (allLegalMoves(board, { ep, castle }, white).length > 0) return { over: false }
  return { over: true, draw: !inCheck(board, white), winner: white ? 'black' : 'white' }
}

export const INIT = {
  board: INITIAL_BOARD.map(r => [...r]),
  white: true,
  ep: null,
  castle: { K: true, Q: true, k: true, q: true },
  moves: [],
}
