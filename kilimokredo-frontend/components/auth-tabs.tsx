"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SignUpForm } from "./sign-up-form"
import { LoginForm } from "./login-form"

export function AuthTabs() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-green-700 mb-2">FarmCredit</h1>
        <p className="text-gray-600">Farmer Credit Scoring System</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <LoginForm />
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <SignUpForm />
          </TabsContent>
        </Tabs>
      </div>

      <p className="text-center text-sm text-gray-500">Secure authentication for farmers • Your data is protected</p>
    </div>
  )
}
