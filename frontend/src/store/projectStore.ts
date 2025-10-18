import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { FolderOpen, type LucideIcon } from 'lucide-react';
import { api } from '@/lib/axiosInstance';
import JSZip from 'jszip';

export interface WebDevFile {
    id: string;
    name: string;
    type: "html" | "css" | "js";
    content?: string;
    projectId: string;
    roomId?: string;
    createdAt?: string;
    updatedAt?: string;
    userId: string;
}

export interface Project {
    id: string;
    name: string;
    icon: LucideIcon;
    files: WebDevFile[];
    isActive?: boolean;
    userId: string;
    createdAt?: string;
    updatedAt?: string;
}

interface ProjectState {
    projects: Project[];
    projectsLoading: boolean;
    projectActionLoading: boolean;
    projectFilesLoading: boolean;
    fileActionLoading: boolean;
    error: string | null;

    fetchUserProjects: () => Promise<void>;
    createProject: (projectName: string) => Promise<Project>;
    updateProject: (projectId: string, projectName: string) => Promise<void>;
    deleteProject: (projectId: string) => Promise<void>;
    getProjectFiles: (projectId: string) => Promise<WebDevFile[]>;
    updateProjectFile: (projectId: string, fileId: string, updates: Partial<WebDevFile>) => Promise<void>;
    downloadProject: (projectId: string) => void;
    runProject: (projectId: string) => void;
    setError: (error: string | null) => void;
    clearError: () => void;
}

const transformProject = (backendProject: any): Project => ({
    ...backendProject,
    icon: FolderOpen,
    files: backendProject.files || [],
});

const handleError = (error: any, defaultMessage: string) => {
    return error?.response?.data?.error || error?.message || defaultMessage;
};


