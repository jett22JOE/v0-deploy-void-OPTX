import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Jett Optics - Spatial Encryption for the Decentralized Future'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0f',
          backgroundImage: 'radial-gradient(circle at 25% 25%, #1a0a2e 0%, transparent 50%), radial-gradient(circle at 75% 75%, #0d1a2d 0%, transparent 50%)',
        }}
      >
        {/* Decorative elements */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px',
          }}
        >
          {/* Logo/Brand */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '30px',
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #b55200 0%, #ff8c00 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '20px',
                boxShadow: '0 0 40px rgba(181, 82, 0, 0.5)',
              }}
            >
              <span style={{ fontSize: '40px', color: 'white', fontWeight: 'bold' }}>J</span>
            </div>
            <span
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: 'white',
                letterSpacing: '0.1em',
              }}
            >
              JETT OPTICS
            </span>
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: '56px',
              fontWeight: 'bold',
              color: 'white',
              textAlign: 'center',
              marginBottom: '20px',
              lineHeight: 1.2,
            }}
          >
            Spatial Encryption
          </div>

          <div
            style={{
              fontSize: '32px',
              color: '#b55200',
              textAlign: 'center',
              marginBottom: '30px',
              fontStyle: 'italic',
            }}
          >
            for the Decentralized Future
          </div>

          {/* Keywords */}
          <div
            style={{
              display: 'flex',
              gap: '20px',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {['Gaze Authentication', 'Neuromorphic Security', 'DePIN', '$JTX'].map((keyword) => (
              <div
                key={keyword}
                style={{
                  padding: '10px 24px',
                  borderRadius: '9999px',
                  border: '1px solid rgba(181, 82, 0, 0.5)',
                  backgroundColor: 'rgba(181, 82, 0, 0.1)',
                  color: '#ff8c00',
                  fontSize: '20px',
                }}
              >
                {keyword}
              </div>
            ))}
          </div>
        </div>

        {/* URL */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            fontSize: '24px',
            color: 'rgba(255,255,255,0.5)',
            letterSpacing: '0.2em',
          }}
        >
          jettoptics.ai
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
