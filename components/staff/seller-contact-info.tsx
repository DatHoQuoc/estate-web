// components/staff/seller-contact-info.tsx
"use client"

import { Mail, Phone, User, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface SellerContactInfoProps {
  seller: {
    id: string
    name: string
    email: string
    phone?: string
    joinedDate?: string
    totalListings?: number
  }
}

export function SellerContactInfo({ seller }: SellerContactInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Seller Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{seller.name}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <a href={`mailto:${seller.email}`} className="text-primary hover:underline">
            {seller.email}
          </a>
        </div>
        {seller.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <a href={`tel:${seller.phone}`} className="text-primary hover:underline">
              {seller.phone}
            </a>
          </div>
        )}
        {seller.joinedDate && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Joined {new Date(seller.joinedDate).toLocaleDateString()}</span>
          </div>
        )}
        {seller.totalListings !== undefined && (
          <div className="text-sm text-muted-foreground">
            Total listings: {seller.totalListings}
          </div>
        )}
        <Button variant="outline" className="w-full mt-2" size="sm">
          Contact Seller
        </Button>
      </CardContent>
    </Card>
  )
}