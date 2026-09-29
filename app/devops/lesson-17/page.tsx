import type { Metadata } from "next";
import Callout from "@/components/Callout";
import CommandList from "@/components/CommandList";
import InterviewQA from "@/components/InterviewQA";
import LessonIntro from "@/components/LessonIntro";
import LessonPager from "@/components/LessonPager";
import Script from "@/components/Script";
import { getLesson } from "@/lib/lessons";

const lesson = getLesson("lesson-17")!;

export const metadata: Metadata = {
  title: `Lesson 17 — ${lesson.title}`,
  description: lesson.summary,
};

const outline = [
  { id: "concept", label: "Concept: knowing before your users tell you" },
  { id: "why-this-matters", label: "Why this matters" },
  { id: "pillars", label: "Metrics, logs and traces" },
  { id: "signals", label: "The four golden signals" },
  { id: "vocabulary", label: "CloudWatch vocabulary" },
  { id: "free", label: "What you get for free — and what is missing" },
  { id: "alerts-channel", label: "Step 1 — a channel that reaches you" },
  { id: "alarms", label: "Step 2 — the alarms every production app needs" },
  { id: "logs", label: "Step 3 — get the logs off the server" },
  { id: "structured", label: "Step 4 — write logs you can actually search" },
  { id: "insights", label: "Step 5 — search with Logs Insights" },
  { id: "metrics-from-logs", label: "Step 6 — turn logs and business events into metrics" },
  { id: "agent", label: "Step 7 — memory and disk with the CloudWatch agent" },
  { id: "dashboard", label: "Step 8 — one dashboard" },
  { id: "alerting", label: "How to alert without burning out your team" },
  { id: "incident", label: "When the alarm fires: a debugging routine" },
  { id: "cost", label: "What this costs, and the log bill trap" },
  { id: "troubleshooting", label: "Troubleshooting table" },
  { id: "interview", label: "Interview corner" },
  { id: "practice", label: "Practice task before Lesson 18" },
  { id: "conclusion", label: "Conclusion" },
];

const pillars: [string, string, string, string][] = [
  ["Metrics", "Numbers over time, cheap to store and query", "“How many 5xx per minute? What is CPU?”", "CloudWatch Metrics, dashboards, alarms"],
  ["Logs", "Timestamped events with detail", "“What exactly happened to request abc123?”", "CloudWatch Logs, Logs Insights"],
  ["Traces", "One request followed across every service and query", "“Where did those 3 seconds go?”", "AWS X-Ray, OpenTelemetry"],
];

const golden: [string, string, string, string][] = [
  ["Latency", "How long requests take (use percentiles: p50, p95, p99, not averages)", "ALB TargetResponseTime", "RDS ReadLatency"],
  ["Traffic", "How much demand there is", "ALB RequestCount", "Redis commands/s"],
  ["Errors", "How many requests fail", "ALB HTTPCode_Target_5XX_Count", "App error logs"],
  ["Saturation", "How full the resources are", "ASG CPU, memory, disk %", "RDS connections, FreeStorageSpace, Redis memory"],
];

const alarmList: [string, string, string, string][] = [
  ["Users are seeing errors", "ALB HTTPCode_Target_5XX_Count", "≥ 5 per minute, 2 of 3 minutes", "The primary symptom alarm"],
  ["The site is too slow", "ALB TargetResponseTime p95", "> 1 second for 5 minutes", "Slowness hurts before errors appear"],
  ["A server is failing", "ALB UnHealthyHostCount", "≥ 1 for 3 minutes", "Auto Scaling will replace it; you should still know why"],
  ["No servers left", "ALB HealthyHostCount", "< 1 for 1 minute", "Total outage. Page a human"],
  ["Nobody can reach us at all", "ALB RequestCount", "< 1 for 10 minutes (treat missing as breaching)", "Catches DNS/cert/ALB failures that produce no errors"],
  ["Database CPU", "RDS CPUUtilization", "> 80% for 10 minutes", "Missing index or undersized instance"],
  ["Database disk", "RDS FreeStorageSpace", "< 5 GB", "Full disk freezes the database"],
  ["Database connections", "RDS DatabaseConnections", "> 80% of max_connections", "The scaling outage from Lesson 8"],
  ["Cache memory", "ElastiCache DatabaseMemoryUsagePercentage", "> 80%", "Evictions and OOM ahead"],
  ["Server memory / disk", "CWAgent mem_used_percent, used_percent", "> 85%", "EC2 does not report these by default"],
  ["Money", "AWS Budget / EstimatedCharges", "80% of budget", "Lesson 5's alarm, still the most valuable"],
];

const trouble: [string, string, string][] = [
  ["Alarm fired but no email arrived", "The SNS email subscription was never confirmed (or landed in spam)", "aws sns list-subscriptions-by-topic — “PendingConfirmation” means click the link in the confirmation email"],
  ["Alarm stuck on INSUFFICIENT_DATA", "No data points: wrong dimension value, wrong namespace, or a metric that only exists when events occur", "Look up the exact dimension in the console’s Metrics view; set --treat-missing-data appropriately"],
  ["Log group exists but has no events", "The role lacks logs:PutLogEvents, the driver/agent is not running, or wrong region", "Check the role policy; docker logs myapp for driver errors; confirm the region"],
  ["Logs Insights shows no fields for my JSON", "The log lines are not valid JSON (a prefix, or multi-line stack traces)", "Log one JSON object per line; put stack traces in a field"],
  ["Memory/disk metrics missing", "The CloudWatch agent is not installed, or the role lacks CloudWatchAgentServerPolicy", "systemctl status amazon-cloudwatch-agent; check /opt/aws/amazon-cloudwatch-agent/logs/"],
  ["Alarm flaps between OK and ALARM", "Threshold sits at normal noise, period too short", "Use more evaluation periods, datapoints-to-alarm, or a longer period"],
  ["The bill jumped after enabling logging", "Verbose debug logging, or every health check logged", "Filter out health checks; set LOG_LEVEL=info; set retention"],
  ["Dashboards show data from the wrong region", "The console region selector is not ap-south-1", "Switch region; CloudWatch is regional"],
];

