'use client'

import { AboutSection } from "@/components/about-section"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/hero-section"
import { KuesionerSection } from "@/components/kuesioner-section"
import { Navbar } from "@/components/navbar"
import { isFlutterWebView } from "@/lib/mobile-helper"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Redirect mobile app users ke dashboard mobile atau login
    if (isFlutterWebView()) {
      // Check if user is logged in
      const token = localStorage.getItem('access_token')
      
      if (token) {
        // Decode token to get role
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          const role = payload.role
          
          if (role === 'Alumni') {
            router.replace('/dashboard-mobile') // Mobile dashboard for user
          } else {
            router.replace('/dashboard') // Admin dashboard
          }
        } catch (err) {
          router.replace('/login')
        }
      } else {
        router.replace('/login')
      }
    }
  }, [router])

  return (
    <main className="min-h-screen bg-background [&_*:not(input):not(textarea):not([contenteditable='true'])]:caret-transparent">
      <Navbar />
      <HeroSection />
      <KuesionerSection />
      <AboutSection />
      <Footer />
    </main>
  );
}