export const useProjectStore = create<ProjectState>()(
    devtools((set, get) => ({
        projects: [],
        projectsLoading: false,
        projectActionLoading: false,
        projectFilesLoading: false,
        fileActionLoading: false,
        error: null,

        fetchUserProjects: async () => {
            set({ projectsLoading: true, error: null });
            try {
                const response = await api.get('/projects/');
                const transformedProjects = (response.data as any[]).map(transformProject);
                set({ projects: transformedProjects, projectsLoading: false });
            } catch (error: any) {
                set({ error: handleError(error, 'Failed to fetch projects'), projectsLoading: false });
                throw error;
            }
        },

        createProject: async (projectName: string) => {
            set({ projectActionLoading: true, error: null });
            try {
                const response = await api.post('/projects', { projectName });
                const newProject = transformProject(response.data);
                const projectfiles = await api.get(`/projects/${newProject.id}/files`);
                newProject.files = projectfiles.data as WebDevFile[];
                set(state => ({
                    projects: [...state.projects, newProject],
                    projectActionLoading: false,
                }));
                return newProject;
            } catch (error: any) {
                set({ error: handleError(error, 'Failed to create project'), projectActionLoading: false });
                throw error;
            }
            finally {
                set({ projectActionLoading: false });
            }
        },

        updateProject: async (projectId: string, projectName: string) => {
            set({ projectActionLoading: true, error: null });
            try {
                const response = await api.put('/projects', { projectId, projectName });
                const updatedProject = transformProject(response.data);

                const filesResponse = await api.get(`/projects/${projectId}/files`);
                updatedProject.files = filesResponse.data as WebDevFile[];

                set(state => ({
                    projects: state.projects.map(project =>
                        project.id === projectId ? updatedProject : project
                    ),
                    projectActionLoading: false,
                }));
            } catch (error: any) {
                set({ error: handleError(error, 'Failed to update project'), projectActionLoading: false });
                throw error;
            }
        },

        deleteProject: async (projectId: string) => {
            set({ projectActionLoading: true, error: null });
            try {
                await api.delete(`/projects/${projectId}`);
                set(state => ({
                    projects: state.projects.filter(project => project.id !== projectId),
                    projectActionLoading: false,
                }));
            } catch (error: any) {
                set({ error: handleError(error, 'Failed to delete project'), projectActionLoading: false });
                throw error;
            }
        },

        getProjectFiles: async (projectId: string) => {
            set({ projectFilesLoading: true, error: null });
            try {
                const response = await api.get(`/projects/${projectId}/files`);
                set(state => ({
                    projects: state.projects.map(project =>
                        project.id === projectId ? { ...project, files: response.data as WebDevFile[] } : project
                    ),
                    projectFilesLoading: false,
                }));
                return response.data;
            } catch (error: any) {
                set({ error: handleError(error, 'Failed to fetch project files'), projectFilesLoading: false });
                throw error;
            }
        },

        updateProjectFile: async (projectId: string, fileId: string, updates: Partial<WebDevFile>) => {
            set({ fileActionLoading: true, error: null });
            try {
                const response = await api.put(`/projects/${projectId}/files/${fileId}`, updates);
                const updatedFile: WebDevFile = response.data as WebDevFile;

                set(state => ({
                    projects: state.projects.map(project =>
                        project.id === projectId ? {
                            ...project,
                            files: project.files.map(file =>
                                file.id === fileId && updatedFile && typeof updatedFile === 'object'
                                    ? { ...file, ...updatedFile }
                                    : file
                            )
                        } : project
                    ),
                    fileActionLoading: false,
                }));
            } catch (error: any) {
                set({ error: handleError(error, 'Failed to update project file'), fileActionLoading: false });
                throw error;
            }
        },

        downloadProject: (projectId: string) => {
            const { projects } = get();
            const project = projects.find(p => p.id === projectId);

            if (!project) {
                console.error('Project not found');
                return;
            }

            const downloadAsZip = async () => {

                const zip = new JSZip();

                project.files.forEach(file => {
                    const fileName = `${file.name}${getFileExtension(file.type)}`;
                    const content = file.content || '';
                    zip.file(fileName, content);
                });

                const zipBlob = await zip.generateAsync({ type: 'blob' });

                const url = URL.createObjectURL(zipBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${project.name}.zip`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            };

            const getFileExtension = (type: string) => {
                switch (type) {
                    case "html":
                        return ".html";
                    case "css":
                        return ".css";
                    case "js":
                        return ".js";
                    default:
                        return "";
                }
            };

            downloadAsZip().catch(error => {
                console.error('Failed to download project:', error);
            });
        },

        runProject: (projectId: string) => {
            const { projects } = get();
            const project = projects.find(p => p.id === projectId);

            if (!project) {
                console.error('Project not found');
                return;
            }

            const htmlFile = project.files.find(f => f.type === 'html');
            const cssFile = project.files.find(f => f.type === 'css');
            const jsFile = project.files.find(f => f.type === 'js');

            let htmlContent =
                htmlFile?.content ||
                `<!DOCTYPE html>
<html><head><title>${project.name} - Preview</title></head>
<body><div style="text-align:center;padding:50px;">
<h1>No HTML file found</h1><p>Create an HTML file to see the preview.</p>
</div></body></html>`;

            if (cssFile?.content) {
                htmlContent = htmlContent.replace(
                    /<link[^>]*rel=["']stylesheet["'][^>]*href=["']styles\.css["'][^>]*>/gi,
                    ''
                );
                htmlContent = htmlContent.replace(
                    /<link[^>]*href=["']styles\.css["'][^>]*rel=["']stylesheet["'][^>]*>/gi,
                    ''
                );

                htmlContent = htmlContent.replace(
                    '</head>',
                    `<style>\n${cssFile.content}\n</style>\n</head>`
                );
            }

            if (jsFile?.content) {
                htmlContent = htmlContent.replace(
                    /<script[^>]*src=["']script\.js["'][^>]*><\/script>/gi,
                    ''
                );

                htmlContent = htmlContent.replace(
                    '</body>',
                    `<script>\n${jsFile.content}\n</script>\n</body>`
                );
            }

            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);

            const newWindow = window.open(url, '_blank', 'width=1200,height=800,resizable=yes,scrollbars=yes');

            setTimeout(() => URL.revokeObjectURL(url), 5000);

            if (newWindow) {
                newWindow.focus();
            } else {
                console.error('Failed to open new window. Popup might be blocked.');
            }
        },

        setError: (error) => set({ error }),
        clearError: () => set({ error: null }),
    }), { name: 'project-store' })
);