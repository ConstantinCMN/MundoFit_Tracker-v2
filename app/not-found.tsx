export default function NotFound() {
  return (
    <html lang="ro">
      <body
        style={{
          background: '#0a0a0a',
          color: '#f5f5f5',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          fontFamily: 'system-ui, sans-serif',
          margin: 0,
        }}
      >
        <h1 style={{ fontSize: '4rem', fontWeight: 700, color: '#aaff00', margin: 0 }}>
          404
        </h1>
        <p style={{ color: '#888', marginTop: '1rem' }}>Page not found</p>
        <a
          href="/"
          style={{
            marginTop: '2rem',
            padding: '12px 24px',
            background: '#aaff00',
            color: '#0a0a0a',
            borderRadius: '12px',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Go home
        </a>
      </body>
    </html>
  );
}
