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
  ["Metrics", "Numbers over time. They are cheap to store and to search", "“How many 5xx per minute? What is CPU?”", "CloudWatch Metrics, dashboards, alarms"],
  ["Logs", "Events with a time stamp and detail", "“What exactly happened to request abc123?”", "CloudWatch Logs, Logs Insights"],
  ["Traces", "One request followed through every service and query", "“Where did those 3 seconds go?”", "AWS X-Ray (the AWS tracing service), OpenTelemetry (an open standard and toolkit for creating traces)"],
];

const golden: [string, string, string, string][] = [
  ["Latency", "How long requests take. Use percentiles (p50 is the middle value, p95 and p99 are the slow end), not averages", "ALB TargetResponseTime", "RDS ReadLatency"],
  ["Traffic", "How much demand there is for your service", "ALB RequestCount", "Redis commands/s"],
  ["Errors", "How many requests fail", "ALB HTTPCode_Target_5XX_Count", "App error logs"],
  ["Saturation", "How full your resources are", "ASG CPU, memory, disk %", "RDS connections, FreeStorageSpace, Redis memory"],
];

const alarmList: [string, string, string, string][] = [
  ["Users are seeing errors", "ALB HTTPCode_Target_5XX_Count", "≥ 5 per minute, 2 of 3 minutes", "The primary symptom alarm"],
  ["The site is too slow", "ALB TargetResponseTime p95", "> 1 second for 5 minutes", "Slowness hurts before errors appear"],
  ["A server is failing", "ALB UnHealthyHostCount", "≥ 1 for 3 minutes", "Auto Scaling will replace it, but you should still find out why"],
  ["No servers left", "ALB HealthyHostCount", "< 1 for 1 minute", "Total outage. Call a person (page them)"],
  ["Nobody can reach us at all", "ALB RequestCount", "< 1 for 10 minutes (treat missing data as breaching)", "Catches DNS, certificate and ALB failures that produce no errors"],
  ["Database CPU", "RDS CPUUtilization", "> 80% for 10 minutes", "A missing index or an instance that is too small"],
  ["Database disk", "RDS FreeStorageSpace", "< 5 GB", "A full disk freezes the database"],
  ["Database connections", "RDS DatabaseConnections", "> 80% of max_connections", "The outage from Lesson 8 that came with scaling"],
  ["Cache memory", "ElastiCache DatabaseMemoryUsagePercentage", "> 80%", "Evictions and out-of-memory errors are coming"],
  ["Server memory / disk", "MyApp/EC2 mem_used_percent, disk_used_percent", "> 85%", "EC2 does not report these by default"],
  ["Money", "AWS Budget / EstimatedCharges", "80% of budget", "The alarm from Lesson 5. It is still the most valuable one"],
];

const trouble: [string, string, string][] = [
  ["Alarm fired but no email arrived", "The SNS email subscription was never confirmed, or the email went to spam", "Run aws sns list-subscriptions-by-topic. “PendingConfirmation” means you must click the link in the confirmation email"],
  ["Alarm stuck on INSUFFICIENT_DATA", "There are no data points. The dimension value or namespace is wrong, or the metric exists only when events happen", "Look up the exact dimension in the Metrics view of the console. Set --treat-missing-data to a suitable value"],
  ["Log group exists but has no events", "The role lacks logs:PutLogEvents, the log driver or agent is not running, or the region is wrong", "Check the role policy. Run docker logs myapp to see driver errors. Check the region"],
  ["Logs Insights shows no fields for my JSON", "The log lines are not valid JSON (they have a prefix, or multi-line stack traces)", "Log one JSON object per line. Put stack traces in a field"],
  ["Memory/disk metrics missing", "The CloudWatch agent is not installed, or the role lacks CloudWatchAgentServerPolicy", "systemctl status amazon-cloudwatch-agent; check /opt/aws/amazon-cloudwatch-agent/logs/"],
  ["Alarm flaps between OK and ALARM", "The threshold is at the level of normal noise, or the period is too short", "Use more evaluation periods, change datapoints to alarm, or use a longer period"],
  ["The bill jumped after enabling logging", "Very detailed debug logging, or every health check is logged", "Filter out health checks. Set LOG_LEVEL=info. Set a retention time"],
  ["Dashboards show data from the wrong region", "The region selector in the console is not set to ap-south-1", "Switch the region. CloudWatch data belongs to one region"],
];

