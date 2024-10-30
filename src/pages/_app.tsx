import '@/styles/globals.css'
import 'core-js/stable'
import 'core-js/proposals/promise-with-resolvers'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
