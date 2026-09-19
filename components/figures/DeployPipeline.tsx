import Figure from "./Figure";
import HopChain, { type Hop } from "./HopChain";

const hops: Hop[] = [
  { title: "Your laptop", desc: "git push origin main", tone: "plain", edge: "GitHub receives the commit" },
  { title: "GitHub Actions (CI)", desc: "installs, lints, runs tests, npm run build", tone: "sky", edge: "any step fails → stop here, nothing deployed" },
  { title: "Docker build", desc: "packages app + Node + deps into one image, pushed to a registry", tone: "purple", edge: "same image runs on your laptop and on EC2" },
  { title: "Deploy (CD)", desc: "EC2 pulls the image · or Terraform/ASG rolls new servers", tone: "warn", edge: "health check passes → old version retired" },
  { title: "PM2 / container restarted", desc: "zero-downtime reload", tone: "ok", edge: "Nginx keeps serving throughout" },
  { title: "Users", desc: "see the new version — minutes after the push, no SSH", tone: "plain" },
];

export default function DeployPipeline() {
  return (
    <Figure caption="From git push to live: the automated pipeline Lessons 9, 14 and 15 build. Lesson 7 does the same thing by hand first, so you understand every step the robot later performs.">
      <HopChain hops={hops} label="Deploy pipeline" />
    </Figure>
  );
}
