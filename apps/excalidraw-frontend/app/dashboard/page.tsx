"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Pencil, Plus, Users, LogOut, Search, Clock, Copy, ExternalLink, X } from "lucide-react"
import { Button } from "@repo/ui/button"
import { Input } from "@repo/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Label } from "@repo/ui/label"
import axios from "axios"
import { BACKEND_URL } from "../config"
import { toast } from "sonner"

interface Room {
  id: number;
  slug: string;
  adminId: number;
  createdAt: string;
}

export default function Dashboard() {
  const router = useRouter()
  const [rooms, setRooms] = React.useState<Room[]>([])
  const [isLoadingRooms, setIsLoadingRooms] = React.useState(true)
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false)
  const [isJoinDialogOpen, setIsJoinDialogOpen] = React.useState(false)
  const [newRoomName, setNewRoomName] = React.useState("")
  const [joinRoomId, setJoinRoomId] = React.useState("")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isCreating, setIsCreating] = React.useState(false)
  const [isJoining, setIsJoining] = React.useState(false)

  React.useEffect(() => {
    const fetchRooms = async () => {
        try {
            setIsLoadingRooms(true)
            const response = await axios.get(`${BACKEND_URL}/api/v1/user/get-all-rooms`, {
                withCredentials: true
            })

            setRooms(response.data.rooms)
        } catch (error) {
            console.error("Error fetching rooms:", error)
            toast.error("Failed to load rooms")
        } finally {
            setIsLoadingRooms(false)
        }
    }

    fetchRooms()
  }, [])

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) {
        toast.error("Please enter a room name")
        return
    }
    
    setIsCreating(true)
    const loadingToast = toast.loading("Creating room...")
    
    try {
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/room`, 
            { slug: newRoomName }, 
            { withCredentials: true }
        )
        const roomId = response.data.id
        
        toast.success("Room created!", { id: loadingToast })
        setNewRoomName("")
        setIsCreateDialogOpen(false)
        router.push(`/canvas/${roomId}`)
    } catch (error: any) {
        console.error("Error creating room:", error)
        toast.error(error?.response?.data?.message || "Failed to create room", { id: loadingToast })
        setIsCreating(false)
    }
  }

  const handleJoinRoom = async () => {
    if (!joinRoomId.trim()) {
        toast.error("Please enter a room name")
        return
    }

    setIsJoining(true)
    const loadingToast = toast.loading("Joining room...")

    try {
        const response = await axios.get(`${BACKEND_URL}/api/v1/user/get-roomId/${joinRoomId}`, 
            { withCredentials: true }
        )
        const roomId = response.data.roomId
        
        toast.success("Joined room!", { id: loadingToast })
        setJoinRoomId("")
        setIsJoinDialogOpen(false)
        router.push(`/canvas/${roomId}`)
    } catch (error: any) {
        console.error("Error joining room:", error)
        toast.error(error?.response?.data?.message || "Room not found", { id: loadingToast })
        setIsJoining(false)
    }
  }

  const handleCopyRoomId = (roomId: string) => {
    navigator.clipboard.writeText(roomId)
    toast.success("Room name copied to clipboard!")
  }

  const handleLogout = () => {
    localStorage.removeItem("userId")
    toast.success("Logged out successfully")
    router.push("/")
  }

  const filteredRooms = rooms.filter(room => 
    room.slug.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      {/* Create Room Dialog */}
      <DialogPrimitive.Root open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-slate-200 bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg">
            <div className="flex flex-col space-y-1.5 text-center sm:text-left">
              <DialogPrimitive.Title className="text-2xl font-semibold text-slate-900">
                Create New Room
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-slate-600 text-sm">
                Give your room a name to get started
              </DialogPrimitive.Description>
            </div>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="room-name" className="text-sm font-medium text-slate-700">
                  Room Name
                </Label>
                <Input
                  id="room-name"
                  placeholder="e.g., Design Brainstorming"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateRoom()}
                  className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                className="border-slate-300 text-slate-700"
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateRoom}
                className="bg-blue-600 text-white hover:bg-blue-700"
                disabled={isCreating}
              >
                {isCreating ? "Creating..." : "Create Room"}
              </Button>
            </div>
            <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-slate-100 data-[state=open]:text-slate-500">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      {/* Join Room Dialog */}
      <DialogPrimitive.Root open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-slate-200 bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg">
            <div className="flex flex-col space-y-1.5 text-center sm:text-left">
              <DialogPrimitive.Title className="text-2xl font-semibold text-slate-900">
                Join Room
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-slate-600 text-sm">
                Enter the room name to join an existing room
              </DialogPrimitive.Description>
            </div>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="room-name" className="text-sm font-medium text-slate-700">
                  Room Name
                </Label>
                <Input
                  id="room-name"
                  placeholder="Enter room name"
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                  className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsJoinDialogOpen(false)}
                className="border-slate-300 text-slate-700"
                disabled={isJoining}
              >
                Cancel
              </Button>
              <Button
                onClick={handleJoinRoom}
                className="bg-blue-600 text-white hover:bg-blue-700"
                disabled={isJoining}
              >
                {isJoining ? "Joining..." : "Join Room"}
              </Button>
            </div>
            <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-slate-100 data-[state=open]:text-slate-500">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Navigation */}
        <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Pencil className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-semibold text-slate-900">DrawSpace</span>
            </Link>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Your Workspace
            </h1>
            <p className="text-lg text-slate-600">
              Create new rooms or join existing ones to start collaborating
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="flex-1 sm:flex-none bg-blue-600 text-white hover:bg-blue-700 h-12 px-6 rounded-lg font-medium shadow-sm"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create New Room
            </Button>

            <Button 
              onClick={() => setIsJoinDialogOpen(true)}
              className="flex-1 sm:flex-none bg-white text-slate-700 hover:bg-slate-50 h-12 px-6 rounded-lg font-medium border border-slate-300"
            >
              <Users className="h-5 w-5 mr-2" />
              Join Room
            </Button>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Search rooms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Rooms Grid */}
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">
              Your Rooms ({isLoadingRooms ? "..." : filteredRooms.length})
            </h2>
            
            {isLoadingRooms ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="border-slate-200 bg-white">
                    <CardHeader className="pb-4 pt-6 px-6">
                      <div className="h-6 bg-slate-200 rounded animate-pulse mb-2"></div>
                      <div className="h-4 bg-slate-100 rounded animate-pulse w-2/3"></div>
                    </CardHeader>
                    <CardContent className="px-6 pb-6">
                      <div className="h-10 bg-slate-200 rounded animate-pulse"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredRooms.length === 0 ? (
              <Card className="border-slate-200 bg-white shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Pencil className="h-16 w-16 text-slate-300 mb-4" />
                  <p className="text-lg font-medium text-slate-900 mb-2">
                    {searchQuery ? "No rooms found" : "No rooms yet"}
                  </p>
                  <p className="text-slate-600 mb-6 text-center">
                    {searchQuery 
                      ? "Try adjusting your search" 
                      : "Create your first room to start collaborating"}
                  </p>
                  {!searchQuery && (
                    <Button
                      onClick={() => setIsCreateDialogOpen(true)}
                      className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Room
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRooms.map((room) => (
                  <Card
                    key={room.id}
                    className="border-slate-200 bg-white hover:shadow-lg hover:border-blue-200 transition-all duration-200 cursor-pointer group"
                  >
                    <CardHeader className="pb-4 pt-6 px-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                            {room.slug}
                          </CardTitle>
                          <CardDescription className="flex items-center text-slate-500 text-sm">
                            <Clock className="h-4 w-4 mr-1.5" />
                            {room.createdAt}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="px-6 pb-6">
                      
                      <div className="flex gap-3">
                        <Button
                          onClick={() => router.push(`/canvas/${room.id}`)}
                          className="flex-1 bg-blue-600 text-white hover:bg-blue-700 h-10 shadow-sm hover:shadow transition-shadow"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open
                        </Button>
                        <Button
                          onClick={() => handleCopyRoomId(room.slug)}
                          variant="outline"
                          className="border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 h-10 px-4 transition-colors"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Quick Tips */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4 pt-6 px-6">
                <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <Plus className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg font-semibold text-slate-900 mb-2">Create Rooms</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <p className="text-sm text-slate-600 leading-relaxed">
                  Start a new room to collaborate with your team in real-time
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4 pt-6 px-6">
                <div className="bg-purple-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg font-semibold text-slate-900 mb-2">Invite Others</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <p className="text-sm text-slate-600 leading-relaxed">
                  Share the room ID with your team members to invite them
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4 pt-6 px-6">
                <div className="bg-emerald-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <Pencil className="h-6 w-6 text-emerald-600" />
                </div>
                <CardTitle className="text-lg font-semibold text-slate-900 mb-2">Start Drawing</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <p className="text-sm text-slate-600 leading-relaxed">
                  Use intuitive tools to bring your ideas to life together
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      </div>
    </>
  )
}
