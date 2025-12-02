"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getCurrentUserFromAPI, isAuthenticated, logout } from "@/lib/api"
import { LayoutDashboard, LogOut, Menu, User, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function Navbar() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userData, setUserData] = useState<{
    name: string
    role: string
    initials: string
  } | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated()) {
        setIsLoggedIn(true)
        try {
          const user = await getCurrentUserFromAPI()
          const name = user.username || user.id || "User"
          const initials = name
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
          
          setUserData({
            name,
            role: user.role_name || '',
            initials,
          })
        } catch (error) {
          console.error('Error fetching user data:', error)
          setIsLoggedIn(false)
        }
      }
    }

    checkAuth()
  }, [])

  const handleLogout = () => {
    logout()
    setIsLoggedIn(false)
    setUserData(null)
    router.push('/')
    router.refresh()
  }

  const isAlumni = userData?.role === 'Alumni'

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
            
            {isLoggedIn && userData ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-3 px-3 py-2 h-auto">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {userData.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{userData.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {!isAlumni && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="flex items-center cursor-pointer">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Dashboard Admin
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href={isAlumni ? "/profile-user" : "/profile"} className="flex items-center cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                asChild
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Link href="/login">Masuk</Link>
              </Button>
            )}
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
              
              {isLoggedIn && userData ? (
                <>
                  <div className="flex items-center gap-3 py-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {userData.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{userData.name}</span>
                  </div>
                  <div className="border-t border-border pt-2 space-y-2">
                    {!isAlumni && (
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard Admin
                      </Link>
                    )}
                    <Link
                      href={isAlumni ? "/profile-user" : "/profile"}
                      className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsOpen(false)
                      }}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <Button
                  asChild
                  className="bg-primary hover:bg-primary/90 text-primary-foreground w-fit"
                >
                  <Link href="/login">Masuk</Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
