"use client"

import { 
  ChevronRight,
  FileCode, 
  File as FileIcon, 
  Pencil,
  Trash2,
  type LucideIcon,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

interface WebDevFile {
  id: string
  name: string
  type: 'html' | 'css' | 'js'
}

interface Project {
  id: string
  name: string
  icon: LucideIcon
  files: WebDevFile[]
  isActive?: boolean
}

interface NavProjectsProps {
  projects: Project[]
  onRenameFile?: (projectId: string, fileId: string, newName: string) => void
  onDeleteFile?: (projectId: string, fileId: string) => void
  onRenameProject?: (projectId: string, newName: string) => void
  onDeleteProject?: (projectId: string) => void
}

// const FileIcons = {
//   html: FileIcon,
//   css: FileIcon,
//   js: FileCode,
// }

// const FileLabels = {
//   html: 'HTML',
//   css: 'CSS',
//   js: 'JavaScript'
// }

export default function NavProjects({ projects, onRenameFile, onDeleteFile, onRenameProject, onDeleteProject }: NavProjectsProps) {
  const navigate = useNavigate()

  const handleFileClick = (projectId: string, fileType: string) => {
    navigate(`/project/${projectId}/${fileType}`)
  }

  const handleRenameFile = (projectId: string, fileId: string) => {
    const file = projects.find(p => p.id === projectId)?.files.find(f => f.id === fileId)
    if (!file) return

    const newName = prompt("Enter new file name:", file.name)
    if (newName && newName !== file.name) {
      onRenameFile?.(projectId, fileId, newName)
    }
  }

  const handleDeleteFile = (projectId: string, fileId: string) => {
    if (confirm("Are you sure you want to delete this file?")) {
      onDeleteFile?.(projectId, fileId)
    }
  }

  const handleRenameProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    if (!project) return

    const newName = prompt("Enter new project name:", project.name)
    if (newName && newName !== project.name) {
      onRenameProject?.(projectId, newName)
    }
  }

  const handleDeleteProject = (projectId: string) => {
    if (confirm("Are you sure you want to delete this project and all its files?")) {
      onDeleteProject?.(projectId)
    }
  }

  const getFileIcon = (type: string) => {
    return type === 'js' ? FileCode : FileIcon
  }

  return (
    <div className="py-2">
      <SidebarGroup>
        <SidebarGroupLabel>Web Projects</SidebarGroupLabel>
        <SidebarMenu>
          {projects.map((project) => (
            <Collapsible
              key={project.id}
              asChild
              defaultOpen={project.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <ContextMenu>
                  <ContextMenuTrigger asChild>
                    <div className="flex items-center flex-1 group/menu-button">
                      <CollapsibleTrigger asChild className="flex-1">
                        <SidebarMenuButton tooltip={project.name}>
                          {project.icon && <project.icon className="h-4 w-4" />}
                          <span>{project.name}</span>
                          <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                    </div>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem onClick={() => handleRenameProject(project.id)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Rename Project
                    </ContextMenuItem>
                    <ContextMenuItem 
                      onClick={() => handleDeleteProject(project.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Project
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {project.files.map((file) => {
                      const FileTypeIcon = getFileIcon(file.type)
                      return (
                        <SidebarMenuSubItem key={file.id}>
                          <ContextMenu>
                            <ContextMenuTrigger asChild>
                              <div className="flex items-center">
                                <SidebarMenuSubButton
                                  onClick={() => handleFileClick(project.id, file.type)}
                                  className="flex-1"
                                >
                                  <FileTypeIcon className="h-4 w-4" />
                                  <span>{file.name}</span>
                                </SidebarMenuSubButton>
                              </div>
                            </ContextMenuTrigger>
                            <ContextMenuContent>
                              <ContextMenuItem onClick={() => handleRenameFile(project.id, file.id)}>
                                <Pencil className="h-3.5 w-3.5 mr-2" />
                                Rename File
                              </ContextMenuItem>
                              <ContextMenuItem 
                                onClick={() => handleDeleteFile(project.id, file.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-2" />
                                Delete File
                              </ContextMenuItem>
                            </ContextMenuContent>
                          </ContextMenu>
                        </SidebarMenuSubItem>
                      )
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </div>
  )
}