"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LocationPicker } from "./location-picker"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"

export function SignUpForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    farmerName: "",
    email: "",
    password: "",
    confirmPassword: "",
    farmSize: "",
    farmLocation: null as { lat: number; lng: number } | null,
    phoneNumber: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const handleLocationSelect = (location: { lat: number; lng: number }) => {
    setFormData((prev) => ({ ...prev, farmLocation: location }))
    setError("")
  }

  const validateForm = () => {
    if (!formData.farmerName.trim()) {
      setError("Farmer name is required")
      return false
    }
    if (!formData.email.trim()) {
      setError("Email is required")
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email")
      return false
    }
    if (!formData.password) {
      setError("Password is required")
      return false
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return false
    }
    if (!formData.farmSize || Number.parseFloat(formData.farmSize) <= 0) {
      setError("Please enter a valid farm size")
      return false
    }
    if (!formData.farmLocation) {
      setError("Please select your farm location on the map")
      return false
    }
    if (!formData.phoneNumber.trim()) {
      setError("Phone number is required")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (!validateForm()) return

    setLoading(true)
    try {
        console.log("TEST LOG:", {
          farmerName: formData.farmerName,
          email: formData.email,
          password: formData.password,
          farmSize: Number.parseFloat(formData.farmSize),
          farmLocation: formData.farmLocation,
          phoneNumber: formData.phoneNumber,
        });
        
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmerName: formData.farmerName,
          email: formData.email,
          password: formData.password,
          farmSize: Number.parseFloat(formData.farmSize),
          farmLocation: formData.farmLocation,
          phoneNumber: formData.phoneNumber,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Sign up failed")
        return
      }

      setSuccess(true)
      setFormData({
        farmerName: "",
        email: "",
        password: "",
        confirmPassword: "",
        farmSize: "",
        farmLocation: null,
        phoneNumber: "",
      })

      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (err) {
      setError("An error occurred. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>Account created successfully!</span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="farmerName" className="text-gray-700 font-medium">
          Farmer Name
        </Label>
        <Input
          id="farmerName"
          name="farmerName"
          placeholder="Your full name"
          value={formData.farmerName}
          onChange={handleInputChange}
          disabled={loading}
          className="border-gray-300"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-700 font-medium">
          Email Address
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="your@email.com"
          value={formData.email}
          onChange={handleInputChange}
          disabled={loading}
          className="border-gray-300"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-700 font-medium">
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Min 6 characters"
            value={formData.password}
            onChange={handleInputChange}
            disabled={loading}
            className="border-gray-300"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
            Confirm Password
          </Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            disabled={loading}
            className="border-gray-300"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="farmSize" className="text-gray-700 font-medium">
            Farm Size (acres)
          </Label>
          <Input
            id="farmSize"
            name="farmSize"
            type="number"
            placeholder="e.g., 5.5"
            step="0.1"
            value={formData.farmSize}
            onChange={handleInputChange}
            disabled={loading}
            className="border-gray-300"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phoneNumber" className="text-gray-700 font-medium">
            Phone Number
          </Label>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            placeholder="+1 (555) 000-0000"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            disabled={loading}
            className="border-gray-300"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-700 font-medium">Farm Location {formData.farmLocation && "✓"}</Label>
        <LocationPicker onLocationSelect={handleLocationSelect} />
        {formData.farmLocation && (
          <p className="text-xs text-green-600 font-medium">
            Location selected: {formData.farmLocation.lat.toFixed(4)}, {formData.farmLocation.lng.toFixed(4)}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Creating Account...
          </>
        ) : (
          "Create Account"
        )}
      </Button>
    </form>
  )
}
