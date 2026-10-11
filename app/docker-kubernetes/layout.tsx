import { DOCKERK8S_SERIES } from "@/lib/iv";

/** Every /docker-kubernetes page carries the series accent. */
export default function DockerKubernetesLayout({ children }: { children: React.ReactNode }) {
  return <div data-page-accent={DOCKERK8S_SERIES.accent}>{children}</div>;
}
