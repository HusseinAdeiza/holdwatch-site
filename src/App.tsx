import { Nav } from './components/Nav'
import { Hero } from './components/Hero'
import { Proof } from './components/Proof'
import { Bento } from './components/Bento'
import { Walkthrough } from './components/Walkthrough'
import { Explorer } from './components/Explorer'
import { Cta } from './components/Cta'
import { Footer } from './components/Footer'

export default function App() {
  return (
    <>
      <a className="sr-only" href="#main">
        Skip to content
      </a>
      <Nav />
      <main id="main">
        <Hero />
        <Proof />
        <Bento />
        <Walkthrough />
        <Explorer />
        <Cta />
      </main>
      <Footer />
    </>
  )
}