import { useState } from 'react';
import { api } from '../api/client';
import type { AuthResponse } from '../api/types';

interface AuthPageProps {
  onAuth: (auth: AuthResponse) => void;
}

const PURPLE = '#5b4fc7';
const PURPLE_DEEP = '#3f33a8';
const SAGE = '#c7d4b8';
const SAGE_DEEP = '#a9bb96';
const PAPER = '#f4f3ee';

const inputStyle: React.CSSProperties = {
  padding: '12px 14px',
  borderRadius: 12,
  border: '1px solid rgba(91,79,199,0.18)',
  background: PAPER,
  color: PURPLE_DEEP,
  fontSize: 14,
  fontFamily: 'inherit',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
};

const fieldLabelStyle: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: PURPLE,
  opacity: 0.7,
  fontWeight: 500,
};

export function AuthPage({ onAuth }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'pending'>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        const auth = await api.login(email, password);
        onAuth(auth);
      } else {
        await api.register(email, name, password);
        setMode('pending');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex' }}>
      <div style={{
        maxWidth: 1100,
        width: '100%',
        margin: '0 auto',
        height: '100vh',
        display: 'flex',
        position: 'relative',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
      }}>
        {/* Wordmark */}
        <div style={{
          position: 'absolute', top: 22, left: 36,
          display: 'flex', alignItems: 'center', gap: 1,
          color: PURPLE,
          fontFamily: "'Rubik Mono One', monospace",
          fontSize: 18, letterSpacing: '-0.02em',
        }}>
          <span style={{ opacity: 0.6 }}>{'{'}</span>
          <span style={{ padding: '0 4px' }}>randall</span>
          <span style={{ opacity: 0.6 }}>{'}'}</span>
        </div>

        {/* Left editorial column */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 80px',
        }}>
          <div style={{
            fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
            color: PURPLE, opacity: 0.7, marginBottom: 14, fontWeight: 500,
          }}>
            The Hague HQ · Sign in
          </div>

          <h1 style={{
            margin: 0,
            fontFamily: "'Rubik Mono One', monospace",
            fontSize: 54, fontWeight: 400,
            letterSpacing: '-0.02em', lineHeight: 0.95,
            color: PURPLE, maxWidth: 520,
          }}>
            Find your <span style={{ color: SAGE_DEEP }}>desk.</span>
          </h1>

          <p style={{
            margin: '14px 0 0', maxWidth: 480,
            fontSize: 14, lineHeight: 1.55,
            color: PURPLE, opacity: 0.85,
          }}>
            Reserve a desk for today or up to two weeks ahead. Sign in with your Randall email.
          </p>
        </div>

        {/* Right card column */}
        <div style={{
          width: 430,
          display: 'flex',
          alignItems: 'center',
          padding: '0 60px 0 0',
        }}>
          {mode === 'pending' ? (
            <div style={{
              width: '100%', background: PAPER, borderRadius: 18, padding: 28,
              border: '1px solid rgba(91,79,199,0.10)',
            }}>
              <div style={{
                fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
                color: PURPLE, opacity: 0.7, marginBottom: 16, fontWeight: 500,
              }}>
                Account pending
              </div>
              <div style={{
                fontFamily: "'Rubik Mono One', monospace",
                fontSize: 32, color: PURPLE, lineHeight: 0.95,
                letterSpacing: '-0.02em', marginBottom: 12,
              }}>
                Almost there.
              </div>
              <p style={{ fontSize: 13, color: PURPLE, opacity: 0.75, lineHeight: 1.5, margin: '0 0 22px' }}>
                Your account has been created. An administrator will review and approve it shortly.
              </p>
              <button
                onClick={() => { setMode('login'); setError(''); }}
                style={{
                  background: 'none', border: 'none', padding: 0,
                  fontSize: 13, color: PURPLE, opacity: 0.7, cursor: 'pointer',
                  fontFamily: 'inherit', textDecoration: 'underline',
                }}
              >
                Back to sign in
              </button>
            </div>
          ) : (
            <div style={{
              width: '100%', background: PAPER, borderRadius: 18, padding: 28,
              border: '1px solid rgba(91,79,199,0.10)',
            }}>
              {/* Tab switcher */}
              <div style={{
                display: 'flex', gap: 6, marginBottom: 22,
                background: 'rgba(91,79,199,0.06)', padding: 4, borderRadius: 99,
              }}>
                {(['login', 'register'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => { setMode(m); setError(''); }}
                    style={{
                      flex: 1, padding: '8px 10px', borderRadius: 99, border: 'none',
                      background: mode === m ? PAPER : 'transparent',
                      color: mode === m ? PURPLE_DEEP : PURPLE,
                      fontWeight: 500, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                      boxShadow: mode === m ? '0 2px 6px -2px rgba(91,79,199,0.18)' : 'none',
                    }}
                  >
                    {m === 'login' ? 'Sign in' : 'Register'}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={fieldLabelStyle}>Email</span>
                  <input
                    type="email"
                    required
                    placeholder="you@randall.local"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={inputStyle}
                  />
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={fieldLabelStyle}>Password</span>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={inputStyle}
                  />
                </label>

                {mode === 'register' && (
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={fieldLabelStyle}>Full name</span>
                    <input
                      type="text"
                      required
                      placeholder="Jane Smith"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={inputStyle}
                    />
                  </label>
                )}

                {error && (
                  <div style={{
                    fontSize: 13, color: '#c0392b',
                    background: 'rgba(192,57,43,0.08)',
                    borderRadius: 8, padding: '10px 14px',
                  }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '13px 16px', borderRadius: 99, marginTop: 6,
                    background: SAGE, border: `1px solid ${SAGE_DEEP}`,
                    color: PURPLE_DEEP, fontSize: 13, fontWeight: 500,
                    cursor: loading ? 'default' : 'pointer', fontFamily: 'inherit',
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  {loading ? '…' : mode === 'login' ? 'Sign in →' : 'Create account →'}
                </button>
              </form>

              <div style={{
                textAlign: 'center', fontSize: 12, color: PURPLE,
                opacity: 0.7, marginTop: 16,
              }}>
                {mode === 'login' ? (
                  <>No account?{' '}
                    <span
                      onClick={() => { setMode('register'); setError(''); }}
                      style={{ color: PURPLE, cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Register
                    </span>
                  </>
                ) : (
                  <>Have one?{' '}
                    <span
                      onClick={() => { setMode('login'); setError(''); }}
                      style={{ color: PURPLE, cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Sign in
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
