"use client";

import {
  ChevronRight,
  FileCode,
  File as FileIcon,
  Pencil,
  Trash2,
  Play,
  OctagonAlert,
  FolderOpen,
  Folder,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import RenameFilePopover from "./RenameFilePopover";
import RenameProjectPopover from "./RenameProjectPopover";
import { toast } from "sonner";
import type { WebDevFile, Project } from "@/store/projectStore";

interface NavProjectsProps {
  projects: Project[];
  onRenameFile?: (projectId: string, fileId: string, newName: string) => void;
  onDeleteFile?: (projectId: string, fileId: string) => void;
  onRenameProject?: (projectId: string, newName: string) => void;
  onDeleteProject?: (projectId: string) => void;
  onRunProject?: (projectId: string) => void;
}

export default function NavProjects({
  projects,
  onRenameFile,
  onDeleteFile,
  onRenameProject,
  onDeleteProject,
  onRunProject,
}: NavProjectsProps) {
  const navigate = useNavigate();
  const params = useParams();
  const currentProjectId = params.projectId;
  const currentFileType = params.fileType;

  const [projectToDelete, setProjectToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [openProjects, setOpenProjects] = useState<Set<string>>(new Set());

  // Auto-expand the currently active project
  useEffect(() => {
    if (currentProjectId) {
      setOpenProjects(prev => {
        const newSet = new Set(prev);
        newSet.add(currentProjectId);
        return newSet;
      });
    }
  }, [currentProjectId]);

  const handleFileClick = (projectId: string, fileType: string) => {
    navigate(`/project/${projectId}/${fileType}`);
  };

  const handleRenameFile = async (
    projectId: string,
    fileId: string,
    newName: string
  ) => {
    try {
      await onRenameFile?.(projectId, fileId, newName);
    } catch (error) {
      throw error; // Let the popover handle the error
    }
  };

  const handleDeleteFile = (projectId: string, fileId: string) => {
    if (confirm("Are you sure you want to delete this file?")) {
      onDeleteFile?.(projectId, fileId);
    }
  };

  const handleRenameProject = async (projectId: string, newName: string) => {
    try {
      await onRenameProject?.(projectId, newName);
    } catch (error) {
      throw error; // Let the popover handle the error
    }
  };

  const handleRunProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    toast.success(`Running "${project?.name || 'project'}" in browser...`, {
      duration: 2000,
      style: { width: "auto", minWidth: "fit-content", padding: 6 },
    });
    onRunProject?.(projectId);
  };

  const handleDeleteProject = (projectId: string) => {
    onDeleteProject?.(projectId);
    setProjectToDelete(null);
  };

  const handleProjectToggle = (projectId: string, isOpen: boolean) => {
    setOpenProjects(prev => {
      const newSet = new Set(prev);
      if (isOpen) {
        newSet.add(projectId);
      } else {
        newSet.delete(projectId);
      }
      return newSet;
    });
  };

  const getFileIcon = (type: string) => {
    return type === "js" ? FileCode : FileIcon;
  };

  const getProjectIcon = (projectId: string) => {
    return openProjects.has(projectId) ? FolderOpen : Folder;
  };

  return (
    <div className="py-2">
      <SidebarGroup>
        <SidebarGroupLabel>Web Projects</SidebarGroupLabel>
        <SidebarMenu>
          {projects.map((project) => {
            const ProjectIcon = getProjectIcon(project.id);

            const isActiveProject = project.id === currentProjectId;

            return (
              <Collapsible
                key={project.id}
                asChild
                defaultOpen={project.isActive || isActiveProject}
                open={openProjects.has(project.id)}
                className="group/collapsible"
                onOpenChange={(isOpen) => handleProjectToggle(project.id, isOpen)}
              >
                <SidebarMenuItem>
                  <ContextMenu>
                    <ContextMenuTrigger asChild>
                      <div className="flex items-center flex-1 group/menu-button">
                        <CollapsibleTrigger asChild className="flex-1">
                          <SidebarMenuButton
                            tooltip={project.name}
                            className={`${isActiveProject ? 'bg-accent text-accent-foreground font-medium' : ''}`}
                          >
                            <ProjectIcon className="h-4 w-4" />
                            <span>{project.name}</span>
                            <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                      </div>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuItem
                        onClick={() => handleRunProject(project.id)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Run Project
                      </ContextMenuItem>
                      <RenameProjectPopover
                        projectName={project.name}
                        onRename={(newName) => handleRenameProject(project.id, newName)}
                      />
                      <ContextMenuItem
                        onClick={() => setProjectToDelete({ id: project.id, name: project.name })}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Project
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {project.files.map((file: WebDevFile) => {
                        const FileTypeIcon = getFileIcon(file.type);
                        const isActiveFile = project.id === currentProjectId && file.type === currentFileType;

                        return (
                          <SidebarMenuSubItem key={file.id}>
                            <ContextMenu>
                              <ContextMenuTrigger asChild>
                                <div className="flex items-center">
                                  <SidebarMenuSubButton
                                    onClick={() =>
                                      handleFileClick(project.id, file.type)
                                    }
                                    className={`flex-1 ${isActiveFile ? 'bg-accent text-accent-foreground font-medium' : ''}`}
                                  >
                                    <FileTypeIcon className="h-4 w-4" />
                                    <span>{file.name}</span>
                                  </SidebarMenuSubButton>
                                </div>
                              </ContextMenuTrigger>
                              <ContextMenuContent>
                                <RenameFilePopover
                                  fileName={file.name}
                                  onRename={(newName) =>
                                    handleRenameFile(project.id, file.id, newName)
                                  }
                                  trigger={
                                    <ContextMenuItem
                                      onSelect={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                      }}
                                    >
                                      <Pencil className="h-3.5 w-3.5 mr-2" />
                                      Rename File
                                    </ContextMenuItem>
                                  }
                                />
                                <ContextMenuItem
                                  onClick={() =>
                                    handleDeleteFile(project.id, file.id)
                                  }
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                                  Delete File
                                </ContextMenuItem>
                              </ContextMenuContent>
                            </ContextMenu>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          })}
        </SidebarMenu>

        <AlertDialog
          open={!!projectToDelete}
          onOpenChange={(open) => !open && setProjectToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader className="items-center">
              <AlertDialogTitle>
                <div className="mb-2 mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
                  <OctagonAlert className="h-7 w-7 text-destructive" />
                </div>
                Are you absolutely sure?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-[15px] text-center">
                This action cannot be undone. This will permanently delete the
                project <b>{projectToDelete?.name}</b> and all its files from the
                server.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-2 sm:justify-center">
              <AlertDialogCancel onClick={() => setProjectToDelete(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className={buttonVariants({ variant: "destructive" })}
                onClick={() => projectToDelete && handleDeleteProject(projectToDelete.id)}
              >
                Delete Project
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarGroup>
    </div>
  );
}