import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Flower2,
  ImagePlus,
  Leaf,
  MapPin,
  Palmtree,
  Send,
  Sparkles,
  Trees,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { getPortfolioProjects, submitProjectRequest } from "@/services/api";
import { useLanguage, useT } from "@/i18n/LanguageContext";
import type { ProjectRequestInput } from "@/types";

export const Route = createFileRoute("/projects")({
  component: ProjectsPage,
  head: () => ({
    meta: [
      { title: "Plant Projects — Jothour | جذور" },
      {
        name: "description",
        content: "Balcony, villa, office, garden, and landscape plant design services.",
      },
    ],
  }),
});

const schema = z.object({
  fullName: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(6).max(30),
  city: z.string().trim().min(2).max(100),
  projectType: z.enum(["balcony", "villa", "landscape", "office", "garden", "maintenance"]),
  spaceSize: z.string().trim().max(100).optional(),
  budget: z.string().trim().max(100).optional(),
  preferredContactTime: z.string().trim().max(100).optional(),
  details: z.string().trim().min(10).max(2000),
});

const initialForm: ProjectRequestInput = {
  fullName: "",
  email: "",
  phone: "",
  city: "",
  projectType: "balcony",
  spaceSize: "",
  budget: "",
  preferredContactTime: "",
  details: "",
};