export default function LessonSeventeenPage() {
  return (
    <article>
      <LessonIntro lesson={lesson} outline={outline} />

      <div className="lesson">
        <h2 id="concept">Concept</h2>
        <p>
          <strong>Monitoring</strong> is how you find out what your system is doing right now, and{" "}
          <strong>alerting</strong> is how the system tells <em>you</em> when something is wrong. On
          AWS the built-in tool is <strong>CloudWatch</strong>: it collects numbers (metrics), text
          (logs), draws them on dashboards, and sends a message when a number crosses a line
          (alarms).
        </p>
        <Callout kind="note" label="The analogy — a car">
          <p className="mb-0">
            The <strong>dashboard</strong> shows speed and fuel at a glance (metrics). The{" "}
            <strong>warning lights</strong> tell you before the engine seizes (alarms). The{" "}
            <strong>black-box recorder</strong> lets investigators reconstruct what happened after a
            crash (logs). A car with none of these still drives — until it does not, with no warning
            and no explanation.
          </p>
        </Callout>

        <h2 id="why-this-matters">Why this matters</h2>
        <ul>
          <li>
            <strong>Without monitoring, your customers are your alarm system.</strong> The first sign
            of trouble becomes an angry email or a tweet. You learn about an outage from the person
            paying you.
          </li>
          <li>
            <strong>&ldquo;It is slow&rdquo; is unanswerable without data.</strong> Slow where? Since
            when? After which deploy? For whom? Metrics and logs answer in seconds what guessing takes
            hours to.
          </li>
          <li>
            <strong>Everything you built can fail silently.</strong> A full disk, a database that hit
            its connection limit, an expired certificate, a health check flapping, an Auto Scaling
            group stuck at its maximum — all of them look like &ldquo;the site works for me&rdquo;
            until it does not.
          </li>
          <li>
            <strong>You need proof it is fixed.</strong> After a change, the graph either returned to
            normal or it did not.
          </li>
          <li>
            <strong>Capacity and cost planning</strong> are impossible without history: how much
            traffic grows month to month, what the peak looks like.
          </li>
        </ul>

        <h2 id="pillars">Metrics, logs and traces</h2>
        <p>
          The three kinds of telemetry answer different questions. You want all three, but in this
          order of priority:
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Kind</th>
                <th>What it is</th>
                <th>Answers</th>
                <th>AWS tool</th>
              </tr>
            </thead>
            <tbody>
              {pillars.map(([k, w, a, t]) => (
                <tr key={k}>
                  <td className="whitespace-nowrap"><strong>{k}</strong></td>
                  <td>{w}</td>
                  <td>{a}</td>
                  <td>{t}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          <strong>Metrics tell you <em>that</em> something is wrong; logs tell you <em>why</em>.</strong>{" "}
          A typical investigation starts on a graph (5xx rose at 14:02), then jumps to the logs for
          that minute (a database timeout on one endpoint), and only for complex multi-service systems
          reaches for traces. For a monolith like ours, metrics plus good logs cover 95% of problems.
        </p>

        <h2 id="signals">The four golden signals</h2>
        <p>
          Google&apos;s site-reliability book boiled down &ldquo;what should I watch?&rdquo; to four
          things. If you monitor only these, you already see almost every user-visible problem:
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Signal</th>
                <th>Question</th>
                <th>Where in our stack</th>
                <th>And also</th>
              </tr>
            </thead>
            <tbody>
              {golden.map(([s, q, w, a]) => (
                <tr key={s}>
                  <td className="whitespace-nowrap"><strong>{s}</strong></td>
                  <td>{q}</td>
                  <td>{w}</td>
                  <td>{a}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Callout kind="warn" label="Averages lie — use percentiles">
          <p className="mb-0">
            If 99 requests take 100 ms and one takes 10 seconds, the average is 200 ms and looks
            fine, while one user in a hundred is suffering. <strong>p95</strong> means &ldquo;95% of
            requests were faster than this&rdquo;; <strong>p99</strong> shows the tail. Alert and
            report on percentiles.
          </p>
        </Callout>
        <p>
          Two mnemonics you will hear: <strong>RED</strong> for services (Rate, Errors, Duration) and{" "}
          <strong>USE</strong> for resources (Utilisation, Saturation, Errors). They are the same
          ideas from two angles.
        </p>

        <h2 id="vocabulary">CloudWatch vocabulary</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Word</th>
                <th>Meaning</th>
                <th>Example</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><strong>Namespace</strong></td><td>A folder for a service&apos;s metrics</td><td><code>AWS/ApplicationELB</code>, <code>MyApp</code></td></tr>
              <tr><td><strong>Metric</strong></td><td>A named series of numbers over time</td><td><code>HTTPCode_Target_5XX_Count</code></td></tr>
              <tr><td><strong>Dimension</strong></td><td>A label that picks one thing out of many</td><td><code>LoadBalancer=app/myapp-alb/…</code></td></tr>
              <tr><td><strong>Statistic</strong></td><td>How to combine points in a period</td><td>Sum, Average, Maximum, p95</td></tr>
              <tr><td><strong>Period</strong></td><td>The width of each bucket, in seconds</td><td>60</td></tr>
              <tr><td><strong>Alarm</strong></td><td>A rule on a metric with three states: <code>OK</code>, <code>ALARM</code>, <code>INSUFFICIENT_DATA</code></td><td>&ldquo;5xx ≥ 5 for 2 of 3 minutes&rdquo;</td></tr>
              <tr><td><strong>Log group / stream</strong></td><td>A collection of logs for one purpose / one source inside it</td><td><code>/myapp/web</code> / one per container</td></tr>
              <tr><td><strong>SNS topic</strong></td><td>A broadcast channel alarms publish to; email, SMS, Slack (via Chatbot) subscribe</td><td><code>myapp-alerts</code></td></tr>
            </tbody>
          </table>
        </div>

        <h2 id="free">What you get for free — and what is missing</h2>
        <p>
          The moment you create resources, AWS starts publishing metrics for them at no charge:
        </p>
        <ul>
          <li>
            <strong>EC2</strong>: CPU, network in/out, disk operations, status checks — every{" "}
            <strong>5 minutes</strong> (1 minute with &ldquo;detailed monitoring&rdquo;, about $2 per
            instance per month).
          </li>
          <li>
            <strong>ALB</strong>: request count, response codes, latency, healthy/unhealthy hosts.{" "}
            <strong>RDS</strong>: CPU, connections, free storage, IOPS, latency.{" "}
            <strong>ElastiCache</strong>: memory, hit rate, evictions.
          </li>
        </ul>
        <Callout kind="warn" label="EC2 does NOT report memory or disk space">
          <p className="mb-0">
            The hypervisor can see CPU and network, but not what is inside the operating system. So
            &ldquo;memory 95%&rdquo; and &ldquo;disk 98% full&rdquo; — two of the most common causes of
            crashes — are invisible until you install the <strong>CloudWatch agent</strong> (Step 7).
            Do not assume &ldquo;AWS monitors my server&rdquo; covers them.
          </p>
        </Callout>
        <p>
          Nothing collects your <strong>application logs</strong> by default either. They sit in a
          Docker file on a server that Auto Scaling may delete at any moment — with the evidence.
        </p>

        <h2 id="alerts-channel">Step 1 — a channel that reaches you</h2>
        <p>
          An alarm needs somewhere to send its message. <strong>SNS</strong> (Simple Notification
          Service) is the broadcast channel. Start with email; upgrade to Slack or a pager later
          without touching any alarm.
        </p>
        <Script
          title="an alerts topic"
          code={`export AWS_REGION=ap-south-1

TOPIC_ARN=$(aws sns create-topic --name myapp-alerts --query TopicArn --output text)
aws sns subscribe --topic-arn $TOPIC_ARN --protocol email --notification-endpoint you@yourapp.com
echo "export TOPIC_ARN=$TOPIC_ARN" >> ~/myapp-network.env

# IMPORTANT: AWS sends a confirmation email. Until you click "Confirm subscription", you get nothing.
aws sns list-subscriptions-by-topic --topic-arn $TOPIC_ARN \\
  --query 'Subscriptions[].[Endpoint,SubscriptionArn]' --output table   # "PendingConfirmation" = not yet clicked`}
        />
        <Callout kind="note" label="Use a team address, and test the channel">
          <p className="mb-0">
            Send alerts to a group mailbox, not one person&apos;s inbox: people go on holiday. Then
            prove the whole path works before you need it:{" "}
            <code>aws sns publish --topic-arn $TOPIC_ARN --message &quot;test alert&quot;</code>. An
            alerting channel that has never been tested is broken more often than not.
          </p>
        </Callout>

        <h2 id="alarms">Step 2 — the alarms every production app needs</h2>
        <p>
          You do not need fifty alarms; you need the right dozen. Start with these, each tied to a
          symptom or a resource about to run out:
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Alarm on…</th>
                <th>Metric</th>
                <th>Threshold</th>
                <th>Why</th>
              </tr>
            </thead>
            <tbody>
              {alarmList.map(([a, m, t, w]) => (
                <tr key={a}>
                  <td><strong>{a}</strong></td>
                  <td><code>{m}</code></td>
                  <td>{t}</td>
                  <td>{w}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>First, look up the dimension values that identify your load balancer and target group:</p>
        <Script
          title="find the dimension values"
          code={`# CloudWatch identifies the ALB by the tail of its ARN:  app/myapp-alb/50dc6c495c0c9188
ALB_DIM=$(aws elbv2 describe-load-balancers --names myapp-alb \\
  --query 'LoadBalancers[0].LoadBalancerArn' --output text | sed 's|.*:loadbalancer/||')

# ...and the target group by:  targetgroup/myapp-tg/73e2d6bc24d8a067
TG_DIM=$(aws elbv2 describe-target-groups --names myapp-tg \\
  --query 'TargetGroups[0].TargetGroupArn' --output text | sed 's|.*:||')

echo $ALB_DIM $TG_DIM`}
        />
        <p>Now the alarms. The first one, read carefully; the others are variations:</p>
        <Script
          title="alarm 1 — users are getting server errors"
          code={`aws cloudwatch put-metric-alarm \\
  --alarm-name myapp-alb-5xx \\
  --alarm-description "Application is returning 5xx errors. Runbook: check /myapp/web logs, recent deploy" \\
  --namespace AWS/ApplicationELB \\
  --metric-name HTTPCode_Target_5XX_Count \\
  --dimensions Name=LoadBalancer,Value=$ALB_DIM \\
  --statistic Sum \\
  --period 60 \\
  --evaluation-periods 3 \\
  --datapoints-to-alarm 2 \\
  --threshold 5 \\
  --comparison-operator GreaterThanOrEqualToThreshold \\
  --treat-missing-data notBreaching \\
  --alarm-actions $TOPIC_ARN \\
  --ok-actions $TOPIC_ARN`}
        />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Setting</th>
                <th>Meaning</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><code>--period 60</code></td><td>Look at one-minute buckets.</td></tr>
              <tr><td><code>--evaluation-periods 3 --datapoints-to-alarm 2</code></td><td>&ldquo;2 out of the last 3 minutes must breach.&rdquo; Ignores a single blip; still reacts within about two minutes.</td></tr>
              <tr><td><code>--treat-missing-data notBreaching</code></td><td>No errors means no data points. Treat silence as fine, not as an alarm. (For the &ldquo;no traffic&rdquo; alarm we use <code>breaching</code>, because silence <em>is</em> the problem.)</td></tr>
              <tr><td><code>--ok-actions</code></td><td>Also tell me when it recovers, so nobody wonders.</td></tr>
              <tr><td><code>--alarm-description</code></td><td>Written for the person woken at 3 a.m.: what it means and where to look first.</td></tr>
            </tbody>
          </table>
        </div>
        <Script
          title="alarms 2–6"
          code={`# 2. Slow: p95 latency over 1 second (extended statistics use --extended-statistic, not --statistic)
aws cloudwatch put-metric-alarm --alarm-name myapp-alb-slow-p95 \\
  --namespace AWS/ApplicationELB --metric-name TargetResponseTime \\
  --dimensions Name=LoadBalancer,Value=$ALB_DIM \\
  --extended-statistic p95 --period 60 --evaluation-periods 5 --datapoints-to-alarm 4 \\
  --threshold 1 --comparison-operator GreaterThanThreshold \\
  --treat-missing-data notBreaching --alarm-actions $TOPIC_ARN --ok-actions $TOPIC_ARN

# 3. A server is failing its health check
aws cloudwatch put-metric-alarm --alarm-name myapp-unhealthy-hosts \\
  --namespace AWS/ApplicationELB --metric-name UnHealthyHostCount \\
  --dimensions Name=LoadBalancer,Value=$ALB_DIM Name=TargetGroup,Value=$TG_DIM \\
  --statistic Maximum --period 60 --evaluation-periods 3 \\
  --threshold 1 --comparison-operator GreaterThanOrEqualToThreshold \\
  --treat-missing-data notBreaching --alarm-actions $TOPIC_ARN

# 4. Nobody at all can reach the site: no requests for 10 minutes (silence IS the problem here)
aws cloudwatch put-metric-alarm --alarm-name myapp-no-traffic \\
  --namespace AWS/ApplicationELB --metric-name RequestCount \\
  --dimensions Name=LoadBalancer,Value=$ALB_DIM \\
  --statistic Sum --period 300 --evaluation-periods 2 \\
  --threshold 1 --comparison-operator LessThanThreshold \\
  --treat-missing-data breaching --alarm-actions $TOPIC_ARN

# 5. Database disk under 5 GB (the value is in BYTES)
aws cloudwatch put-metric-alarm --alarm-name myapp-db-free-storage \\
  --namespace AWS/RDS --metric-name FreeStorageSpace \\
  --dimensions Name=DBInstanceIdentifier,Value=myapp-db \\
  --statistic Minimum --period 300 --evaluation-periods 1 \\
  --threshold 5368709120 --comparison-operator LessThanThreshold --alarm-actions $TOPIC_ARN

# 6. Database CPU above 80% for 10 minutes
aws cloudwatch put-metric-alarm --alarm-name myapp-db-cpu \\
  --namespace AWS/RDS --metric-name CPUUtilization \\
  --dimensions Name=DBInstanceIdentifier,Value=myapp-db \\
  --statistic Average --period 300 --evaluation-periods 2 \\
  --threshold 80 --comparison-operator GreaterThanThreshold --alarm-actions $TOPIC_ARN`}
        />
        <p>
          Then prove an alarm works — do not trust it until it has fired once. Force it into the alarm
          state without breaking anything:
        </p>
        <CommandList
          title="Fire a test alarm"
          commands={[
            { cmd: "aws cloudwatch set-alarm-state --alarm-name myapp-alb-5xx --state-value ALARM --state-reason \"Testing the alert path\"", note: "Sends the real notification to your email. It flips back to OK at the next evaluation" },
            { cmd: "aws cloudwatch describe-alarms --state-value ALARM --query 'MetricAlarms[].[AlarmName,StateReason]' --output table", note: "Everything currently in trouble, at a glance" },
          ]}
        />

        <h2 id="logs">Step 3 — get the logs off the server</h2>
        <p>
          Containers write to <strong>stdout</strong>; Docker captures it. By default it is a JSON file
          on that server&apos;s disk — gone when Auto Scaling replaces the instance, exactly when you
          want to read it. Docker&apos;s <code>awslogs</code> driver ships each line to CloudWatch Logs
          instead, in near real time.
        </p>
        <Script
          title="permissions for the instance role"
          code={`{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents", "logs:DescribeLogStreams"],
    "Resource": "arn:aws:logs:ap-south-1:123456789012:log-group:/myapp/*"
  }]
}`}
        />
        <Script
          title="user-data.sh — the docker run line from Lesson 12, now logging to CloudWatch"
          code={`docker run -d --name myapp --restart unless-stopped \\
  --env-file /etc/myapp.env \\
  --log-driver awslogs \\
  --log-opt awslogs-region=ap-south-1 \\
  --log-opt awslogs-group=/myapp/web \\
  --log-opt awslogs-create-group=true \\
  --log-opt tag='{{.Name}}/{{.ID}}' \\
  -p 80:3000 \\
  $REGISTRY/myapp:$TAG`}
        />
        <p>
          Each container becomes a <em>log stream</em> inside the <code>/myapp/web</code> group, so you
          can read one server or all of them together. Now the most important log setting of all:
        </p>
        <CommandList
          title="Set retention — the default is forever"
          commands={[
            { cmd: "aws logs put-retention-policy --log-group-name /myapp/web --retention-in-days 30", note: "Log groups keep data indefinitely and bill for storage every month. Choose a retention (14, 30, 90 days) the day you create the group" },
            { cmd: "aws logs tail /myapp/web --follow --since 10m", note: "Live tail from your terminal, like docker logs -f but for every server at once" },
            { cmd: "aws logs tail /myapp/web --filter-pattern ERROR --since 1h", note: "Only lines containing ERROR, from the last hour" },
          ]}
        />
        <Callout kind="note" label="ALB access logs to S3">
          <p className="mb-0">
            Separately, the load balancer can write a record of every request (client IP, path, status,
            timing) to an S3 bucket — about $0.02 per GB to store, no CloudWatch charges. Enable it
            under the ALB&apos;s attributes; query it with Athena when you need to investigate traffic
            patterns or an attack. Cheap and often invaluable.
          </p>
        </Callout>

        <h2 id="structured">Step 4 — write logs you can actually search</h2>
        <p>
          Compare these two lines describing the same event:
        </p>
        <Script
          title="unstructured vs structured"
          code={`# Hard: you can only grep it, and every developer phrases it differently
Error saving order for user 42 after 1204ms: connection timeout

# Easy: one JSON object per line, every value is a searchable field
{"level":"error","time":"2026-01-15T09:30:12.041Z","msg":"order save failed","requestId":"Root=1-65a4-1c9d","tenantId":"acme","userId":"42","route":"/api/orders","status":500,"durationMs":1204,"err":"connection timeout"}`}
        />
        <p>
          With the second form, &ldquo;show me all errors for tenant acme on <code>/api/orders</code>{" "}
          slower than a second&rdquo; is a one-line query instead of a regex adventure.
        </p>
        <Script
          title="lib/log.ts (pino: the standard fast JSON logger for Node)"
          code={`import pino from "pino";

export const log = pino({
  level: process.env.LOG_LEVEL ?? "info",              // "debug" only when actively investigating
  base: { service: "myapp", version: process.env.APP_VERSION },
  timestamp: pino.stdTimeFunctions.isoTime,
  // Anything matching these paths is replaced with "[Redacted]" — do this from day one
  redact: ["*.password", "*.token", "*.secret", "req.headers.authorization", "req.headers.cookie"],
});

// per request:
//   const requestId = req.headers.get("x-amzn-trace-id") ?? crypto.randomUUID();  // the ALB adds this header
//   const l = log.child({ requestId, tenantId, route });
//   l.info({ status: 200, durationMs }, "request completed");
//   l.error({ err }, "order save failed");`}
        />
        <h3>The rules of good logging</h3>
        <ul>
          <li>
            <strong>One correlation ID per request</strong> on every line. The ALB already injects{" "}
            <code>X-Amzn-Trace-Id</code>; log it and return it to the client, and &ldquo;a user sent us
            this error ID&rdquo; becomes a one-second lookup.
          </li>
          <li>
            <strong>Include the tenant.</strong> In a multi-tenant product, &ldquo;is it only one
            customer?&rdquo; is the first question in every incident.
          </li>
          <li>
            <strong>Use levels honestly.</strong> <code>error</code> = a human should probably look;{" "}
            <code>warn</code> = unexpected but handled; <code>info</code> = normal business events;{" "}
            <code>debug</code> = off in production.
          </li>
          <li>
            <strong>Never log secrets or personal data:</strong> passwords, tokens, session IDs, full
            card numbers, national IDs. Logs are copied, retained and read by many people. This is a
            compliance and breach issue, not a style point.
          </li>
          <li>
            <strong>Do not log every health check</strong> (every 15 seconds × every server) — it
            drowns the signal and inflates the bill.
          </li>
          <li>
            <strong>One line per event, no multi-line stack traces</strong> (put the stack in a field), or
            the lines fragment and Insights cannot parse them.
          </li>
        </ul>

        <h2 id="insights">Step 5 — search with Logs Insights</h2>
        <p>
          In the console: CloudWatch → Logs → Logs Insights → select <code>/myapp/web</code> → pick a
          time range → paste a query. JSON fields are discovered automatically.
        </p>
        <Script
          title="queries worth saving"
          code={`# 1. Recent errors
fields @timestamp, msg, route, tenantId, err
| filter level = "error"
| sort @timestamp desc
| limit 50

# 2. Everything that happened to one request (the ID a user or an alert gave you)
fields @timestamp, level, msg, route
| filter requestId like "1c9d"
| sort @timestamp asc

# 3. Which endpoints are slow?
filter ispresent(durationMs)
| stats count() as requests, avg(durationMs) as avg_ms, pct(durationMs, 95) as p95_ms by route
| sort p95_ms desc
| limit 20

# 4. Status codes over time (spot the moment errors started)
filter ispresent(status)
| stats count() as n by status, bin(5m)

# 5. Which tenant is generating the errors?
filter level = "error"
| stats count() as errors by tenantId
| sort errors desc`}
        />
        <p>
          Insights bills by data scanned (about $0.005 per GB), so narrow the time range and the log
          group before running a query over weeks of data.
        </p>

        <h2 id="metrics-from-logs">Step 6 — turn logs and business events into metrics</h2>
        <p>
          A <strong>metric filter</strong> watches a log group and increments a metric whenever a line
          matches — so an error <em>in your code</em> can trigger an alarm even though AWS never sees a
          5xx (perhaps you handled it and returned a friendly 200):
        </p>
        <Script
          title="count application errors, then alarm on them"
          code={`aws logs put-metric-filter \\
  --log-group-name /myapp/web \\
  --filter-name app-errors \\
  --filter-pattern '{ $.level = "error" }' \\
  --metric-transformations metricName=AppErrors,metricNamespace=MyApp,metricValue=1,defaultValue=0

aws cloudwatch put-metric-alarm --alarm-name myapp-app-errors \\
  --namespace MyApp --metric-name AppErrors \\
  --statistic Sum --period 300 --evaluation-periods 1 \\
  --threshold 10 --comparison-operator GreaterThanOrEqualToThreshold \\
  --treat-missing-data notBreaching --alarm-actions $TOPIC_ARN`}
        />
        <p>
          The same trick monitors <strong>the business</strong>, which is often what really matters.
          Technical health can be green while signups have silently stopped. Emit a metric for the
          events you care about:
        </p>
        <CommandList
          title="Business metrics"
          commands={[
            { cmd: "aws cloudwatch put-metric-data --namespace MyApp --metric-name PaymentFailed --value 1 --unit Count", note: "One data point from any script or service. In application code use the AWS SDK's PutMetricData, or log in Embedded Metric Format, which creates metrics from a log line for free of extra API calls" },
          ]}
        />
        <p>
          Good candidates: signups, logins, payments succeeded/failed, emails sent, background jobs
          completed, queue depth. An alarm on &ldquo;zero signups for an hour during business
          hours&rdquo; has caught more real outages than most technical alarms.
        </p>

        <h2 id="agent">Step 7 — memory and disk with the CloudWatch agent</h2>
        <p>
          The agent runs on each server, reads operating-system numbers and publishes them as custom
          metrics. It belongs in the boot recipe (the user-data script of Lesson 12), so every new
          server has it automatically. Attach the AWS-managed policy{" "}
          <code>CloudWatchAgentServerPolicy</code> to the instance role first.
        </p>
        <Script
          title="cloudwatch-agent.json"
          code={`{
  "agent": { "metrics_collection_interval": 60, "run_as_user": "root" },
  "metrics": {
    "namespace": "MyApp/EC2",
    "append_dimensions": {
      "AutoScalingGroupName": "\${aws:AutoScalingGroupName}",
      "InstanceId": "\${aws:InstanceId}"
    },
    "aggregation_dimensions": [["AutoScalingGroupName"]],
    "metrics_collected": {
      "mem":  { "measurement": ["mem_used_percent"] },
      "disk": { "measurement": ["used_percent"], "resources": ["/"] }
    }
  }
}`}
        />
        <Script
          title="added to user-data.sh"
          code={`curl -fsSL -o /tmp/cwagent.deb https://amazoncloudwatch-agent.s3.amazonaws.com/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
dpkg -i /tmp/cwagent.deb

# Keep the config in SSM Parameter Store so all servers read the same one
aws ssm get-parameter --region ap-south-1 --name /myapp/cloudwatch-agent --query Parameter.Value --output text \\
  > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json

/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \\
  -a fetch-config -m ec2 -s -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json`}
        />
        <p>
          Aggregating by Auto Scaling group means one graph for &ldquo;memory across all servers&rdquo;
          rather than one line per short-lived instance ID. Then add the memory and disk alarms from
          the table (namespace <code>MyApp/EC2</code>, metrics <code>mem_used_percent</code> and{" "}
          <code>disk_used_percent</code>).
        </p>

        <h2 id="dashboard">Step 8 — one dashboard</h2>
        <p>
          A dashboard is for the moment someone asks &ldquo;is everything OK?&rdquo; It should answer in
          five seconds without scrolling. CloudWatch → Dashboards → Create. A layout that works for this
          architecture, top to bottom in the order a request travels:
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Row</th>
                <th>Widgets</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><strong>Is anything broken?</strong></td><td>Alarm-status widget showing every alarm as a green/red box; 5xx count; healthy host count</td></tr>
              <tr><td><strong>Traffic &amp; latency</strong></td><td>ALB request count; p50/p95/p99 TargetResponseTime</td></tr>
              <tr><td><strong>Servers</strong></td><td>Desired vs in-service instances; average CPU; memory % and disk % (agent)</td></tr>
              <tr><td><strong>Database</strong></td><td>CPU; connections; free storage; read/write latency</td></tr>
              <tr><td><strong>Cache</strong></td><td>Hit rate; memory %; evictions</td></tr>
              <tr><td><strong>The business</strong></td><td>Signups, logins, payments per hour</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          Your first three dashboards are free; then about $3 per dashboard per month. Keep one that
          the whole team knows by name. And when you write Terraform for the estate, define the
          dashboard there too, so it is rebuilt with everything else.
        </p>
        <Callout kind="ok" label="Mark your deployments on the graphs">
          <p className="mb-0">
            The most useful question in any incident is &ldquo;what changed?&rdquo;. Have the deploy
            pipeline (Lesson 14) emit a metric or a log line on every release — even a{" "}
            <code>put-metric-data --metric-name Deploy</code> — and add it to the dashboard. When the
            error graph steps up at 14:02 and a deploy marker sits at 14:01, you have your suspect in
            ten seconds.
          </p>
        </Callout>

        <h2 id="alerting">How to alert without burning out your team</h2>
        <p>
          Alarms that cry wolf get muted, and a muted alarm system is worse than none. The discipline
          that separates mature teams:
        </p>
        <ul>
          <li>
            <strong>Alert on symptoms, not causes.</strong> &ldquo;Users are getting errors&rdquo; and
            &ldquo;the site is slow&rdquo; always deserve attention. &ldquo;CPU is 75%&rdquo; may be
            perfectly healthy. Cause metrics belong on the dashboard for diagnosis, not in your phone.
          </li>
          <li>
            <strong>Every alert must be actionable.</strong> If the reaction to an alert is &ldquo;ignore
            it, that always happens&rdquo;, delete or retune it that day.
          </li>
          <li>
            <strong>Two tiers.</strong> <em>Page</em> (wake a human now): total outage, sustained
            errors, data at risk. <em>Ticket</em> (look tomorrow): disk at 70%, certificate expiring
            in 20 days, a single failed job. Route them to different channels.
          </li>
          <li>
            <strong>Write a runbook link into every alarm description:</strong> what it means, how to
            confirm, first three things to try, who to escalate to. The person at 3 a.m. is tired and
            may not be the person who built it.
          </li>
          <li>
            <strong>Alert on the absence of good things.</strong> No traffic, no signups, no completed
            jobs: the silent failures that produce no errors.
          </li>
          <li>
            <strong>Review alerts monthly.</strong> Which fired? Which mattered? Which never did?
            Alerts, like tests, rot.
          </li>
        </ul>
        <Callout kind="note" label="SLI, SLO, error budget in one paragraph">
          <p className="mb-0">
            An <strong>SLI</strong> is a measurement (fraction of requests that succeed in under 500
            ms). An <strong>SLO</strong> is your target for it (99.9% over 30 days). The gap — 0.1%,
            about 43 minutes a month — is your <strong>error budget</strong>: room to ship risky
            changes. When the budget is spent, you slow down and fix reliability. This turns &ldquo;how
            reliable should we be?&rdquo; from an argument into a number.
          </p>
        </Callout>

        <h2 id="incident">When the alarm fires: a debugging routine</h2>
        <p>
          Have a routine, so a tired mind follows steps instead of guessing:
        </p>
        <ol className="steps">
          <li>
            <h3>Is it real, and how big?</h3>
            <p>
              Open the dashboard. Are errors up? For everyone or a slice (one tenant, one endpoint, one
              AZ)? Since when — is there a deploy marker just before?
            </p>
          </li>
          <li>
            <h3>Stop the bleeding first</h3>
            <p>
              If a deploy caused it, <strong>roll back now</strong> (Lesson 14) and investigate after.
              Restoring service beats understanding it. Scale up, fail over, disable the feature flag —
              whichever restores users fastest.
            </p>
          </li>
          <li>
            <h3>Walk the golden signals down the stack</h3>
            <p>
              ALB errors or latency? Then targets: healthy hosts, CPU, memory. Then dependencies: RDS
              CPU, connections and storage; Redis memory and hit rate. The first red graph in the chain
              is usually the culprit.
            </p>
          </li>
          <li>
            <h3>Read the logs for the exact minute</h3>
            <p>
              Run the &ldquo;recent errors&rdquo; and &ldquo;errors by tenant&rdquo; Insights queries for
              the incident window. Take one <code>requestId</code> and read its full story.
            </p>
          </li>
          <li>
            <h3>Write down what you learn, while it is fresh</h3>
            <p>
              Timeline, cause, fix, and — most valuable — what would have caught it sooner? Add that
              alarm or log field. A blameless post-mortem turns each outage into a permanent
              improvement.
            </p>
          </li>
        </ol>

        <h2 id="cost">What this costs, and the log bill trap</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Item</th><th>Approx. price</th></tr>
            </thead>
            <tbody>
              <tr><td>AWS service metrics (EC2 5-min, ALB, RDS, ElastiCache)</td><td className="font-semibold text-emerald-300">Free</td></tr>
              <tr><td>Standard alarms</td><td>First 10 free, then ~$0.10 per alarm per month</td></tr>
              <tr><td>Custom metrics (agent, business)</td><td>First 10 free, then ~$0.30 per metric per month</td></tr>
              <tr><td>Dashboards</td><td>First 3 free, then $3 each per month</td></tr>
              <tr><td>Log ingestion</td><td>~$0.50–0.70 per GB — <strong>the one that surprises people</strong></td></tr>
              <tr><td>Log storage</td><td>~$0.03 per GB-month (after retention expires, free)</td></tr>
              <tr><td>Logs Insights queries</td><td>~$0.005 per GB scanned</td></tr>
              <tr><td>SNS email notifications</td><td className="font-semibold text-emerald-300">Free (1,000/month)</td></tr>
            </tbody>
          </table>
        </div>
        <Callout kind="warn" label="Log ingestion is where monitoring bills explode">
          <p className="mb-0">
            A busy app logging 2 KB per request at 50 requests a second produces about 8 GB a day —
            over $100 a month just to ingest, before storing. The usual culprits: leaving{" "}
            <code>debug</code> on in production, logging every request body, logging health checks, and
            log loops from retrying errors. Set the level to <code>info</code>, sample high-volume
            lines, and check the log group&apos;s <em>stored bytes</em> monthly. The metrics, alarms and
            dashboard from this lesson cost only a few dollars; logs are where discipline pays.
          </p>
        </Callout>

        <h2 id="troubleshooting">Troubleshooting table</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Symptom</th>
                <th>Likely cause</th>
                <th>Fix</th>
              </tr>
            </thead>
            <tbody>
              {trouble.map(([s, c, f]) => (
                <tr key={s}>
                  <td>{s}</td>
                  <td>{c}</td>
                  <td>{f}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 id="interview">Interview corner</h2>
        <InterviewQA
          items={[
            {
              q: "What would you monitor for a web application?",
              a: (
                <p className="mb-0">
                  The four golden signals: latency (percentiles), traffic, errors and saturation. Concretely:
                  load-balancer 5xx and p95 latency, healthy host count, CPU/memory/disk, database CPU,
                  connections and free storage, cache hit rate and memory, plus business metrics such as
                  signups and payments.
                </p>
              ),
            },
            {
              q: "Why percentiles instead of averages?",
              a: (
                <p className="mb-0">
                  Averages hide the tail: a few very slow requests barely move them while real users suffer.
                  p95/p99 show what the slowest users experience and are what SLOs should target.
                </p>
              ),
            },
            {
              q: "EC2 memory usage isn’t in CloudWatch by default. Why, and what do you do?",
              a: (
                <p className="mb-0">
                  The hypervisor sees CPU and network but not guest-OS internals. Install the CloudWatch
                  agent (with an instance role) to publish memory and disk metrics, and bake it into the
                  launch template so every instance has it.
                </p>
              ),
            },
            {
              q: "Metrics vs logs vs traces?",
              a: (
                <p className="mb-0">
                  Metrics are cheap aggregated numbers for detecting and alerting on problems; logs are
                  detailed events for explaining them; traces follow a single request across services to
                  locate latency. Detect with metrics, diagnose with logs, pinpoint with traces.
                </p>
              ),
            },
            {
              q: "How do you avoid alert fatigue?",
              a: (
                <p className="mb-0">
                  Alert on user-visible symptoms, make every alert actionable with a runbook, separate pages
                  from tickets, tune thresholds and evaluation windows to ignore blips, delete alerts nobody
                  acts on, and review them regularly.
                </p>
              ),
            },
            {
              q: "The site is down but there are no 5xx errors on the ALB. What alarm would have caught it?",
              a: (
                <p className="mb-0">
                  A traffic-absence alarm: RequestCount below a floor with missing data treated as
                  breaching, or a Route 53/synthetic health check from outside. DNS, certificate or network
                  failures produce no errors because no requests arrive.
                </p>
              ),
            },
            {
              q: "Your CloudWatch bill tripled. Where do you look?",
              a: (
                <p className="mb-0">
                  Log ingestion first: which log group grew (IncomingBytes), debug logging left on,
                  unfiltered health checks or request bodies, error loops. Then custom metrics cardinality
                  and Logs Insights scans. Fix with log levels, sampling, retention and metric filters.
                </p>
              ),
            },
          ]}
        />

        <hr />

        <h2 id="practice">Practice task before Lesson 18</h2>
        <ol>
          <li>
            Create the SNS topic, subscribe your email and <strong>confirm it</strong>. Publish a test
            message and receive it.
          </li>
          <li>
            Create the six alarms. Force each one into <code>ALARM</code> with{" "}
            <code>set-alarm-state</code> and check the email arrives and the description is useful to a
            stranger.
          </li>
          <li>
            Ship logs to CloudWatch with the <code>awslogs</code> driver, set a 30-day retention, and{" "}
            <code>aws logs tail</code> them while you click around the site.
          </li>
          <li>
            Switch the app to JSON logging with request IDs and tenant IDs. Save three Logs Insights
            queries: recent errors, slowest routes, one request&apos;s story.
          </li>
          <li>
            Break something on purpose (stop the app on one server, or make a route throw) and watch: an
            alarm fires, you find the cause in the logs, and the recovery email arrives.
          </li>
          <li>
            Install the CloudWatch agent on one server, then find <code>mem_used_percent</code> in the
            console and add a memory alarm.
          </li>
          <li>
            Build the dashboard. Put a page-worthy alarm and a ticket-worthy alarm in two categories, and
            write a three-line runbook for each.
          </li>
        </ol>
        <Callout kind="ok" label="Optional stretch">
          <p className="mb-0">
            Create a free external uptime check (UptimeRobot or similar) on your public URL. It is
            independent of AWS, so it also catches the case where your whole AWS setup, or your DNS, is
            the thing that is down. Then try Container Insights or Application Signals in the console to
            see what more automated observability looks like.
          </p>
        </Callout>

        <h2 id="conclusion">Conclusion</h2>
        <p>
          You can now see the system, and it can call you. That changes operating it from anxious guessing
          to routine.
        </p>
        <ul>
          <li>
            <strong>Watch the four golden signals</strong> — latency (percentiles), traffic, errors,
            saturation — and remember EC2 hides memory and disk until the agent is installed.
          </li>
          <li>
            <strong>Alarms send to SNS</strong>; confirm the subscription, test the path, and alert on
            symptoms with a runbook in the description, including the absence of traffic.
          </li>
          <li>
            <strong>Ship logs off the server</strong> with structured JSON, request IDs and tenant IDs,
            never secrets; search with Logs Insights; turn log patterns and business events into metrics.
          </li>
          <li>
            <strong>One dashboard</strong> ordered like the request path, with deploy markers.
          </li>
          <li>
            <strong>Log ingestion is the cost trap</strong>: info level, retention set, no health-check
            spam.
          </li>
        </ul>
        <p>
          You can observe the system. Now make it hard to break into and impossible to lose: security
          hardening and backups.
        </p>

        <hr />
        <p>
          End of Lesson 17. Next: <strong>Lesson 18 — Security Hardening and Backups</strong>.
        </p>
      </div>

      <LessonPager slug={lesson.slug} />
    </article>
  );
}
