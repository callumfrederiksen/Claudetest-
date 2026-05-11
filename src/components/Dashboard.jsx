import { useState, useEffect } from 'react'
import { api } from '../api/client'
import './Dashboard.css'

export default function Dashboard({ user, onLogout }) {
  const [leaderboard, setLeaderboard] = useState([])
  const [myStats, setMyStats] = useState(null)

  useEffect(() => {
    api.leaderboard().then(setLeaderboard).catch(console.error)
    const token = localStorage.getItem('chess_token')
    if (token) api.myStats(token).then(setMyStats).catch(console.error)
  }, [])

  return (
    <div className="dashboard">
      <header className="dash-header">
        <span className="logo">&#9820; Chess Arena</span>
        <div className="header-right">
          <span className="welcome">Welcome, <strong>{user.username}</strong></span>
          <button className="btn-logout" onClick={onLogout}>Sign Out</button>
        </div>
      </header>

      <main className="dash-main">
        <section className="coming-soon-card">
          <div className="board-preview">
            {['&#9820;','&#9822;','&#9821;','&#9819;','&#9818;','&#9821;','&#9822;','&#9820;'].map((p, i) => (
              <span key={i} dangerouslySetInnerHTML={{ __html: p }} />
            ))}
          </div>
          <h2>Chess Game</h2>
          <p>The interactive board with minimax AI is coming in the next step. Your account and stats are live.</p>
          <span className="badge-soon">Step 2 — In Progress</span>
        </section>

        <div className="stats-grid">
          <section className="stats-card">
            <h3>Your Stats</h3>
            {myStats ? (
              <ul className="stat-list">
                <li><span>Wins</span>    <strong className="green">{myStats.wins}</strong></li>
                <li><span>Losses</span>  <strong className="red">{myStats.losses}</strong></li>
                <li><span>Draws</span>   <strong className="gray">{myStats.draws}</strong></li>
                <li><span>Games</span>   <strong>{myStats.games_played}</strong></li>
                <li><span>Best Streak</span><strong className="gold">{myStats.best_streak}</strong></li>
              </ul>
            ) : (
              <p className="empty">No games played yet.</p>
            )}
          </section>

          <section className="leaderboard-card">
            <h3>Top Players</h3>
            {leaderboard.length === 0 ? (
              <p className="empty">No players yet — be the first!</p>
            ) : (
              <table className="lb-table">
                <thead>
                  <tr><th>#</th><th>Player</th><th>W</th><th>L</th><th>D</th><th>Games</th></tr>
                </thead>
                <tbody>
                  {leaderboard.map((row, i) => (
                    <tr key={row.username} className={row.username === user.username ? 'highlight' : ''}>
                      <td className="rank">
                        {i === 0 ? '&#127945;' : i === 1 ? '&#127944;' : i === 2 ? '&#127943;' : i + 1}
                      </td>
                      <td>{row.username}</td>
                      <td className="green">{row.wins}</td>
                      <td className="red">{row.losses}</td>
                      <td className="gray">{row.draws}</td>
                      <td>{row.games_played}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
