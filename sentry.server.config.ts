import * as Sentry from '@sentry/nuxt'

if (process.env.NODE_ENV !== 'development') {
  Sentry.init({
    dsn: 'https://4a7943aaa0da9bd9785cd5ba53d1aa1e@o55035.ingest.us.sentry.io/4510845122117632',
    tracesSampleRate: 0.1,
  })
}
