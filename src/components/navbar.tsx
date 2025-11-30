"use client"

import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="#home" className="flex items-center gap-2">
            <Image
              src="/LogoITK.png"
              alt="Logo Institut Teknologi Kalimantan"
              width={40}
              height={40}
              className="object-contain"
            />
            <span className="font-semibold text-primary hidden sm:block">Tracer Study ITK</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#home" className="text-foreground hover:text-primary transition-colors">
              Beranda
            </Link>
            <Link href="#kuesioner" className="text-foreground hover:text-primary transition-colors">
              Kuesioner
            </Link>
            <Link href="#tentang" className="text-foreground hover:text-primary transition-colors">
              Tentang
            </Link>
            <Button
              asChild
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Link href="/login">Masuk</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              <Link
                href="#home"
                className="text-foreground hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Beranda
              </Link>
              <Link
                href="#kuesioner"
                className="text-foreground hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Kuesioner
              </Link>
              <Link
                href="#tentang"
                className="text-foreground hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Tentang
              </Link>
              <Button
                asChild
                className="bg-primary hover:bg-primary/90 text-primary-foreground w-fit"
              >
                <Link href="/login">Masuk</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
