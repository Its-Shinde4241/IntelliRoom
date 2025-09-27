import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, Calendar, Code, RefreshCw, FileText, DoorClosed } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import useRoomStore, { type Room } from '@/store/roomStore'
import { toast } from 'sonner'
import { SidebarMenuButton } from './ui/sidebar'

interface SearchRoomDialogProps {
    trigger?: React.ReactNode
    onRoomSelect?: (room: Room) => void
}

export default function SearchRoomDialog({ trigger, onRoomSelect }: SearchRoomDialogProps) {
    const navigate = useNavigate()
    const { rooms, setActiveRoom, loading } = useRoomStore()

    const [open, setOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [filteredRooms, setFilteredRooms] = useState<Room[]>([])

    useEffect(() => {
        if (open) {
            setFilteredRooms(rooms)
        }
    }, [open, rooms])

    useEffect(() => {
        const filtered = rooms.filter(room =>
            room.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        setFilteredRooms(filtered)
    }, [searchQuery, rooms])

    const handleRoomSelect = async (room: Room) => {
        try {
            setActiveRoom(room)
            onRoomSelect?.(room)

            navigate(`/room/${room.id}`)

            setOpen(false)
            setSearchQuery('')

            toast.success(`Opened room: ${room.name}`)
        } catch (error) {
            console.error('Failed to open room:', error)
            toast.error('Failed to open room')
        }
    }

    const handleFileSelect = async (room: Room, fileId: string, fileName: string) => {
        try {
            setActiveRoom(room)

            onRoomSelect?.(room)

            setOpen(false)
            navigate(`/room/${room.id}/file/${fileId}`)
            toast.success(`Opened file: ${fileName} in room: ${room.name}`)

            setSearchQuery('')

            toast.success(`Opened file: ${fileName} in room: ${room.name}`)
        } catch (error) {
            console.error('Failed to open file:', error)
            toast.error('Failed to open file')
        }
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Unknown'
        return new Date(dateString).toLocaleDateString()
    }

    const getFileCount = (room: Room) => {
        return room.files?.length || 0
    }

    const getFileExtension = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase()
        return ext || 'file'
    }

    const getFileIcon = (fileName: string) => {
        const ext = getFileExtension(fileName)
        switch (ext) {
            case 'js':
            case 'jsx':
            case 'ts':
            case 'tsx':
            case 'py':
            case 'java':
            case 'cpp':
            case 'c':
                return <Code className="h-3 w-3" />
            default:
                return <FileText className="h-3 w-3" />
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <SidebarMenuButton
                        variant={"outline"}
                        tooltip={"Search Rooms"}
                    >
                        <Search className="h-4 w-4" />
                        <span>
                            <b>Search Rooms</b>
                        </span>
                    </SidebarMenuButton>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle>Search Your Rooms</DialogTitle>
                    <DialogDescription>
                        Find and open your existing coding rooms and files
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by room name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <ScrollArea className="h-96">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                <div className="text-muted-foreground">Loading rooms...</div>
                            </div>
                        ) : filteredRooms.length === 0 ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="text-center">
                                    <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">
                                        {searchQuery ? 'No rooms found matching your search' : 'No rooms available'}
                                    </p>
                                    {!searchQuery && rooms.length === 0 && (
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Create your first room to get started
                                        </p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3 px-2">
                                <Accordion type="multiple" className="w-full">
                                    {filteredRooms.map((room) => (
                                        <AccordionItem key={room.id} value={room.id} className="border rounded-lg mb-2">
                                            <Card className="border-0 py-4">
                                                <AccordionTrigger className="hover:no-underline py-0 pr-4">
                                                    <CardHeader className="flex-1 pb-2 pl-4">
                                                        <div className="flex items-start justify-between w-full">
                                                            <div className="space-y-1 text-left">
                                                                <div className="flex items-center gap-2">
                                                                    <DoorClosed className="h-4 w-4" />
                                                                    <CardTitle className="text-base">{room.name}</CardTitle>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant={room.password ? "secondary" : "default"}>
                                                                    {room.password ? "Protected" : "Open"}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                            <div className="flex items-center gap-1">
                                                                <Code className="h-3 w-3" />
                                                                {getFileCount(room)} file{getFileCount(room) !== 1 ? 's' : ''}
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                {formatDate(room.createdAt)}
                                                            </div>
                                                        </div>
                                                    </CardHeader>
                                                </AccordionTrigger>
                                                <AccordionContent className="pt-0">
                                                    <CardContent className="pt-0">
                                                        <div className="space-y-2">
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-sm font-medium">Files in this room:</p>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        handleRoomSelect(room)
                                                                    }}
                                                                    className="text-xs text-primary hover:underline"
                                                                >
                                                                    Open Room
                                                                </button>
                                                            </div>
                                                            {room.files && room.files.length > 0 ? (
                                                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                                                    {room.files.map((file, index) => (
                                                                        <div
                                                                            key={index}
                                                                            className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors text-sm"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation()
                                                                                handleFileSelect(room, file.id, file.name)
                                                                            }}
                                                                        >
                                                                            {getFileIcon(file.name)}
                                                                            <span className="flex-1 truncate">
                                                                                {file.name}.{file.type}
                                                                            </span>
                                                                            <span className="text-xs text-muted-foreground">
                                                                                {getFileExtension(file.name).toUpperCase()}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <p className="text-sm text-muted-foreground py-2">
                                                                    No files in this room yet
                                                                </p>
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                </AccordionContent>
                                            </Card>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </div>
                        )}
                    </ScrollArea>

                    <div className="flex justify-between items-center pt-2 border-t">
                        <p className="text-sm text-muted-foreground">
                            {filteredRooms.length} of {rooms.length} room{rooms.length !== 1 ? 's' : ''}
                        </p>
                        <div className="text-sm text-muted-foreground">
                            Total: {rooms.length} room{rooms.length !== 1 ? 's' : ''}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}