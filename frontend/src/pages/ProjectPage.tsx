import { useParams } from "react-router-dom";

export default function ProjectPage() {
  const params = useParams();
  return (
    <div className="h-full">
      <span>{params.projectId}</span>
      ProjectPage
    </div>
  );
}
