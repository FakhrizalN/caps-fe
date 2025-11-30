import { Instagram, Mail, MapPin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-primary text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Logo and Description */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Image
                src="/LogoITK.png"
                alt="Logo Institut Teknologi Kalimantan"
                width={60}
                height={60}
                className="object-contain bg-white rounded-lg p-1"
              />
              <div>
                <h3 className="font-semibold text-lg">Tracer Study</h3>
                <p className="text-sm text-white/70">Institut Teknologi Kalimantan</p>
              </div>
            </div>
            <p className="text-white/70 text-sm">
              Sistem penelusuran alumni untuk meningkatkan kualitas pendidikan di Institut Teknologi Kalimantan.
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">Kontak</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-white flex-shrink-0 mt-0.5" />
                <span className="text-white/70 text-sm">
                  Jl. Soekarno-Hatta Km. 15, Karang Joang, Balikpapan, Kalimantan Timur, 76127
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-white flex-shrink-0" />
                <Link
                  href="mailto:tracerstudy@itk.ac.id"
                  className="text-white/70 text-sm hover:text-white transition-colors"
                >
                  tracerstudy@itk.ac.id
                </Link>
              </li>
              <li className="flex items-center gap-3">
                <Instagram className="h-5 w-5 text-white flex-shrink-0" />
                <Link
                  href="https://www.instagram.com/itk_official/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 text-sm hover:text-white transition-colors"
                >
                  @itk_official
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Tautan Cepat</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#home" className="text-white/70 text-sm hover:text-white transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="#kuesioner" className="text-white/70 text-sm hover:text-white transition-colors">
                  Kuesioner
                </Link>
              </li>
              <li>
                <Link href="#tentang" className="text-white/70 text-sm hover:text-white transition-colors">
                  Tentang
                </Link>
              </li>
              <li>
                <Link
                  href="https://itk.ac.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 text-sm hover:text-white transition-colors"
                >
                  Website ITK
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 text-center">
          <p className="text-white/60 text-sm">
            © {new Date().getFullYear()} Institut Teknologi Kalimantan. Hak Cipta Dilindungi.
          </p>
        </div>
      </div>
    </footer>
  )
}
