"use client";

import { useEffect } from "react";
import { Edit3, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { TemplateUploader } from "@/components/TemplateUploader";
import { deleteProject, loadProjects, upsertProject } from "@/lib/storage";
import { useEditorStore } from "@/lib/store";
import { TemplateProject } from "@/types/editor";

export default function HomePage() {
  const { projects, setProjects, setCurrentProject } = useEditorStore();
  const router = useRouter();

  useEffect(() => {
    setProjects(loadProjects());
  }, [setProjects]);

  function openProject(project: TemplateProject) {
    setCurrentProject(project);
    try {
      window.sessionStorage.setItem("mixdro-current-project", project.id);
    } catch (error) {
      console.warn("Could not write editor session handoff.", error);
    }
    router.push(`/editor?id=${encodeURIComponent(project.id)}`);
  }

  function importProject(project: TemplateProject) {
    try {
      setProjects(upsertProject(project));
    } catch (error) {
      console.warn("Project opened without local save.", error);
    }
    openProject(project);
  }

  return (
    <main className="min-h-screen bg-ink">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
        <header className="flex items-center justify-between border-b border-line pb-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight">MixDro Local Editor</h1>
            <p className="mt-1 text-sm text-white/45">Personal HTML template editing, saved in this browser.</p>
          </div>
          <TemplateUploader onProject={importProject} />
        </header>

        <section className="grid flex-1 content-start gap-4 py-8 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <article className="rounded border border-line bg-panel p-4" key={project.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-bold">{project.name}</h2>
                  <p className="mt-1 truncate text-xs text-white/40">{project.originalFileName}</p>
                </div>
                <button
                  className="rounded border border-line p-2 text-white/45 hover:border-rose hover:text-rose"
                  onClick={() => setProjects(deleteProject(project.id))}
                  title="Delete project"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="mt-5 flex items-center justify-between text-xs text-white/40">
                <span>{project.elements.length} editable layers</span>
                <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
              </div>
              <button
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-bold text-black transition hover:bg-zinc-200"
                onClick={() => openProject(project)}
              >
                <Edit3 size={15} />
                Open
              </button>
            </article>
          ))}

          {projects.length === 0 ? (
            <div className="col-span-full flex min-h-[420px] items-center justify-center rounded border border-dashed border-line bg-panel/55 p-6">
              <div className="max-w-sm text-center">
                <h2 className="text-xl font-bold">Upload a template to start.</h2>
                <p className="mt-2 text-sm leading-6 text-white/45">
                  HTML files are parsed locally, and your project saves stay in localStorage.
                </p>
                <div className="mt-5">
                  <TemplateUploader large onProject={importProject} />
                </div>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
