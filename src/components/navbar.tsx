import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"
import Image from "next/image"

export function Navbar() {
  return (
    <div className="self-stretch h-[68px] pl-6 pr-8 py-3 bg-white shadow-[0px_0.5px_2px_0px_rgba(0,0,0,0.05)] border-b border-gray-200 inline-flex justify-start items-center gap-4">
      <div className="flex-1 h-11 relative flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="inline-flex justify-start items-center gap-2 overflow-hidden">
          <Image 
            src="/LogoITK.png" 
            alt="Tracer Study Logo"
            width={37} 
            height={43}
          />
          <div className="justify-center">
            <span className="text-[#0067B3] text-base font-normal font-['Noto_Serif_Gujarati'] block leading-tight">
              Tracer Study
            </span>
            <span className="text-black text-[8px] font-normal font-['Noto_Serif_Gujarati'] block">
              Institut Teknologi Kalimantan
            </span>
          </div>
        </div>

        {/* Right side - Notification and Avatar */}
        <div className="flex items-center gap-4">
          {/* Notification Button */}
          <Button
            variant="ghost"
            size="icon"
            className="size-11 p-2.5 bg-white rounded-full hover:bg-gray-50"
          >
            <Bell className="size-6 text-gray-400" />
          </Button>

          {/* User Avatar */}
          <Avatar className="size-9 bg-gray-900">
            <AvatarImage src="" alt="User" />
            <AvatarFallback className="bg-gray-900 text-white text-base font-medium font-['Inter'] leading-7">
              DU
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  )
}