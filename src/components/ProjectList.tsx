import { projects } from "../projects.ts";

export function ProjectList() {
  return (
    <section aria-label="projects">
      <ul className="border-t border-rule">
        {projects.map((project) => (
          <li key={project.name}>
            <a
              href={project.url}
              className="group grid grid-cols-1 items-baseline gap-0.5 border-b border-rule py-4 text-[clamp(1.125rem,2.2vw,1.375rem)] sm:grid-cols-[minmax(5.5rem,10rem)_1fr_auto] sm:gap-4"
            >
              <span className="font-medium transition-colors duration-200 group-hover:text-pen group-focus-visible:text-pen">
                {project.name}
              </span>
              <span className="min-w-0 text-ink-soft">{project.description}</span>
              <span
                aria-hidden="true"
                className="hidden -translate-x-1 text-lg text-pen opacity-0 transition duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 motion-reduce:transition-none sm:inline"
              >
                →
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
