"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getCurrentUserFromAPI, isAuthenticated, logout } from "@/lib/api";
import { LayoutDashboard, LogOut, Menu, User, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<{
    name: string;
    role: string;
    initials: string;
  } | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated()) {
        setIsLoggedIn(true);
        try {
          const user = await getCurrentUserFromAPI();

          const name = user.username || user.id || "User";
          const initials = name
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

          // Try different possible role fields
          const roleFromStorage = localStorage.getItem("user");
          let roleName = "";

          if (roleFromStorage) {
            try {
              const userData = JSON.parse(roleFromStorage);
              roleName = userData.role_name || "";
            } catch (e) {
              console.error("Error parsing stored user data:", e);
            }
          }

          // Fallback to API data
          if (!roleName) {
            roleName = user.role_name || user.role || "";
          }

          setUserData({
            name,
            role: roleName,
            initials,
          });
        } catch (error) {
          console.error("Error fetching user data:", error);
          setIsLoggedIn(false);
        }
      }
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    setUserData(null);
    router.push("/");
    router.refresh();
  };

  const isAlumni = userData?.role === "Alumni";

  return (
    <>
      {/* Backdrop overlay - outside navbar */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[45] md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="w-full mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link href="/#home" className="flex items-center gap-1.5 sm:gap-2">
            <Image
              src="/LogoITK.png"
              alt="Logo Institut Teknologi Kalimantan"
              width={32}
              height={32}
              className="object-contain sm:w-10 sm:h-10"
            />
            <span className="font-semibold text-primary text-sm sm:text-base hidden xs:block">
              Tracer Study ITK
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4 lg:gap-8">
            <Link
              href="/#home"
              className="text-sm lg:text-base text-foreground hover:text-primary transition-colors"
            >
              Beranda
            </Link>
            <Link
              href="/#kuesioner"
              className="text-sm lg:text-base text-foreground hover:text-primary transition-colors"
            >
              Kuesioner
            </Link>
            <Link
              href="/prediction"
              className="text-sm lg:text-base text-foreground hover:text-primary transition-colors"
            >
              Prediksi
            </Link>
            <Link
              href="/#tentang"
              className="text-sm lg:text-base text-foreground hover:text-primary transition-colors"
            >
              Tentang
            </Link>

            {isLoggedIn && userData ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 lg:gap-3 px-2 lg:px-3 py-1.5 lg:py-2 h-auto"
                  >
                    <Avatar className="h-7 w-7 lg:h-8 lg:w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs lg:text-sm">
                        {userData.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs lg:text-sm font-medium hidden md:inline">{userData.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {!isAlumni && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard"
                          className="flex items-center cursor-pointer"
                        >
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Dashboard Admin
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem asChild>
                    <Link
                      href={isAlumni ? "/profile-user" : "/profile"}
                      className="flex items-center cursor-pointer"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-600"
                  >
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
          <button
            className="md:hidden p-1.5 hover:bg-accent rounded-md transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
          </button>
        </div>
      </div>
    </nav>

      {/* Mobile Navigation - Slide from right, outside navbar */}
      <div
        className={`fixed top-0 right-0 h-full w-1/2 min-w-[280px] bg-background border-l border-border shadow-lg z-[60] md:hidden transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
          <div className="flex flex-col h-full">
            {/* Close button */}
            <div className="flex justify-between items-center p-4 border-b border-border">
              <span className="font-semibold text-primary">Menu</span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-accent rounded-md transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Menu content */}
            <div className="flex flex-col gap-3 sm:gap-4 p-4 overflow-y-auto">
              <Link
                href="/#home"
                className="text-sm sm:text-base text-foreground hover:text-primary transition-colors py-1 active:bg-accent rounded px-2 -mx-2"
                onClick={() => setIsOpen(false)}
              >
                Beranda
              </Link>
              <Link
                href="/#kuesioner"
                className="text-sm sm:text-base text-foreground hover:text-primary transition-colors py-1 active:bg-accent rounded px-2 -mx-2"
                onClick={() => setIsOpen(false)}
              >
                Kuesioner
              </Link>
              <Link
                href="/prediction"
                className="text-sm sm:text-base text-foreground hover:text-primary transition-colors py-1 active:bg-accent rounded px-2 -mx-2"
                onClick={() => setIsOpen(false)}
              >
                Prediksi
              </Link>
              <Link
                href="/#tentang"
                className="text-sm sm:text-base text-foreground hover:text-primary transition-colors py-1 active:bg-accent rounded px-2 -mx-2"
                onClick={() => setIsOpen(false)}
              >
                Tentang
              </Link>

              {isLoggedIn && userData ? (
                <>
                  <div className="flex items-center gap-2.5 sm:gap-3 py-1.5 sm:py-2 px-2 -mx-2 bg-accent/50 rounded-md">
                    <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs sm:text-sm">
                        {userData.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs sm:text-sm font-medium">{userData.name}</span>
                  </div>
                  <div className="border-t border-border pt-2 sm:pt-3 space-y-2 sm:space-y-2.5">
                    {!isAlumni && (
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 text-sm sm:text-base text-foreground hover:text-primary transition-colors py-1.5 active:bg-accent rounded px-2 -mx-2"
                        onClick={() => setIsOpen(false)}
                      >
                        <LayoutDashboard className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                        Dashboard Admin
                      </Link>
                    )}
                    <Link
                      href={isAlumni ? "/profile-user" : "/profile"}
                      className="flex items-center gap-2 text-sm sm:text-base text-foreground hover:text-primary transition-colors py-1.5 active:bg-accent rounded px-2 -mx-2"
                      onClick={() => setIsOpen(false)}
                    >
                      <User className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-2 text-sm sm:text-base text-red-600 hover:text-red-700 transition-colors py-1.5 active:bg-accent rounded px-2 -mx-2 w-full text-left"
                    >
                      <LogOut className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <Button
                  asChild
                  className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-fit text-sm sm:text-base"
                >
                  <Link href="/login">Masuk</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
    </>
  );
}
