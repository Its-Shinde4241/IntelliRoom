import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Search, Calendar, Code, RefreshCw, FileText, DoorClosed, FolderOpen } from 'lucide-react'
import { Card } from '@/components/ui/card'
import useRoomStore, { type Room } from '@/store/roomStore'
import { useProjectStore, type Project } from '@/store/projectStore'
import { toast } from 'sonner'
import { SidebarMenuButton } from './ui/sidebar'

type SearchResultType = 'room' | 'file' | 'project' | 'project-file'

interface SearchResult {
    id: string
    name: string
    type: SearchResultType
    roomId?: string
    projectId?: string
    fileId?: string
    fileType?: string
    room?: Room
    project?: Project
    createdAt?: string
    description?: string
}

interface SearchRoomDialogProps {
    trigger?: React.ReactNode
    onRoomSelect?: (room: Room) => void
}

export default function SearchRoomDialog({ trigger, onRoomSelect }: SearchRoomDialogProps) {
    const navigate = useNavigate()
    const { rooms, roomsLoading } = useRoomStore()
    const { projects, projectsLoading } = useProjectStore()

    const [open, setOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [debouncedQuery, setDebouncedQuery] = useState('')
    const [searchResults, setSearchResults] = useState<SearchResult[]>([])
    const [activeTab, setActiveTab] = useState<'all' | 'rooms' | 'projects' | 'files'>('all')
    const [isSearching, setIsSearching] = useState(false)

    // Debounce search query to reduce rapid re-renders
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery)
        }, 200)

        return () => clearTimeout(timer)
    }, [searchQuery])

    const performSearch = useCallback((query: string) => {
        const results: SearchResult[] = []
        const lowerQuery = query.toLowerCase()

        // Search rooms
        rooms.forEach(room => {
            if (!query || room.name.toLowerCase().includes(lowerQuery)) {
                results.push({
                    id: room.id,
                    name: room.name,
                    type: 'room',
                    roomId: room.id,
                    room,
                    createdAt: room.createdAt,
                    description: `${room.files?.length || 0} files`
                })
            }

            // Search files within rooms
            room.files?.forEach(file => {
                if (!query || file.name.toLowerCase().includes(lowerQuery) ||
                    file.type.toLowerCase().includes(lowerQuery)) {
                    results.push({
                        id: `${room.id}-${file.id}`,
                        name: `${file.name}.${file.type}`,
                        type: 'file',
                        roomId: room.id,
                        fileId: file.id,
                        fileType: file.type,
                        room,
                        description: `in ${room.name}`
                    })
                }
            })
        })

        // Search projects
        projects.forEach(project => {
            if (!query || project.name.toLowerCase().includes(lowerQuery)) {
                results.push({
                    id: project.id,
                    name: project.name,
                    type: 'project',
                    projectId: project.id,
                    project,
                    createdAt: project.createdAt,
                    description: `${project.files?.length || 0} files`
                })
            }

            // Search project files
            project.files?.forEach(file => {
                if (!query || file.name.toLowerCase().includes(lowerQuery) ||
                    file.type.toLowerCase().includes(lowerQuery)) {
                    results.push({
                        id: `${project.id}-${file.id}`,
                        name: `${file.name}.${file.type}`,
                        type: 'project-file',
                        projectId: project.id,
                        fileId: file.id,
                        fileType: file.type,
                        project,
                        description: `in ${project.name}`
                    })
                }
            })
        })

        return results
    }, [rooms, projects])

    // Fetch projects when component mounts (only once)
    useEffect(() => {
        const { fetchUserProjects } = useProjectStore.getState()
        fetchUserProjects()
    }, [])

    // Update search results when dependencies change (using debounced query)
    useEffect(() => {
        if (searchQuery !== debouncedQuery) {
            setIsSearching(true)
        }

        const results = performSearch(debouncedQuery)
        setSearchResults(prevResults => {
            setIsSearching(false)
            // Only update if results actually changed to prevent unnecessary re-renders
            if (JSON.stringify(prevResults) !== JSON.stringify(results)) {
                return results
            }
            return prevResults
        })
    }, [debouncedQuery, searchQuery, performSearch])

    // Initialize search results when dialog opens
    useEffect(() => {
        if (open) {
            setIsSearching(false)
            const results = performSearch(debouncedQuery || '')
            setSearchResults(results)
        } else {
            // Reset state when dialog closes
            setSearchQuery('')
            setDebouncedQuery('')
            setActiveTab('all')
        }
    }, [open, debouncedQuery, performSearch])

    const handleSearchResultClick = useCallback(async (result: SearchResult) => {
        try {
            setOpen(false)
            setSearchQuery('')

            switch (result.type) {
                case 'room':
                    if (result.room) {
                        onRoomSelect?.(result.room)
                        navigate(`/room/${result.roomId}`)
                        toast.success(`Opened room: ${result.name}`)
                    }
                    break

                case 'file':
                    if (result.room && result.fileId) {
                        onRoomSelect?.(result.room)
                        navigate(`/room/${result.roomId}/file/${result.fileId}`)
                        toast.success(`Opened file: ${result.name}`)
                    }
                    break

                case 'project':
                    navigate(`/project/${result.projectId}`)
                    toast.success(`Opened project: ${result.name}`)
                    break

                case 'project-file':
                    navigate(`/project/${result.projectId}/${result.fileType}`)
                    toast.success(`Opened file: ${result.name}`)
                    break

                default:
                    break
            }
        } catch (error) {
            console.error('Failed to open item:', error)
            toast.error('Failed to open item')
        }
    }, [navigate, onRoomSelect])

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Unknown'
        return new Date(dateString).toLocaleDateString()
    }

    const getResultIcon = (result: SearchResult) => {
        switch (result.type) {
            case 'room':
                return <DoorClosed className="h-4 w-4" />
            case 'project':
                return <FolderOpen className="h-4 w-4" />
            case 'file':
            case 'project-file':
                const ext = result.fileType?.toLowerCase()
                switch (ext) {
                    case 'js':
                    case 'jsx':
                    case 'ts':
                    case 'tsx':
                    case 'py':
                    case 'java':
                    case 'cpp':
                    case 'c':
                        return <Code className="h-4 w-4" />
                    default:
                        return <FileText className="h-4 w-4" />
                }
            default:
                return <FileText className="h-4 w-4" />
        }
    }

    const getResultTypeLabel = (type: SearchResultType) => {
        switch (type) {
            case 'room': return 'Room'
            case 'project': return 'Project'
            case 'file': return 'Room File'
            case 'project-file': return 'Project File'
            default: return 'Item'
        }
    }

    const getResultTypeColor = (type: SearchResultType) => {
        switch (type) {
            case 'room': return 'bg-blue-100 text-blue-800'
            case 'project': return 'bg-green-100 text-green-800'
            case 'file': return 'bg-purple-100 text-purple-800'
            case 'project-file': return 'bg-orange-100 text-orange-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const filteredResults = useMemo(() => {
        switch (activeTab) {
            case 'rooms':
                return searchResults.filter(r => r.type === 'room')
            case 'projects':
                return searchResults.filter(r => r.type === 'project')
            case 'files':
                return searchResults.filter(r => r.type === 'file' || r.type === 'project-file')
            default:
                return searchResults
        }
    }, [searchResults, activeTab])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <SidebarMenuButton
                        variant={"outline"}
                        tooltip={"Search Everything"}
                        className='bg-sidebar'
                    >
                        <Search className="h-4 w-4" />
                        <span>
                            <b>Search</b>
                        </span>
                    </SidebarMenuButton>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle>Search Everything</DialogTitle>
                    <DialogDescription>
                        Find and open rooms, projects, and files across your workspace
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search rooms, projects, files..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Filter tabs */}
                    <div className="flex gap-2">
                        <Button
                            variant={activeTab === 'all' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setActiveTab('all')}
                        >
                            All ({searchResults.length})
                        </Button>
                        <Button
                            variant={activeTab === 'rooms' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setActiveTab('rooms')}
                        >
                            Rooms ({searchResults.filter(r => r.type === 'room').length})
                        </Button>
                        <Button
                            variant={activeTab === 'projects' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setActiveTab('projects')}
                        >
                            Projects ({searchResults.filter(r => r.type === 'project').length})
                        </Button>
                        <Button
                            variant={activeTab === 'files' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setActiveTab('files')}
                        >
                            Files ({searchResults.filter(r => r.type === 'file' || r.type === 'project-file').length})
                        </Button>
                    </div>

                    <ScrollArea className="h-96">
                        {roomsLoading || projectsLoading || isSearching ? (
                            <div className="flex items-center justify-center py-8">
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                <div className="text-muted-foreground">Loading...</div>
                            </div>
                        ) : filteredResults.length === 0 ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="text-center">
                                    <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">
                                        {searchQuery ? 'No results found matching your search' : 'No items available'}
                                    </p>
                                    {!searchQuery && searchResults.length === 0 && (
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Create your first room or project to get started
                                        </p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2 px-2">
                                {filteredResults.map((result) => (
                                    <Card
                                        key={result.id}
                                        className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                                        onClick={() => handleSearchResultClick(result)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 mt-1">
                                                {getResultIcon(result)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-medium text-sm truncate">{result.name}</h3>
                                                    <Badge
                                                        variant="secondary"
                                                        className={`text-xs ${getResultTypeColor(result.type)}`}
                                                    >
                                                        {getResultTypeLabel(result.type)}
                                                    </Badge>
                                                </div>
                                                {result.description && (
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {result.description}
                                                    </p>
                                                )}
                                                {result.createdAt && (
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <Calendar className="h-3 w-3 text-muted-foreground" />
                                                        <span className="text-xs text-muted-foreground">
                                                            {formatDate(result.createdAt)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </ScrollArea>

                    <div className="flex justify-between items-center pt-2 border-t">
                        <p className="text-sm text-muted-foreground">
                            {filteredResults.length} of {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                        </p>
                        <div className="text-sm text-muted-foreground">
                            Total: {rooms.length} room{rooms.length !== 1 ? 's' : ''}, {projects.length} project{projects.length !== 1 ? 's' : ''}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}