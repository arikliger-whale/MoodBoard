// Custom error page for Pages Router (fallback when App Router pages fail)
// This overrides Next.js's default _error page which incorrectly uses <Html>

function Error({ statusCode }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'system-ui, sans-serif',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <div>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          {statusCode || 'Error'}
        </h1>
        <p>
          {statusCode
            ? `An error ${statusCode} occurred on server`
            : 'An error occurred on client'}
        </p>
      </div>
    </div>
  )
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error
