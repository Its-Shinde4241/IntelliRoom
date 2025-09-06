import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/store/authStore";
import { Separator } from "@radix-ui/react-separator";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

function Homepage() {
  const { isSigningOut, signOut } = useAuthStore();
  const handleSignot = async () => {
    try {
      await signOut();
      toast.success("signed out succefully", { position: "top-right" });
    } catch (error) {}
  };

  return (
    <>
      <div>
        {isSigningOut ? (
          <Loader2 />
        ) : (
          <>
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator
                  orientation="vertical"
                  className="mr-2 data-[orientation=vertical]:h-4"
                />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="#">
                        Building Your Application
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
            <div className="h-full flex flex-col align-middle justify-center">
              <center>
                <Button
                  variant={"outline"}
                  onClick={handleSignot}
                  className="cursor-pointer"
                >
                  Signout
                </Button>
              </center>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default Homepage;
