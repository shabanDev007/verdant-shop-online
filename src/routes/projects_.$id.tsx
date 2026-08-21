import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, MapPin, X, ZoomIn } from "lucide-react";
import { getPortfolioProject } from "@/services/api";
import { useLanguage, useT } from "@/i18n/LanguageContext";

export const Route = createFileRoute("/projects_/$id")({
  component: ProjectDetailPage,
  head: () => ({ meta: [{ title: "Project Details — Jothour | جذور" }] }),
});

function ProjectDetailPage() {
  const { id } = Route.useParams();
  const { lang } = useLanguage();
  const t = useT();
  const [activeImage, setActiveImage] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const { data: project, isLoading } = useQuery({
    queryKey: ["project-portfolio", id],
    queryFn: () => getPortfolioProject(id),
  });

  useEffect(() => {
    if (!lightbox) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && setLightbox(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [lightbox]);

  if (isLoading) {
    return <div className="mx-auto my-16 h-[70vh] max-w-7xl animate-pulse rounded-3xl bg-muted" />;
  }
  if (!project) throw notFound();

  const title = lang === "ar" ? (project.titleAr ?? project.title) : project.title;
  const description =
    lang === "ar" ? (project.descriptionAr ?? project.description) : project.description;
  const location = lang === "ar" ? (project.locationAr ?? project.location) : project.location;
  const hero = project.images[activeImage] ?? project.images[0];

  return (
    <main className="pb-20">
      <section className="relative min-h-[70vh] overflow-hidden bg-foreground text-background">
        {hero && (
          <img
            key={hero}
            src={hero}
            alt={title}
            className="absolute inset-0 h-full w-full animate-[gallery-in_500ms_ease-out] object-cover opacity-70"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/15" />
        <div className="relative mx-auto flex min-h-[70vh] max-w-7xl flex-col justify-between px-4 py-8 sm:px-6 lg:px-8">
          <Link
            to="/projects"
            className="inline-flex w-fit items-center gap-2 rounded-full bg-black/30 px-4 py-2 text-sm text-white backdrop-blur-md"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t("projects.back")}
          </Link>
          <div className="max-w-4xl pb-8 text-white motion-safe:animate-[reveal-up_650ms_ease-out_both]">
            <p className="text-xs font-semibold uppercase tracking-[.24em] text-white/75">
              {t(`projects.service.${project.projectType}.title`)}
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold sm:text-6xl lg:text-7xl">
              {title}
            </h1>
            <div className="mt-5 flex flex-wrap gap-4 text-sm text-white/80">
              {location && (
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> {location}
                </span>
              )}
              {project.completedAt && (
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  {new Date(project.completedAt).toLocaleDateString(
                    lang === "ar" ? "ar-EG" : "en-GB",
                    { year: "numeric", month: "long" },
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[.75fr_1.25fr] lg:px-8">
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            {t("projects.detailEyebrow")}
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold">{t("projects.detailTitle")}</h2>
          <p className="mt-5 whitespace-pre-line leading-8 text-muted-foreground">{description}</p>
          <a
            href="/projects#request-project"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
          >
            {t("projects.similarCta")} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </a>
        </div>

        <div>
          {hero && (
            <button
              type="button"
              onClick={() => setLightbox(true)}
              className="group relative block w-full overflow-hidden rounded-[2rem]"
            >
              <img src={hero} alt={title} className="aspect-[4/3] w-full object-cover" />
              <span className="absolute bottom-4 end-4 grid h-11 w-11 place-items-center rounded-full bg-background/90 text-foreground opacity-0 shadow-lg transition group-hover:opacity-100">
                <ZoomIn className="h-5 w-5" />
              </span>
            </button>
          )}
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {project.images.map((image, index) => (
              <button
                key={image}
                type="button"
                onClick={() => setActiveImage(index)}
                className={`overflow-hidden rounded-2xl border-2 transition ${
                  activeImage === index ? "border-primary" : "border-transparent"
                }`}
              >
                <img
                  src={image}
                  alt={`${title} ${index + 1}`}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover transition duration-500 hover:scale-105"
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      {lightbox && hero && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-black/90 p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            aria-label={t("projects.closeGallery")}
            onClick={() => setLightbox(false)}
            className="absolute end-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={hero}
            alt={title}
            className="max-h-[90vh] max-w-[95vw] rounded-2xl object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </main>
  );
}
