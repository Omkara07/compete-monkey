"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Camera, Trophy, Target, Clock, Award, Bell, Shield, Upload } from "lucide-react"
import { User } from "@/lib/generated/prisma"
import axios from "axios"
import { useEffect, useMemo, useState } from "react"
import { UploadButton } from "@/lib/uploadthing"
import { useRouter } from "next/navigation"

interface props {
    profile: User
    updateEndpoint?: string
}
export function ProfileSection({ profile, updateEndpoint }: props) {
    const [name, setName] = useState<string>(profile.name ?? "")
    const [imageUrl, setImageUrl] = useState<string>(profile.imageUrl ?? "")
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const router = useRouter();

    useEffect(() => {
        setName(profile.name ?? "")
        setImageUrl(profile.imageUrl ?? "")
    }, [profile.name, profile.imageUrl])

    const initialName = profile.name ?? ""
    const initialImageUrl = profile.imageUrl ?? ""
    const isDirty = useMemo(() => name !== initialName || imageUrl !== initialImageUrl, [name, imageUrl, initialName, initialImageUrl])

    const handleCancel = () => {
        setName(initialName)
        setImageUrl(initialImageUrl)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isDirty || isSubmitting) return
        setIsSubmitting(true)
        try {
            const url = updateEndpoint ?? ""
            await axios.patch(url, { name, imageUrl })
            router.refresh()
        }
        catch (e) {
            console.log(e)
        } finally {
            setIsSubmitting(false)
        }
    }
    return (
        <div className="space-y-6">
            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="achievements">Achievements</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-6">
                    {/* Profile Header */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>Update your personal details and avatar</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Avatar Section */}
                            <div className="flex items-center gap-6 ">
                                <div className="relative flex flex-col gap-y-2 justify-center items-center">
                                    <a href={imageUrl || ""} target="_blank" rel="noopener noreferrer">
                                        <Avatar className="w-24 h-24">
                                            <AvatarImage src={imageUrl || ""} />
                                            <AvatarFallback className="text-2xl">{(name || profile.name || "").slice(0, 1)}</AvatarFallback>
                                        </Avatar>
                                    </a>
                                    <div className="flex flex-col gap-y-2">
                                        <UploadButton
                                            endpoint="imageUploader"
                                            appearance={{
                                                container: "",
                                                button: "h-2 w-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors flex items-center justify-center border-2 border-background shadow-sm",
                                                allowedContent: "hidden"
                                            }}
                                            content={{
                                                button() {
                                                    return (
                                                        <div className="gap-x-2 text-xs flex items-center font-semibold">
                                                            <p>Upload new</p> <Upload className="w-4 h-4" />
                                                        </div>
                                                    )
                                                }
                                            }}
                                            onClientUploadComplete={(res) => {
                                                try {
                                                    const first = res?.[0]
                                                    if (first?.url) {
                                                        setImageUrl(first.url)
                                                    }
                                                } catch { }
                                            }}
                                            onUploadError={(error) => {
                                                console.error(error)
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold">{name || profile.name}</h3>
                                    <p className="text-muted-foreground">{profile.email}</p>
                                </div>
                            </div>

                            <Separator />

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Form Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder={initialName} className="ring" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" type="email" disabled className="ring" defaultValue={profile.email} />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2">
                                    {isDirty && (
                                        <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>Cancel</Button>
                                    )}
                                    <Button type="submit" disabled={!isDirty || isSubmitting}>{isSubmitting ? "Saving..." : "Save Changes"}</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="achievements" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Achievements</CardTitle>
                            <CardDescription>Your accomplishments and milestones</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-3">
                                        <Trophy className="w-6 h-6 text-primary-foreground" />
                                    </div>
                                    <h4 className="font-semibold mb-1">Speed Demon</h4>
                                    <p className="text-sm text-muted-foreground mb-2">Achieve 90+ WPM in a competition</p>
                                    <Badge variant="default">Unlocked</Badge>
                                </div>

                                <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
                                    <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mb-3">
                                        <Target className="w-6 h-6 text-accent-foreground" />
                                    </div>
                                    <h4 className="font-semibold mb-1">Accuracy Master</h4>
                                    <p className="text-sm text-muted-foreground mb-2">Maintain 95%+ accuracy for 10 games</p>
                                    <Badge variant="secondary">Unlocked</Badge>
                                </div>

                                <div className="p-4 bg-muted/50 rounded-lg border">
                                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                                        <Clock className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                    <h4 className="font-semibold mb-1">Marathon Runner</h4>
                                    <p className="text-sm text-muted-foreground mb-2">Type for 60 minutes straight</p>
                                    <Badge variant="outline">Locked</Badge>
                                </div>

                                <div className="p-4 bg-muted/50 rounded-lg border">
                                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                                        <Award className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                    <h4 className="font-semibold mb-1">Champion</h4>
                                    <p className="text-sm text-muted-foreground mb-2">Win 50 competitions</p>
                                    <Badge variant="outline">28/50</Badge>
                                </div>

                                <div className="p-4 bg-muted/50 rounded-lg border">
                                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                                        <Shield className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                    <h4 className="font-semibold mb-1">Perfectionist</h4>
                                    <p className="text-sm text-muted-foreground mb-2">Achieve 100% accuracy in a race</p>
                                    <Badge variant="outline">Locked</Badge>
                                </div>

                                <div className="p-4 bg-muted/50 rounded-lg border">
                                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                                        <Bell className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                    <h4 className="font-semibold mb-1">Social Butterfly</h4>
                                    <p className="text-sm text-muted-foreground mb-2">Add 25 friends</p>
                                    <Badge variant="outline">12/25</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
