"use client"
import { AuthTabs } from "@/components/auth-tabs"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AuthTabs />
     
      </div>
    </main>
  )
}
