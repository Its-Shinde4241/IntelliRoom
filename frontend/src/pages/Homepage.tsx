import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useProjectStore } from "@/store/projectStore";
import useFileStore from "@/store/fileStore";
import useRoomStore from "@/store/roomStore";
import {
  FolderPlus,
  Settings,
  Users
} from "lucide-react";
import NewProjectPopover from "@/components/NewProjectPopover";
import NewRoomPopover from "@/components/NewRoomPopover";

function Homepage() {
  const { projects, createProject } = useProjectStore();
  const { files } = useFileStore();
  const { rooms, createRoom } = useRoomStore();

  // Handler functions for popovers
  const handleCreateProject = async (projectName: string) => {
    try {
      await createProject(projectName);
      return true;
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error;
    }
  };



  const handleCreateRoom = async (roomName: string, password: string) => {
    try {
      await createRoom(roomName, password);
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  };

  // Get recent items from stores
  interface RecentItem {
    id: string;
    name: string;
    type: "project" | "file" | "room";
    lastModified: string;
  }

  const recentItems: RecentItem[] = [
    ...projects.slice(0, 3).map((project): RecentItem => ({
      id: project.id,
      name: project.name,
      type: "project" as const,
      lastModified: new Date(project.updatedAt || project.createdAt || new Date()).toLocaleDateString()
    })),
    ...files.slice(0, 2).map((file): RecentItem => ({
      id: file.id,
      name: file.name,
      type: "file" as const,
      lastModified: new Date(file.updatedAt || file.createdAt || new Date()).toLocaleDateString()
    })),
    ...rooms.slice(0, 2).map((room): RecentItem => ({
      id: room.id,
      name: room.name,
      type: "room" as const,
      lastModified: new Date(room.updatedAt || room.createdAt || new Date()).toLocaleDateString()
    }))
  ].slice(0, 5);

  return (
    <div className="h-full">
      {/* Sticky Sidebar Trigger */}

      {/* Main Content */}
      <main className="h-full overflow-hidden relative">
        <div className="fixed top-3 pl-1 z-50">
          <SidebarTrigger />
        </div>
        <div className="max-w-6xl mx-auto px-6 h-full flex flex-col justify-center">
          {/* Welcome Section */}
          <div className="text-center space-y-2 mb-8">
            <div className="text-8xl font-black text-muted-foreground/20 select-none tracking-wider mb-2">
              IntelliRoom
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome to IntelliRoom
            </h1>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              Your intelligent IDE. Create projects, manage files, and build amazing websites.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Quick Actions */}
            <div className="lg:col-span-3">
              <div>
                <h2 className="text-2xl font-semibold mb-4">Get Started</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                  {/* New Project Card */}
                  <Card className="hover:shadow-lg hover:scale-105 transition-all duration-200 border-2 hover:border-primary/20">
                    <CardHeader className="pb-2">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/15 rounded-lg">
                          <FolderPlus className="h-5 w-5 text-primary" />
                        </div>
                        <CardTitle className="text-lg">New Project</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm mb-3">
                        Start a fresh project and organize your code files.
                      </CardDescription>
                      <NewProjectPopover onCreateProject={handleCreateProject} />
                    </CardContent>
                  </Card>

                  {/* New Room Card */}
                  <Card className="hover:shadow-lg hover:scale-105 transition-all duration-200 border-2 hover:border-primary/20">
                    <CardHeader className="pb-2">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-500/15 rounded-lg">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <CardTitle className="text-lg">New Room</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm mb-3">
                        Create a workspace for practice and teamwork.
                      </CardDescription>
                      <NewRoomPopover onCreateRoom={handleCreateRoom} />
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Features Overview */}
              <div className="mt-10">
                <h2 className="text-2xl font-semibold mb-4">Why IntelliRoom?</h2>
                <Card className="p-6 bg-muted/20 border-0">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-3 mb-3">
                      <Settings className="h-6 w-6 text-primary" />
                      <h3 className="text-lg font-semibold">Intelligent Development Environment</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Advanced code editing with syntax highlighting, intelligent autocomplete, and seamless project management.
                      Built for developers who value efficiency and collaboration.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Recent Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Recent</CardTitle>
                  <CardDescription>Your recently accessed items</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentItems.length > 0 ? (
                    recentItems.map((item, index) => (
                      <div key={`${item.type}-${item.id}-${index}`} className="flex items-center space-x-2 p-2 rounded hover:bg-muted/50 cursor-pointer transition-colors">
                        <div className="p-1">
                          {item.type === 'project' ? (
                            <FolderPlus className="h-3 w-3 text-blue-500" />
                          ) : item.type === 'file' ? (
                            <Settings className="h-3 w-3 text-green-500" />
                          ) : (
                            <Users className="h-3 w-3 text-purple-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.lastModified}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <FolderPlus className="h-6 w-6 mx-auto mb-1 opacity-50" />
                      <p className="text-xs">No recent items</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Homepage;