import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { FolderOpen, type LucideIcon } from 'lucide-react';
import { api } from '@/lib/axiosInstance';

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
    loading: boolean;
    error: string | null;

    // Actions
    fetchUserProjects: () => Promise<void>;
    createProject: (projectName: string) => Promise<Project>;
    updateProject: (projectId: string, projectName: string) => Promise<void>;
    deleteProject: (projectId: string) => Promise<void>;
    getProjectFiles: (projectId: string) => Promise<WebDevFile[]>;
    updateProjectFile: (projectId: string, fileId: string, updates: Partial<WebDevFile>) => Promise<void>;
    deleteProjectFile: (projectId: string, fileId: string) => Promise<void>;
    renameProjectFile: (projectId: string, fileId: string, newName: string) => Promise<void>;
    runProject: (projectId: string) => void;
    setLoading: (loading: boolean) => void;
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
        loading: false,
        error: null,

        fetchUserProjects: async () => {
            set({ loading: true, error: null });
            try {
                const response = await api.get('/projects/');
                const transformedProjects = (response.data as any[]).map(transformProject);
                set({ projects: transformedProjects, loading: false });
            } catch (error: any) {
                set({ error: handleError(error, 'Failed to fetch projects'), loading: false });
                throw error;
            }
        },

        createProject: async (projectName: string) => {
            set({ loading: true, error: null });
            try {
                const response = await api.post('/projects', { projectName });
                const newProject = transformProject(response.data);
                const projectfiles = await api.get(`/projects/${newProject.id}/files`);
                newProject.files = projectfiles.data as WebDevFile[];
                set(state => ({
                    projects: [...state.projects, newProject],
                    loading: false,
                }));
                return newProject;
            } catch (error: any) {
                set({ error: handleError(error, 'Failed to create project'), loading: false });
                throw error;
            }
            finally {
                set({ loading: false });
            }
        },

        updateProject: async (projectId: string, projectName: string) => {
            set({ loading: true, error: null });
            try {
                const response = await api.put('/projects', { projectId, projectName });
                const updatedProject = transformProject(response.data);

                // Fetch files to ensure they're included
                const filesResponse = await api.get(`/projects/${projectId}/files`);
                updatedProject.files = filesResponse.data as WebDevFile[];

                set(state => ({
                    projects: state.projects.map(project =>
                        project.id === projectId ? updatedProject : project
                    ),
                    loading: false,
                }));
            } catch (error: any) {
                set({ error: handleError(error, 'Failed to update project'), loading: false });
                throw error;
            }
        },

        deleteProject: async (projectId: string) => {
            set({ loading: true, error: null });
            try {
                await api.delete(`/projects/${projectId}`);
                set(state => ({
                    projects: state.projects.filter(project => project.id !== projectId),
                    loading: false,
                }));
            } catch (error: any) {
                set({ error: handleError(error, 'Failed to delete project'), loading: false });
                throw error;
            }
        },

        getProjectFiles: async (projectId: string) => {
            set({ error: null });
            try {
                const response = await api.get(`/projects/${projectId}/files`);
                set(state => ({
                    projects: state.projects.map(project =>
                        project.id === projectId ? { ...project, files: response.data as WebDevFile[] } : project
                    ),
                }));
                return response.data;
            } catch (error: any) {
                set({ error: handleError(error, 'Failed to fetch project files') });
                throw error;
            }
        },

        updateProjectFile: async (projectId: string, fileId: string, updates: Partial<WebDevFile>) => {
            set({ error: null });
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
                }));
            } catch (error: any) {
                set({ error: handleError(error, 'Failed to update project file') });
                throw error;
            }
        },

        deleteProjectFile: async (projectId: string, fileId: string) => {
            set({ error: null });
            try {
                await api.delete(`/projects/${projectId}/files/${fileId}`);
                set(state => ({
                    projects: state.projects.map(project =>
                        project.id === projectId ? {
                            ...project,
                            files: project.files.filter(file => file.id !== fileId)
                        } : project
                    ),
                }));
            } catch (error: any) {
                set({ error: handleError(error, 'Failed to delete project file') });
                throw error;
            }
        },

        renameProjectFile: async (projectId: string, fileId: string, newName: string) => {
            set({ error: null });
            try {
                const response = await api.put(`/projects/${projectId}/files/${fileId}`, { name: newName });
                const updatedFile = response.data;

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
                }));
            } catch (error: any) {
                set({ error: handleError(error, 'Failed to rename project file') });
                throw error;
            }
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

            // Inject CSS and JS into HTML
            if (cssFile?.content) {
                htmlContent = htmlContent.replace(
                    '</head>',
                    `<style>\n${cssFile.content}\n</style>\n</head>`
                );
            }
            if (jsFile?.content) {
                htmlContent = htmlContent.replace(
                    '</body>',
                    `<script>\n${jsFile.content}\n</script>\n</body>`
                );
            }

            // Create a sandboxed iframe wrapper
            const iframeWrapper = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${project.name} - Preview</title>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #111;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    iframe {
      border: none;
      width: 100%;
      height: 100%;
      background: white;
    }
  </style>
</head>
<body>
  <iframe 
    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
    srcdoc="${htmlContent.replace(/"/g, '&quot;').replace(/\n/g, ' ')}">
  </iframe>
</body>
</html>
`;

            // Create blob for iframe wrapper
            const blob = new Blob([iframeWrapper], { type: 'text/html' });
            const url = URL.createObjectURL(blob);

            // Open in new window
            const newWindow = window.open(url, '_blank', 'width=1200,height=800,resizable=yes,scrollbars=yes');

            // Clean up URL after load
            setTimeout(() => URL.revokeObjectURL(url), 5000);

            if (newWindow) {
                newWindow.focus();
            } else {
                console.error('Failed to open new window. Popup might be blocked.');
            }
        },


        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error }),
        clearError: () => set({ error: null }),
    }), { name: 'project-store' })
);