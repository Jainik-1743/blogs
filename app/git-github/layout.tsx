import { GITGITHUB_SERIES } from "@/lib/iv";

/** Every /git-github page carries the series accent. */
export default function GitGithubLayout({ children }: { children: React.ReactNode }) {
  return <div data-page-accent={GITGITHUB_SERIES.accent}>{children}</div>;
}
