import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { auth, db } from "@/config/firebase"
import { updatePassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, User, Mail, Clock, Key, LogOut, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

export function AdminProfile() {
  const { user, logout } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [fullName, setFullName] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  useEffect(() => {
    if (user?.full_name) {
      setFullName(user.full_name)
    }
  }, [user?.full_name])

  const handleSave = async () => {
    if (!user?.id || !fullName.trim()) return
    
    setIsSaving(true)
    setMessage(null)
    try {
      await setDoc(doc(db, "users", user.id), {
        full_name: fullName.trim()
      }, { merge: true })
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setIsEditing(false)
    } catch (error: any) {
      console.error("Profile update error:", error)
      setMessage({ type: 'error', text: `Failed to update profile: ${error.message || 'Unknown error'}` })
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (!auth.currentUser || !newPassword) return
    
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' })
      return
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' })
      return
    }
    
    setIsResetting(true)
    setMessage(null)
    try {
      await updatePassword(auth.currentUser, newPassword)
      setMessage({ type: 'success', text: 'Password updated successfully!' })
      setIsChangingPassword(false)
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      console.error(error)
      if (error.code === 'auth/requires-recent-login') {
        setMessage({ type: 'error', text: 'Please sign out and sign back in to change your password for security reasons.' })
      } else if (error.code?.includes('operation-not-allowed') || auth.currentUser.providerData.some(p => p.providerId === 'google.com')) {
         setMessage({ type: 'error', text: 'Google-linked accounts cannot change their password here. Please manage your password through Google.' })
      } else {
        setMessage({ type: 'error', text: `Failed to update password: ${error.message}` })
      }
    } finally {
      setIsResetting(false)
    }
  }
  
  return (
    <div className="container mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Account Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your administrative profile and security preferences.</p>
      </div>

      {message && (
        <div className={"p-4 rounded-md flex items-center space-x-3 " + (message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500')}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Summary Card */}
        <Card className="col-span-1 md:col-span-1">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold mb-4">
              {user?.full_name?.charAt(0) || "A"}
            </div>
            <h2 className="text-xl font-bold">{user?.full_name}</h2>
            <p className="text-sm text-muted-foreground mb-4">{user?.email}</p>
            
            <div className="flex items-center space-x-2 bg-muted/50 px-3 py-1 rounded-full text-sm font-medium">
              <Shield className="w-4 h-4 text-primary" />
              <span className="capitalize">{user?.role?.replace("_", " ")}</span>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details Card */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => {
                setIsEditing(!isEditing)
                setFullName(user?.full_name || "")
                setMessage(null)
              }}>
                {isEditing ? "Cancel" : "Edit Profile"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={!isEditing} 
                    className="pl-9" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input defaultValue={user?.email} disabled={true} className="pl-9 bg-muted/30" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input value={user?.role?.replace("_", " ").toUpperCase()} disabled className="pl-9 bg-muted/30" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Account Created</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input value="Active" disabled className="pl-9 bg-muted/30" />
                </div>
              </div>
            </div>
            
            {isEditing && (
              <div className="flex justify-end pt-4">
                <Button onClick={handleSave} disabled={isSaving || !fullName.trim() || fullName === user?.full_name}>
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Save Changes
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Settings Card */}
        <Card className="col-span-1 md:col-span-3">
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Manage your password and active sessions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-muted/10">
              <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                <div className="p-2 bg-primary/10 rounded-full text-primary">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium">Password</h4>
                  <p className="text-sm text-muted-foreground">Change your password securely.</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => {
                setIsChangingPassword(!isChangingPassword)
                setMessage(null)
              }}>
                {isChangingPassword ? "Cancel" : "Change Password"}
              </Button>
            </div>
            
            {isChangingPassword && (
              <div className="p-4 border rounded-lg bg-muted/5 space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm Password</Label>
                    <Input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button onClick={handleUpdatePassword} disabled={isResetting || !newPassword || !confirmPassword}>
                    {isResetting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Save New Password
                  </Button>
                </div>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-destructive/5 border-destructive/20">
              <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                <div className="p-2 bg-destructive/10 rounded-full text-destructive">
                  <LogOut className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-destructive">Sign out from all devices</h4>
                  <p className="text-sm text-muted-foreground">This will invalidate all current sessions.</p>
                </div>
              </div>
              <Button variant="destructive" onClick={logout}>Sign Out Globally</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
