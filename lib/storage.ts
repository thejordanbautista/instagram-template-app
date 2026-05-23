import { TemplateProject } from "@/types/editor";

const PROJECTS_KEY = "mixdro-editor-projects";

export function loadProjects(): TemplateProject[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(PROJECTS_KEY);
    return raw ? (JSON.parse(raw) as TemplateProject[]) : [];
  } catch {
    return [];
  }
}

export function saveProjects(projects: TemplateProject[]) {
  window.localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export function upsertProject(project: TemplateProject) {
  const projects = loadProjects();
  const next = [project, ...projects.filter((item) => item.id !== project.id)];
  saveProjects(next);
  return next;
}

export function deleteProject(projectId: string) {
  const next = loadProjects().filter((item) => item.id !== projectId);
  saveProjects(next);
  return next;
}