export default function LessonSeventeenPage() {
  return (
    <article>
      <LessonIntro lesson={lesson} outline={outline} />

      <div className="lesson">
        <h2 id="concept">Concept</h2>
        <p>
          <strong>Monitoring</strong> is how you find out what your system is doing right now.{" "}
          <strong>Alerting</strong> is how the system tells <em>you</em> when something is wrong. On
          AWS the built-in tool is <strong>CloudWatch</strong>. It collects numbers (called
          metrics) and text (called logs). It draws them on dashboards, which are screens of graphs.
          It also sends a message when a number crosses a line you set. These rules are called
          alarms.
        </p>
        <Callout kind="note" label="The analogy — a car">
          <p className="mb-0">
            The <strong>dashboard</strong> shows your speed and fuel at a glance. These are the
            metrics. The <strong>warning lights</strong> tell you before the engine breaks down.
            These are the alarms. The <strong>black-box recorder</strong> lets investigators see what
            happened after a crash. These are the logs. A car without any of these still drives. But
            one day it stops, with no warning and no explanation.
          </p>
        </Callout>

        <h2 id="why-this-matters">Why this matters</h2>
        <ul>
          <li>
            <strong>Without monitoring, your customers are your alarm system.</strong> The first sign
            of trouble is an angry email or a public post. You learn about an outage from the person
            who pays you.
          </li>
          <li>
            <strong>&ldquo;It is slow&rdquo; has no answer without data.</strong> Slow where? Since
            when? After which deploy? For whom? Metrics and logs answer these questions in seconds.
            Guessing takes hours.
          </li>
          <li>
            <strong>Everything you built can fail silently.</strong> Examples are a full disk, a
            database that reached its connection limit, an expired certificate, a health check that
            keeps switching between pass and fail (flapping), or an Auto Scaling group stuck at its
            maximum size. All of them look like &ldquo;the site works for me&rdquo; until it
            does not.
          </li>
          <li>
            <strong>You need proof that it is fixed.</strong> After a change, the graph either went
            back to normal or it did not.
          </li>
          <li>
            <strong>Capacity and cost planning</strong> need history. You must know how much traffic
            grows each month and how high the peak is.
          </li>
        </ul>

        <h2 id="pillars">Metrics, logs and traces</h2>
        <p>
          Telemetry means the data a system sends out about itself. It comes in three kinds, and each
          kind answers different questions. You want all three, but start in this order:
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
          <strong>Metrics tell you <em>that</em> something is wrong. Logs tell you <em>why</em>.</strong>{" "}
          A typical investigation starts with a graph. For example, 5xx errors (server errors) rose at
          14:02. Then you open the logs for that minute and find a database timeout on one endpoint.
          You use traces only for complex systems with many services. Our app is a monolith, which
          means one single application. For a monolith, metrics plus good logs solve most problems.
        </p>

        <h2 id="signals">The four golden signals</h2>
        <p>
          Google&apos;s site-reliability book answers &ldquo;what should I watch?&rdquo; with four
          things. If you watch only these, you already see almost every problem that users can
          notice:
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
            Suppose 99 requests take 100 ms and one takes 10 seconds. The average is about 200 ms,
            which looks fine, but one user in a hundred is suffering. A percentile fixes this.{" "}
            <strong>p95</strong> means &ldquo;95% of requests were faster than this time&rdquo;.{" "}
            <strong>p99</strong> shows the slowest 1% (the &ldquo;tail&rdquo;). Set alerts and write
            reports with percentiles.
          </p>
        </Callout>
        <p>
          You may hear two memory aids. <strong>RED</strong> is for services: Rate, Errors, Duration.{" "}
          <strong>USE</strong> is for resources: Utilisation, Saturation, Errors. They describe the
          same ideas from two sides.
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
              <tr><td><strong>Namespace</strong></td><td>A folder that groups the metrics of one service</td><td><code>AWS/ApplicationELB</code>, <code>MyApp</code></td></tr>
              <tr><td><strong>Metric</strong></td><td>A named list of numbers over time</td><td><code>HTTPCode_Target_5XX_Count</code></td></tr>
              <tr><td><strong>Dimension</strong></td><td>A label that picks one item out of many</td><td><code>LoadBalancer=app/myapp-alb/…</code></td></tr>
              <tr><td><strong>Statistic</strong></td><td>The way to combine the points inside one period</td><td>Sum, Average, Maximum, p95</td></tr>
              <tr><td><strong>Period</strong></td><td>The length of each time bucket, in seconds</td><td>60</td></tr>
              <tr><td><strong>Alarm</strong></td><td>A rule on a metric. It has three states: <code>OK</code>, <code>ALARM</code> and <code>INSUFFICIENT_DATA</code> (not enough data to decide)</td><td>&ldquo;5xx ≥ 5 for 2 of 3 minutes&rdquo;</td></tr>
              <tr><td><strong>Log group / stream</strong></td><td>A group of logs for one purpose (group) / one source inside the group (stream)</td><td><code>/myapp/web</code> / one per container</td></tr>
              <tr><td><strong>SNS topic</strong></td><td>A broadcast channel. Alarms send messages to it. Email, SMS and Slack (through AWS Chatbot) can subscribe to it</td><td><code>myapp-alerts</code></td></tr>
            </tbody>
          </table>
        </div>

        <h2 id="free">What you get for free — and what is missing</h2>
        <p>
          As soon as you create resources, AWS starts publishing metrics for them at no charge. A few
          names you will see: <strong>EC2</strong> is the AWS service that rents virtual servers. An{" "}
          <strong>Auto Scaling group</strong> is a group of servers that AWS adds to and removes
          automatically. An <strong>ALB</strong> (Application Load Balancer) spreads web traffic over
          the servers. <strong>RDS</strong> is the managed database. <strong>ElastiCache</strong> is
          the managed Redis cache.
        </p>
        <ul>
          <li>
            <strong>EC2</strong>: CPU, network in and out, disk operations and status checks, every{" "}
            <strong>5 minutes</strong>. With &ldquo;detailed monitoring&rdquo; you get them every
            minute, for about $2 per instance per month.
          </li>
          <li>
            <strong>ALB</strong>: request count, response codes, latency and the number of healthy and
            unhealthy hosts. <strong>RDS</strong>: CPU, connections, free storage, IOPS (disk
            operations per second) and latency. <strong>ElastiCache</strong>: memory, hit rate and
            evictions.
          </li>
        </ul>
        <Callout kind="warn" label="EC2 does NOT report memory or disk space">
          <p className="mb-0">
            The hypervisor (the AWS software that runs your virtual server) can see CPU and network
            use. It cannot see what is inside the operating system. So &ldquo;memory 95%&rdquo; and
            &ldquo;disk 98% full&rdquo; are invisible. These are two of the most common causes of
            crashes. You can see them only after you install the <strong>CloudWatch agent</strong>{" "}
            (Step 7). Do not assume that &ldquo;AWS monitors my server&rdquo; covers them.
          </p>
        </Callout>
        <p>
          Nothing collects your <strong>application logs</strong> by default either. They sit in a
          Docker file on a server. Auto Scaling may delete that server at any moment, and the
          evidence is deleted with it.
        </p>

        <h2 id="alerts-channel">Step 1 — a channel that reaches you</h2>
        <p>
          An alarm needs a place to send its message. <strong>SNS</strong> (Simple Notification
          Service) is the AWS broadcast channel for this. Start with email. Later you can switch to
          Slack or a pager without changing any alarm.
        </p>
        <p>
          In SNS, go to Topics and create a <em>Standard</em> topic called <code>myapp-alerts</code>.
          Then create a subscription with the protocol <strong>Email</strong> and your address. AWS
          sends you a confirmation email. Until you click &ldquo;Confirm subscription&rdquo;, you
          receive nothing.
        </p>
        <Callout kind="note" label="Use a team address, and test the channel">
          <p className="mb-0">
            Send alerts to a group mailbox, not to one person&apos;s inbox, because people go on
            holiday. Then prove that the whole path works before you need it. The topic&apos;s{" "}
            <strong>Publish message</strong> button sends a test. An alert channel that you have
            never tested is often broken.
          </p>
        </Callout>

        <h2 id="alarms">Step 2 — the alarms every production app needs</h2>
        <p>
          You do not need fifty alarms. You need the right dozen. Start with these. Each one is tied to
          a symptom that users feel, or to a resource that is about to run out:
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
        <p>Build the first one carefully. The others are small variations.</p>
        <p>
          In CloudWatch, go to Alarms and choose <strong>Create alarm</strong>. Select the metric:
          ApplicationELB, then Per-AppELB Metrics, then <code>HTTPCode_Target_5XX_Count</code> for{" "}
          <code>myapp-alb</code>. Set the statistic to <em>Sum</em> and the threshold to{" "}
          <em>≥ 5</em>. Send the notification to <code>myapp-alerts</code>. Under &ldquo;Additional
          configuration&rdquo; are the settings that make an alarm trustworthy:
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Setting</th>
                <th>Meaning</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Period: 1 minute</td><td>Look at one-minute time buckets.</td></tr>
              <tr><td>Datapoints to alarm: 2 out of 3</td><td>&ldquo;2 of the last 3 minutes must go over the limit.&rdquo; This ignores one short spike, and the alarm still reacts within about two minutes.</td></tr>
              <tr><td>Missing data: treat as good</td><td>No errors means no data points. Treat silence as fine, not as an alarm. (For the &ldquo;no traffic&rdquo; alarm choose <em>bad</em>, because silence <em>is</em> the problem.)</td></tr>
              <tr><td>Also notify on OK</td><td>Tell me when it recovers, so nobody has to wonder.</td></tr>
              <tr><td>Description</td><td>Write it for the person who is woken at 3 a.m. Say what the alarm means and where to look first.</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          The other rows of the table use the same screen with a different metric, statistic and
          threshold. Watch for two details. Latency uses the <em>p95</em> statistic, not the average.
          The database disk threshold is in <strong>bytes</strong>. 5 GB is{" "}
          <code>5368709120</code> bytes.
        </p>
        <p>
          Then prove that an alarm works. Do not trust it until it has fired once. You can force it
          into the alarm state without breaking anything:
        </p>
        <CommandList
          title="Fire a test alarm"
          commands={[
            { cmd: "aws cloudwatch set-alarm-state --alarm-name myapp-alb-5xx --state-value ALARM --state-reason \"Testing the alert path\"", note: "Sends the real notification to your email. The alarm goes back to OK at its next check" },
          ]}
        />

        <h2 id="logs">Step 3 — get the logs off the server</h2>
        <p>
          A container writes its log lines to <strong>stdout</strong> (the standard output stream of
          a program), and Docker captures them. By default Docker saves them in a JSON file on that
          server&apos;s disk. The file is gone when Auto Scaling replaces the instance, which is
          exactly when you want to read it. Docker&apos;s <code>awslogs</code> driver sends each line
          to CloudWatch Logs instead, almost at once.
        </p>
        <p>
          Give <code>myapp-ec2-role</code> (the IAM role of the server) permission to create the log
          group and log streams and to put log events in log groups under <code>/myapp/*</code>.
          The permissions are <code>logs:CreateLogGroup</code>, <code>logs:CreateLogStream</code>{" "}
          and <code>logs:PutLogEvents</code>. Then change one thing in the boot script: the log
          driver.
        </p>
        <Script
          title="user-data.sh — the docker run line from Lesson 12, now logging to CloudWatch"
          code={`docker run -d --name myapp --restart unless-stopped \\
  --env-file /etc/myapp.env \\
  --log-driver awslogs \\
  --log-opt awslogs-region=ap-south-1 \\
  --log-opt awslogs-group=/myapp/web \\
  --log-opt awslogs-create-group=true \\
  -p 80:3000 $REGISTRY/myapp:$TAG`}
        />
        <p>
          Each container becomes a <em>log stream</em> inside the <code>/myapp/web</code> group. So you
          can read one server or all servers together. Now here is the most important log setting of
          all.
        </p>
        <p>
          Log groups keep data <strong>forever</strong> by default, and you pay for storage every
          month. On the day you create the group, set its retention (Actions, then Edit retention
          setting) to 14, 30 or 90 days. Then you can watch every server at once from your
          terminal:
        </p>
        <CommandList
          title="Live tail"
          commands={[
            { cmd: "aws logs tail /myapp/web --follow --since 10m", note: "Works like docker logs -f, but for every server at once. Add --filter-pattern ERROR to see only errors" },
          ]}
        />
        <Callout kind="note" label="ALB access logs to S3">
          <p className="mb-0">
            The load balancer can also write a record of every request to an S3 bucket. The record
            has the client IP, the path, the status and the timing. Storage costs about $0.02 per GB,
            and there are no CloudWatch charges. Turn it on in the ALB&apos;s attributes. When you need
            to study traffic patterns or an attack, search the records with Athena (an AWS service
            that runs SQL queries on files in S3). It is cheap and often very useful.
          </p>
        </Callout>

        <h2 id="structured">Step 4 — write logs you can actually search</h2>
        <p>
          Compare these two ways of logging the same event:
        </p>
        <Script
          title="unstructured vs structured"
          code={`# Hard: you can only search it as plain text (grep), and every developer words it differently
Error saving order for user 42 after 1204ms: connection timeout

# Easy: one JSON object per line, and every value is a field you can search
{"level":"error","time":"2026-01-15T09:30:12.041Z","msg":"order save failed","requestId":"Root=1-65a4-1c9d","tenantId":"acme","userId":"42","route":"/api/orders","status":500,"durationMs":1204,"err":"connection timeout"}`}
        />
        <p>
          With the second form, &ldquo;show me all errors for tenant acme on <code>/api/orders</code>{" "}
          slower than one second&rdquo; is a one-line query. With the first form you would need a
          complex text pattern (a regex).
        </p>
        <Script
          title="lib/log.ts (pino: the standard fast JSON logger for Node)"
          code={`import pino from "pino";

export const log = pino({
  level: process.env.LOG_LEVEL ?? "info",              // use "debug" only while you are investigating a problem
  base: { service: "myapp", version: process.env.APP_VERSION },
  timestamp: pino.stdTimeFunctions.isoTime,
  // Anything at these paths is replaced with "[Redacted]". Do this from day one
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
            <strong>One correlation ID for each request</strong>, on every log line. A correlation ID
            is a unique code that ties together all the lines of one request. The ALB already adds{" "}
            <code>X-Amzn-Trace-Id</code>. Log it and also return it to the client. Then, when a user
            sends you an error ID, you can find the matching log lines in one second.
          </li>
          <li>
            <strong>Include the tenant.</strong> A multi-tenant product serves many customers from
            one app. In such a product, &ldquo;is it only one customer?&rdquo; is the first question
            in every incident.
          </li>
          <li>
            <strong>Use log levels honestly.</strong> <code>error</code> means a person should
            probably look. <code>warn</code> means something unexpected happened but the app handled
            it. <code>info</code> means normal business events. <code>debug</code> means very
            detailed messages, which stay off in production.
          </li>
          <li>
            <strong>Never log secrets or personal data.</strong> This includes passwords, tokens,
            session IDs, full card numbers and national ID numbers. Many people copy, keep and read
            logs. Leaking such data is a legal and security problem, not a style problem.
          </li>
          <li>
            <strong>Do not log every health check.</strong> The load balancer checks every server
            every few seconds. These lines hide the useful ones and make the bill larger.
          </li>
          <li>
            <strong>One line for each event, and no multi-line stack traces.</strong> Put the stack
            trace (the list of function calls at the error) inside a field. Otherwise the lines are
            split and Insights cannot read them.
          </li>
        </ul>

        <h2 id="insights">Step 5 — search with Logs Insights</h2>
        <p>
          Logs Insights is the CloudWatch tool for searching logs with queries. In the console, go to
          CloudWatch, then Logs, then Logs Insights. Select <code>/myapp/web</code>, pick a time
          range and paste a query. Insights finds the JSON fields by itself.
        </p>
        <Script
          title="two queries worth saving"
          code={`# Recent errors
fields @timestamp, msg, route, tenantId, err
| filter level = "error"
| sort @timestamp desc
| limit 50

# Which endpoints are slow?
filter ispresent(durationMs)
| stats count() as requests, pct(durationMs, 95) as p95_ms by route
| sort p95_ms desc`}
        />
        <p>
          Save a few more queries. One shows everything for one <code>requestId</code>. One shows
          status codes over time in 5-minute groups. One shows errors grouped by{" "}
          <code>tenantId</code>.
        </p>
        <p>
          Insights charges for the data it scans (about $0.005 per GB). So make the time range and the
          log group small before you run a query over weeks of data.
        </p>

        <h2 id="metrics-from-logs">Step 6 — turn logs and business events into metrics</h2>
        <p>
          A <strong>metric filter</strong> watches a log group. Each time a line matches a pattern, it
          adds to a metric. So an error <em>in your code</em> can trigger an alarm even when AWS never
          sees a 5xx. For example, you may have handled the error and returned a friendly 200.
        </p>
        <p>
          In the log group, choose Actions, then <strong>Create metric filter</strong>. Use the
          pattern <code>{'{ $.level = "error" }'}</code>, the metric <code>MyApp/AppErrors</code> and
          the value 1. Then create an alarm on that metric like any other alarm. For example, alarm
          on 10 or more in five minutes.
        </p>
        <p>
          The same trick can monitor <strong>the business</strong>, which is often what matters most.
          Everything can look healthy on a technical level while signups have silently stopped. So
          send a metric for the events you care about.
        </p>
        <p>
          You can send one data point for each event from your code, using the AWS SDK&apos;s{" "}
          <code>PutMetricData</code> call. A cheaper way is to write the event in{" "}
          <em>Embedded Metric Format</em>. This is a special log format that CloudWatch turns into a
          metric, so you need no extra API call.
        </p>
        <p>
          Good events to measure are signups, logins, successful and failed payments, emails sent,
          finished background jobs and queue depth (how many jobs are waiting). An alarm on
          &ldquo;zero signups for an hour during business hours&rdquo; has caught more real outages
          than most technical alarms.
        </p>

        <h2 id="agent">Step 7 — memory and disk with the CloudWatch agent</h2>
        <p>
          The agent is a small program that runs on each server. It reads numbers from the operating
          system and publishes them as custom metrics. Put it in the boot recipe (the user-data
          script of Lesson 12), so every new server gets it automatically. First attach the
          AWS-managed policy <code>CloudWatchAgentServerPolicy</code> to the instance role.
        </p>
        <p>
          The agent&apos;s config is a small JSON file. It says to collect{" "}
          <code>mem_used_percent</code> and the root disk&apos;s <code>used_percent</code> every 60
          seconds. The metrics go into the namespace <code>MyApp/EC2</code>, grouped by Auto Scaling
          group. (CloudWatch shows the disk metric as <code>disk_used_percent</code>.) Keep the file
          in SSM Parameter Store (an AWS service that stores settings) as{" "}
          <code>/myapp/cloudwatch-agent</code>, so every server reads the same file.
        </p>
        <p>
          The user-data script needs three extra steps. Install the agent package. Fetch the config
          from SSM. Start the agent with that config.
        </p>
        <p>
          Grouping by Auto Scaling group gives you one graph for &ldquo;memory across all
          servers&rdquo;. Without it, you would get one line for each short-lived instance ID. Then
          add the memory and disk alarms from the table (namespace <code>MyApp/EC2</code>, metrics{" "}
          <code>mem_used_percent</code> and <code>disk_used_percent</code>).
        </p>

        <h2 id="dashboard">Step 8 — one dashboard</h2>
        <p>
          A dashboard is for the moment when someone asks &ldquo;is everything OK?&rdquo; It should
          answer in five seconds without scrolling. In CloudWatch, go to Dashboards and choose
          Create. Here is a layout that works for this architecture. It goes from top to bottom in
          the order that a request travels:
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
              <tr><td><strong>Is anything broken?</strong></td><td>An alarm-status widget that shows every alarm as a green or red box; the 5xx count; the healthy host count</td></tr>
              <tr><td><strong>Traffic &amp; latency</strong></td><td>ALB request count; p50/p95/p99 TargetResponseTime</td></tr>
              <tr><td><strong>Servers</strong></td><td>Desired and in-service instances; average CPU; memory % and disk % (from the agent)</td></tr>
              <tr><td><strong>Database</strong></td><td>CPU; connections; free storage; read and write latency</td></tr>
              <tr><td><strong>Cache</strong></td><td>Hit rate; memory %; evictions</td></tr>
              <tr><td><strong>The business</strong></td><td>Signups, logins, payments per hour</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          Your first three dashboards are free. After that, each costs about $3 a month. Keep one
          dashboard that the whole team knows by name. When you write Terraform for your setup,
          define the dashboard there too. Then it is rebuilt together with everything else.
        </p>
        <Callout kind="ok" label="Mark your deployments on the graphs">
          <p className="mb-0">
            The most useful question in any incident is &ldquo;what changed?&rdquo; Make the deploy
            pipeline (Lesson 14) send a metric or a log line on every release. Even a{" "}
            <code>put-metric-data --metric-name Deploy</code> command is enough. Add it to the
            dashboard. Suppose the error graph jumps at 14:02 and a deploy marker sits at 14:01. Then
            you have a suspect in ten seconds.
          </p>
        </Callout>

        <h2 id="alerting">How to alert without burning out your team</h2>
        <p>
          Alarms that warn about nothing get muted. A muted alarm system is worse than no alarm
          system. These habits separate experienced teams from the rest:
        </p>
        <ul>
          <li>
            <strong>Alert on symptoms, not causes.</strong> A symptom is what users feel. &ldquo;Users
            are getting errors&rdquo; and &ldquo;the site is slow&rdquo; always deserve attention.
            &ldquo;CPU is 75%&rdquo; may be perfectly healthy. Put cause metrics on the dashboard to
            help you diagnose. Do not send them to your phone.
          </li>
          <li>
            <strong>Every alert must lead to an action.</strong> If your reaction to an alert is
            &ldquo;ignore it, that always happens&rdquo;, delete it or change its settings that day.
          </li>
          <li>
            <strong>Two levels.</strong> A <em>page</em> wakes a person now. Use it for a total
            outage, errors that continue, or data at risk. A <em>ticket</em> can wait until
            tomorrow. Use it for a disk at 70%, a certificate that expires in 20 days, or one failed
            job. Send the two levels to different channels.
          </li>
          <li>
            <strong>Put a runbook link in every alarm description.</strong> A runbook is a short
            guide that says what the alarm means, how to confirm it, the first three things to try
            and who to call next. The person at 3 a.m. is tired and may not be the person who built
            the system.
          </li>
          <li>
            <strong>Alert when good things stop.</strong> No traffic, no signups, no finished jobs.
            These silent failures produce no errors.
          </li>
          <li>
            <strong>Review your alerts every month.</strong> Which ones fired? Which ones mattered?
            Which never fired? Alerts, like tests, go out of date.
          </li>
        </ul>
        <Callout kind="note" label="SLI, SLO, error budget in one paragraph">
          <p className="mb-0">
            An <strong>SLI</strong> (service level indicator) is a measurement, such as the share of
            requests that succeed in under 500 ms. An <strong>SLO</strong> (service level objective)
            is your target for it, such as 99.9% over 30 days. The gap is 0.1%, or about 43 minutes
            a month. This gap is your <strong>error budget</strong>. It is the room you have for
            risky changes. When you have used up the budget, you slow down and work on reliability.
            This turns &ldquo;how reliable should we be?&rdquo; from an argument into a number.
          </p>
        </Callout>

        <h2 id="incident">When the alarm fires: a debugging routine</h2>
        <p>
          Have a routine. Then a tired mind can follow steps instead of guessing:
        </p>
        <ol className="steps">
          <li>
            <h3>Is it real, and how big?</h3>
            <p>
              Open the dashboard. Are errors up? Is it for everyone, or for one part (one tenant, one
              endpoint, one Availability Zone)? Since when? Is there a deploy marker just before?
            </p>
          </li>
          <li>
            <h3>Stop the bleeding first</h3>
            <p>
              If a deploy caused it, <strong>roll back now</strong> (Lesson 14) and investigate
              afterwards. Getting the service back matters more than understanding the cause. You can
              also add servers, switch to a standby, or turn off a feature flag (a switch that turns
              a feature on or off). Use whatever restores service to users fastest.
            </p>
          </li>
          <li>
            <h3>Walk the golden signals down the stack</h3>
            <p>
              Start with the ALB errors or latency. Then check the servers behind it: healthy hosts,
              CPU and memory. Then check what they depend on: RDS CPU, connections and storage, and
              Redis memory and hit rate. The first red graph in this chain is usually the cause.
            </p>
          </li>
          <li>
            <h3>Read the logs for the exact minute</h3>
            <p>
              Run the &ldquo;recent errors&rdquo; and &ldquo;errors by tenant&rdquo; Insights queries
              for the time of the incident. Take one <code>requestId</code> and read its whole story.
            </p>
          </li>
          <li>
            <h3>Write down what you learn, while it is fresh</h3>
            <p>
              Write the timeline, the cause and the fix. Then write the most valuable part: what would
              have caught it sooner? Add that alarm or log field. A blameless post-mortem is a review
              that looks for what to improve, not for who to blame. It turns each outage into a
              lasting improvement.
            </p>
          </li>
        </ol>

        <h2 id="cost">What this costs, and the log bill trap</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Item</th><th>Approximate price</th></tr>
            </thead>
            <tbody>
              <tr><td>AWS service metrics (EC2 5-min, ALB, RDS, ElastiCache)</td><td className="font-semibold text-emerald-300">Free</td></tr>
              <tr><td>Standard alarms</td><td>First 10 free, then about $0.10 per alarm per month</td></tr>
              <tr><td>Custom metrics (agent, business)</td><td>First 10 free, then about $0.30 per metric per month</td></tr>
              <tr><td>Dashboards</td><td>First 3 free, then $3 each per month</td></tr>
              <tr><td>Log ingestion</td><td>about $0.50 to $0.70 per GB. <strong>This is the one that surprises people</strong></td></tr>
              <tr><td>Log storage</td><td>about $0.03 per GB per month (free after the retention time ends, because the data is deleted)</td></tr>
              <tr><td>Logs Insights queries</td><td>about $0.005 per GB scanned</td></tr>
              <tr><td>SNS email notifications</td><td className="font-semibold text-emerald-300">Free (first 1,000 a month)</td></tr>
            </tbody>
          </table>
        </div>
        <Callout kind="warn" label="Log ingestion is where monitoring bills explode">
          <p className="mb-0">
            Suppose a busy app logs 2 KB for each request at 50 requests a second. That makes about 8
            GB a day. It costs over $100 a month just to take in the data (ingest it), before you
            store it. The usual causes are these: leaving <code>debug</code> on in production, logging
            every request body, logging health checks, and endless loops of retried errors that each
            write a log line. Set the level to <code>info</code>. Log only a sample of very frequent
            lines. Check the log group&apos;s <em>stored bytes</em> every month. The metrics, alarms
            and dashboard from this lesson cost only a few dollars. Logs are where careful habits save
            money.
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
                  I watch the four golden signals: latency (using percentiles), traffic, errors and
                  saturation. In practice that means load balancer 5xx errors and p95 latency, the
                  healthy host count, server CPU, memory and disk, database CPU, connections and free
                  storage, cache hit rate and memory, and business metrics such as signups and payments.
                </p>
              ),
            },
            {
              q: "Why percentiles instead of averages?",
              a: (
                <p className="mb-0">
                  Averages hide the slow tail. A few very slow requests barely change the average, but
                  real users suffer. p95 and p99 show what the slowest users experience. SLOs should
                  use them.
                </p>
              ),
            },
            {
              q: "EC2 memory usage isn’t in CloudWatch by default. Why, and what do you do?",
              a: (
                <p className="mb-0">
                  The hypervisor sees CPU and network, but not what happens inside the guest operating
                  system. I install the CloudWatch agent, with an instance role, to publish memory and
                  disk metrics. I add it to the launch template so every instance has it.
                </p>
              ),
            },
            {
              q: "Metrics vs logs vs traces?",
              a: (
                <p className="mb-0">
                  Metrics are cheap summary numbers. I use them to detect problems and to alert. Logs are
                  detailed events. I use them to explain problems. Traces follow one request across
                  services. I use them to find where time is lost. So I detect with metrics, diagnose
                  with logs, and pinpoint with traces.
                </p>
              ),
            },
            {
              q: "How do you avoid alert fatigue?",
              a: (
                <p className="mb-0">
                  I alert on symptoms that users can see. I make every alert lead to an action, with a
                  runbook. I separate pages from tickets. I set thresholds and evaluation windows so that
                  short spikes are ignored. I delete alerts that nobody acts on, and I review the alerts
                  regularly.
                </p>
              ),
            },
            {
              q: "The site is down but there are no 5xx errors on the ALB. What alarm would have caught it?",
              a: (
                <p className="mb-0">
                  A traffic-absence alarm would have caught it. It alarms when RequestCount is below a
                  minimum, and it treats missing data as a breach. A health check from outside, such as a
                  Route 53 health check or a synthetic check (a scripted test), would also work. DNS,
                  certificate or network failures produce no errors, because no requests arrive.
                </p>
              ),
            },
            {
              q: "Your CloudWatch bill tripled. Where do you look?",
              a: (
                <p className="mb-0">
                  I look at log ingestion first. Which log group grew (the IncomingBytes metric shows
                  this)? Is debug logging left on? Are health checks or request bodies logged? Are there
                  error loops? Then I check how many different custom metrics there are (their
                  cardinality) and the Logs Insights scans. I fix it with log levels, sampling,
                  retention times and metric filters.
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
            <code>set-alarm-state</code>. Check that the email arrives and that its description would
            help a stranger.
          </li>
          <li>
            Send logs to CloudWatch with the <code>awslogs</code> driver. Set a 30-day retention. Run{" "}
            <code>aws logs tail</code> while you click around the site.
          </li>
          <li>
            Switch the app to JSON logging with request IDs and tenant IDs. Save three Logs Insights
            queries: recent errors, slowest routes and the story of one request.
          </li>
          <li>
            Break something on purpose. Stop the app on one server, or make a route throw an error.
            Then watch three things: an alarm fires, you find the cause in the logs, and the recovery
            email arrives.
          </li>
          <li>
            Install the CloudWatch agent on one server. Find <code>mem_used_percent</code> in the
            console. Add a memory alarm.
          </li>
          <li>
            Build the dashboard. Sort one alarm as page-worthy and one as ticket-worthy. Write a
            three-line runbook for each.
          </li>
        </ol>
        <Callout kind="ok" label="Optional stretch">
          <p className="mb-0">
            Create a free external uptime check (UptimeRobot or a similar service) on your public URL.
            It does not depend on AWS. So it also catches the case where your whole AWS setup, or your
            DNS, is down. Then try Container Insights or Application Signals in the console. They show
            what more automatic monitoring looks like.
          </p>
        </Callout>

        <h2 id="conclusion">Conclusion</h2>
        <p>
          You can now see the system, and it can call you. This changes how you run it. You no longer
          guess nervously. You follow a routine.
        </p>
        <ul>
          <li>
            <strong>Watch the four golden signals</strong>: latency (percentiles), traffic, errors
            and saturation. Remember that EC2 hides memory and disk until you install the agent.
          </li>
          <li>
            <strong>Alarms send messages to SNS.</strong> Confirm the subscription and test the path.
            Alert on symptoms, put a runbook in the description, and also alert when traffic
            disappears.
          </li>
          <li>
            <strong>Send logs off the server.</strong> Use structured JSON with request IDs and tenant
            IDs, and never log secrets. Search with Logs Insights. Turn log patterns and business
            events into metrics.
          </li>
          <li>
            <strong>One dashboard</strong>, ordered like the path of a request, with deploy markers.
          </li>
          <li>
            <strong>Log ingestion is the cost trap.</strong> Use the info level, set a retention time,
            and do not log health checks.
          </li>
        </ul>
        <p>
          You can now observe the system. Next, make it hard to break into and impossible to lose.
          That means security hardening (making a system harder to attack) and backups.
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
