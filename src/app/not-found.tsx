import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#f7f7ed',
      color: '#000000',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <div>
        <h1 style={{ fontSize: '4rem', marginBottom: '1rem', color: '#df2538' }}>404</h1>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>העמוד לא נמצא</h2>
        <p style={{ marginBottom: '2rem', color: '#666' }}>
          הדף שחיפשת אינו קיים או הוסר.
        </p>
        <Link href="/" style={{
          display: 'inline-block',
          padding: '0.75rem 1.5rem',
          backgroundColor: '#df2538',
          color: '#ffffff',
          textDecoration: 'none',
          borderRadius: '0.5rem',
          fontWeight: '500'
        }}>
          חזרה לדף הבית
        </Link>
      </div>
    </div>
  )
}
