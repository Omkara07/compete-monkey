"use client"
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, Home, Users } from 'lucide-react';

export default function RoomNotFound() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-md p-8 text-center">
                <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-2">Room Not Found</h1>
                <p className="text-muted-foreground mb-6">
                    The room you're looking for doesn't exist or may have expired.
                </p>
                <div className="space-y-2">
                    <Button asChild className="w-full">
                        <Link href="/room/create">
                            <Users className="w-4 h-4 mr-2" />
                            Create New Room
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                        <Link href="/dashboard">
                            <Home className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Link>
                    </Button>
                </div>
            </Card>
        </div>
    );
}