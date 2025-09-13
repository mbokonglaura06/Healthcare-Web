import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Mail, CheckCircle } from "lucide-react"

export default function PendingApprovalPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Clock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Account Under Review</CardTitle>
          <CardDescription>Your doctor account is being reviewed by our admin team</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span className="text-sm">Account created successfully</span>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Pending admin approval</span>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Email notification when approved</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              We typically review doctor applications within 24-48 hours. You'll receive an email notification once your
              account is approved.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