function ProjectsPage() {
  const t = useT();
  const { lang } = useLanguage();
  const { data: portfolio = [] } = useQuery({
    queryKey: ["project-portfolio"],
    queryFn: getPortfolioProjects,
  });
  const [form, setForm] = useState<ProjectRequestInput>(initialForm);
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [requestNumber, setRequestNumber] = useState("");

  const services = [
    { type: "balcony", icon: Flower2 },
    { type: "villa", icon: Palmtree },
    { type: "landscape", icon: Trees },
    { type: "office", icon: Building2 },
    { type: "garden", icon: Leaf },
    { type: "maintenance", icon: Sparkles },
  ] as const;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        nextErrors[String(issue.path[0])] = t("projects.required");
      });
      setErrors(nextErrors);
      toast.error(t("projects.fixErrors"));
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const result = await submitProjectRequest(parsed.data, files);
      setRequestNumber(result.requestNumber);
      setForm(initialForm);
      setFiles([]);
      toast.success(t("projects.sent"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("projects.error"));
    } finally {
      setSubmitting(false);
    }
  };

  if (requestNumber) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-accent text-primary">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="mt-6 font-display text-4xl font-semibold">{t("projects.successTitle")}</h1>
        <p className="mt-3 text-muted-foreground">
          {t("projects.successBody", { id: requestNumber })}
        </p>
        <button
          type="button"
          onClick={() => setRequestNumber("")}
          className="mt-8 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          {t("projects.newRequest")}
        </button>
      </main>
    );
  }

  return (
    <main>
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="max-w-3xl motion-safe:animate-[reveal-up_650ms_ease-out_both]">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              {t("projects.eyebrow")}
            </p>
            <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight sm:text-6xl">
              {t("projects.title")}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              {t("projects.subtitle")}
            </p>
            <a
              href="#request-project"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
            >
              {t("projects.cta")} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            {t("projects.servicesEyebrow")}
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
            {t("projects.servicesTitle")}
          </h2>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map(({ type, icon: Icon }) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                setForm((current) => ({ ...current, projectType: type }));
                document.getElementById("request-project")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="group rounded-3xl border border-border/60 bg-card p-6 text-start transition duration-300 motion-safe:hover:-translate-y-1 hover:shadow-[var(--shadow-card)]"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="h-6 w-6" />
              </span>
              <span className="mt-5 block font-display text-xl font-semibold">
                {t(`projects.service.${type}.title`)}
              </span>
              <span className="mt-2 block text-sm leading-relaxed text-muted-foreground">
                {t(`projects.service.${type}.text`)}
              </span>
            </button>
          ))}
        </div>
      </section>

      {portfolio.length > 0 && (
        <section className="border-y border-border/60 bg-background py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                {t("projects.portfolioEyebrow")}
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
                {t("projects.portfolioTitle")}
              </h2>
              <p className="mt-3 text-muted-foreground">{t("projects.portfolioText")}</p>
            </div>
            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {portfolio.map((project) => {
                const title = lang === "ar" ? (project.titleAr ?? project.title) : project.title;
                const description =
                  lang === "ar"
                    ? (project.descriptionAr ?? project.description)
                    : project.description;
                const location =
                  lang === "ar" ? (project.locationAr ?? project.location) : project.location;
                return (
                  <article
                    key={project.id}
                    className="group overflow-hidden rounded-3xl border border-border/60 bg-card shadow-[var(--shadow-card)] transition duration-300 motion-safe:hover:-translate-y-1"
                  >
                    <Link to="/projects/$id" params={{ id: project.id }} className="block">
                      {project.images.length > 0 && (
                        <div className="grid grid-cols-3 gap-1 overflow-hidden bg-muted">
                          <img
                            src={project.images[0]}
                            alt={title}
                            loading="lazy"
                            className="col-span-3 aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-[1.02] sm:col-span-2 sm:row-span-2"
                          />
                          {project.images.slice(1, 3).map((image, index) => (
                            <img
                              key={image}
                              src={image}
                              alt={`${title} ${index + 2}`}
                              loading="lazy"
                              className="hidden h-full min-h-0 w-full object-cover sm:block"
                            />
                          ))}
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-primary">
                          <span className="rounded-full bg-accent px-2.5 py-1">
                            {t(`projects.service.${project.projectType}.title`)}
                          </span>
                          {location && (
                            <span className="inline-flex items-center gap-1 text-muted-foreground">
                              <MapPin className="h-3.5 w-3.5" /> {location}
                            </span>
                          )}
                        </div>
                        <h3 className="mt-4 font-display text-2xl font-semibold">{title}</h3>
                        {description && (
                          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                            {description}
                          </p>
                        )}
                        <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                          {t("projects.viewProject")}{" "}
                          <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                        </span>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section id="request-project" className="bg-secondary/40 py-16 scroll-mt-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[.8fr_1.2fr] lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              {t("projects.formEyebrow")}
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
              {t("projects.formTitle")}
            </h2>
            <p className="mt-4 text-muted-foreground">{t("projects.formText")}</p>
            <ol className="mt-8 space-y-4 text-sm">
              {(
                [
                  "projects.step.send",
                  "projects.step.contact",
                  "projects.step.design",
                  "projects.step.execute",
                ] as const
              ).map((step, index) => (
                <li key={step} className="flex items-center gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {index + 1}
                  </span>
                  {t(step)}
                </li>
              ))}
            </ol>
          </div>

          <form
            onSubmit={submit}
            className="rounded-[2rem] border border-border/60 bg-card p-6 shadow-[var(--shadow-card)] sm:p-8"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("checkout.field.fullName")} error={errors.fullName}>
                <input
                  className={inputClass}
                  value={form.fullName}
                  onChange={(event) => setForm({ ...form, fullName: event.target.value })}
                />
              </Field>
              <Field label={t("checkout.field.phone")} error={errors.phone}>
                <input
                  className={inputClass}
                  value={form.phone}
                  onChange={(event) => setForm({ ...form, phone: event.target.value })}
                />
              </Field>
              <Field label={t("checkout.field.email")} error={errors.email}>
                <input
                  type="email"
                  className={inputClass}
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                />
              </Field>
              <Field label={t("checkout.field.city")} error={errors.city}>
                <input
                  className={inputClass}
                  value={form.city}
                  onChange={(event) => setForm({ ...form, city: event.target.value })}
                />
              </Field>
              <Field label={t("projects.projectType")} error={errors.projectType}>
                <select
                  className={inputClass}
                  value={form.projectType}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      projectType: event.target.value as ProjectRequestInput["projectType"],
                    })
                  }
                >
                  {services.map(({ type }) => (
                    <option key={type} value={type}>
                      {t(`projects.service.${type}.title`)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t("projects.spaceSize")}>
                <input
                  className={inputClass}
                  placeholder={t("projects.spaceSizePlaceholder")}
                  value={form.spaceSize}
                  onChange={(event) => setForm({ ...form, spaceSize: event.target.value })}
                />
              </Field>
              <Field label={t("projects.budget")}>
                <input
                  className={inputClass}
                  placeholder={t("projects.budgetPlaceholder")}
                  value={form.budget}
                  onChange={(event) => setForm({ ...form, budget: event.target.value })}
                />
              </Field>
              <Field label={t("projects.contactTime")}>
                <input
                  className={inputClass}
                  placeholder={t("projects.contactTimePlaceholder")}
                  value={form.preferredContactTime}
                  onChange={(event) =>
                    setForm({ ...form, preferredContactTime: event.target.value })
                  }
                />
              </Field>
              <Field label={t("projects.details")} error={errors.details} className="sm:col-span-2">
                <textarea
                  rows={5}
                  className={`${inputClass} resize-none`}
                  placeholder={t("projects.detailsPlaceholder")}
                  value={form.details}
                  onChange={(event) => setForm({ ...form, details: event.target.value })}
                />
              </Field>
            </div>

            <div className="mt-5">
              <p className="text-sm font-medium">{t("projects.images")}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t("projects.imagesHint")}</p>
              <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-background p-5 text-sm text-muted-foreground transition hover:border-primary hover:text-primary">
                <ImagePlus className="h-5 w-5" /> {t("projects.chooseImages")}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="sr-only"
                  onChange={(event) => {
                    const selected = Array.from(event.target.files ?? []).slice(0, 5);
                    const valid = selected.filter((file) => file.size <= 5 * 1024 * 1024);
                    if (valid.length !== selected.length) toast.error(t("projects.imageTooLarge"));
                    setFiles(valid);
                  }}
                />
              </label>
              {files.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {files.map((file, index) => (
                    <li
                      key={`${file.name}-${file.lastModified}`}
                      className="flex items-center justify-between rounded-xl bg-accent/50 px-3 py-2 text-xs"
                    >
                      <span className="truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => setFiles((current) => current.filter((_, i) => i !== index))}
                        aria-label="Remove"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? t("projects.sending") : t("projects.submit")}
              <Send className="h-4 w-4 rtl:rotate-180" />
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  error,
  className = "",
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";
