import type { ReactNode } from "react";

function ArchitectureDiagram() {
  return (
    <svg
      className="diagram"
      viewBox="0 0 800 480"
      role="img"
      aria-labelledby="arch-title arch-desc"
      preserveAspectRatio="xMidYMid meet"
      fontFamily="inherit"
    >
      <title id="arch-title">Architecture diagram</title>
      <desc id="arch-desc">
        The browser loads the SPA from CloudFront, which serves the static bundle from a private S3
        bucket. The browser calls the HTTP API Gateway, which routes to the API Lambda. The API
        Lambda writes tasks to DynamoDB and enqueues a message on SQS. SQS triggers the Worker
        Lambda, which sleeps for the requested number of seconds and updates the task status in
        DynamoDB.
      </desc>

      <defs>
        <marker
          id="arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#6b7280" />
        </marker>
      </defs>

      <g transform="translate(40,200)">
        <rect width="120" height="64" rx="8" fill="#ffffff" stroke="#2563eb" strokeWidth="1.5" />
        <text x="60" y="38" textAnchor="middle" fontSize="14" fill="#1a1a1a" fontWeight="600">
          Browser
        </text>
      </g>

      <g transform="translate(230,40)">
        <rect width="140" height="64" rx="8" fill="#ffffff" stroke="#2563eb" strokeWidth="1.5" />
        <text x="70" y="32" textAnchor="middle" fontSize="13" fill="#1a1a1a" fontWeight="600">
          CloudFront
        </text>
        <text x="70" y="50" textAnchor="middle" fontSize="11" fill="#555">
          CDN + HTTPS
        </text>
      </g>

      <g transform="translate(560,40)">
        <rect width="180" height="64" rx="8" fill="#ffffff" stroke="#0ea5e9" strokeWidth="1.5" />
        <text x="90" y="32" textAnchor="middle" fontSize="13" fill="#1a1a1a" fontWeight="600">
          S3 (private)
        </text>
        <text x="90" y="50" textAnchor="middle" fontSize="11" fill="#555">
          Static SPA bundle
        </text>
      </g>

      <g transform="translate(230,200)">
        <rect width="140" height="64" rx="8" fill="#ffffff" stroke="#2563eb" strokeWidth="1.5" />
        <text x="70" y="32" textAnchor="middle" fontSize="13" fill="#1a1a1a" fontWeight="600">
          API Gateway
        </text>
        <text x="70" y="50" textAnchor="middle" fontSize="11" fill="#555">
          HTTP API
        </text>
      </g>

      <g transform="translate(420,200)">
        <rect width="160" height="64" rx="8" fill="#ffffff" stroke="#f59e0b" strokeWidth="1.5" />
        <text x="80" y="32" textAnchor="middle" fontSize="13" fill="#1a1a1a" fontWeight="600">
          API Lambda
        </text>
        <text x="80" y="50" textAnchor="middle" fontSize="11" fill="#555">
          Python 3.12
        </text>
      </g>

      <g transform="translate(420,360)">
        <rect width="160" height="64" rx="8" fill="#ffffff" stroke="#0ea5e9" strokeWidth="1.5" />
        <text x="80" y="32" textAnchor="middle" fontSize="13" fill="#1a1a1a" fontWeight="600">
          SQS Queue
        </text>
        <text x="80" y="50" textAnchor="middle" fontSize="11" fill="#555">
          + Dead-Letter Queue
        </text>
      </g>

      <g transform="translate(190,360)">
        <rect width="180" height="64" rx="8" fill="#ffffff" stroke="#f59e0b" strokeWidth="1.5" />
        <text x="90" y="32" textAnchor="middle" fontSize="13" fill="#1a1a1a" fontWeight="600">
          Worker Lambda
        </text>
        <text x="90" y="50" textAnchor="middle" fontSize="11" fill="#555">
          Python 3.12 — sleeps N s
        </text>
      </g>

      <g transform="translate(620,200)">
        <rect width="140" height="64" rx="8" fill="#ffffff" stroke="#0ea5e9" strokeWidth="1.5" />
        <text x="70" y="32" textAnchor="middle" fontSize="13" fill="#1a1a1a" fontWeight="600">
          DynamoDB
        </text>
        <text x="70" y="50" textAnchor="middle" fontSize="11" fill="#555">
          tasks
        </text>
      </g>

      <line x1="160" y1="220" x2="226" y2="80" stroke="#6b7280" strokeWidth="1.4" markerEnd="url(#arrow)" />
      <rect x="172" y="138" width="48" height="16" fill="#ffffff" />
      <text x="196" y="150" textAnchor="middle" fontSize="11" fill="#555">
        load SPA
      </text>

      <line x1="370" y1="72" x2="556" y2="72" stroke="#6b7280" strokeWidth="1.4" markerEnd="url(#arrow)" />
      <rect x="438" y="60" width="50" height="16" fill="#ffffff" />
      <text x="463" y="72" textAnchor="middle" fontSize="11" fill="#555">
        OAC
      </text>

      <line x1="160" y1="232" x2="226" y2="232" stroke="#6b7280" strokeWidth="1.4" markerEnd="url(#arrow)" />
      <rect x="170" y="218" width="50" height="16" fill="#ffffff" />
      <text x="195" y="230" textAnchor="middle" fontSize="11" fill="#555">
        HTTPS
      </text>

      <line x1="370" y1="232" x2="416" y2="232" stroke="#6b7280" strokeWidth="1.4" markerEnd="url(#arrow)" />

      <line x1="580" y1="232" x2="616" y2="232" stroke="#6b7280" strokeWidth="1.4" markerEnd="url(#arrow)" />
      <rect x="568" y="218" width="60" height="16" fill="#ffffff" />
      <text x="598" y="230" textAnchor="middle" fontSize="11" fill="#555">
        write/read
      </text>

      <line x1="500" y1="264" x2="500" y2="356" stroke="#6b7280" strokeWidth="1.4" markerEnd="url(#arrow)" />
      <rect x="476" y="302" width="48" height="16" fill="#ffffff" />
      <text x="500" y="314" textAnchor="middle" fontSize="11" fill="#555">
        send
      </text>

      <line x1="420" y1="392" x2="372" y2="392" stroke="#6b7280" strokeWidth="1.4" markerEnd="url(#arrow)" />
      <rect x="376" y="378" width="56" height="16" fill="#ffffff" />
      <text x="404" y="390" textAnchor="middle" fontSize="11" fill="#555">
        trigger
      </text>

      <path
        d="M 370 376 Q 560 360 660 264"
        fill="none"
        stroke="#6b7280"
        strokeWidth="1.4"
        markerEnd="url(#arrow)"
      />
      <rect x="540" y="332" width="56" height="16" fill="#ffffff" />
      <text x="568" y="344" textAnchor="middle" fontSize="11" fill="#555">
        update
      </text>
    </svg>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 id={id}>{title}</h2>
      {children}
    </section>
  );
}

function Pill({ children }: { children: ReactNode }) {
  return <span className="pill">{children}</span>;
}

export default function DocsPage() {
  return (
    <main className="docs">
      <h1>Architecture &amp; Engineering Notes</h1>
      <p className="subtitle">
        A short technical tour of how this demo is built, deployed, and operated on AWS.
      </p>

      <Section id="overview" title="Overview">
        <p>
          This is a small but production-shaped demo of an asynchronous task pattern on AWS. A
          user submits an integer <code>N</code> from the browser; a Python worker Lambda sleeps
          for <code>N</code> seconds and reports back. The UI polls for status updates. Every
          piece — frontend hosting, API, compute, queue, database, identity — is provisioned by
          Terraform and deployed by GitHub Actions.
        </p>
      </Section>

      <Section id="why" title="What this demonstrates">
        <ul>
          <li>
            <strong>Event-driven serverless design.</strong> API and worker are decoupled by SQS,
            so slow tasks never block the request path and the worker scales independently.
          </li>
          <li>
            <strong>Reproducible infrastructure.</strong> Every AWS resource lives in Terraform —
            no clicks in the console, no drift between environments.
          </li>
          <li>
            <strong>No long-lived cloud credentials.</strong> CI deploys with a short-lived role
            assumed via GitHub OIDC.
          </li>
          <li>
            <strong>Least-privilege IAM.</strong> Each Lambda gets only the DynamoDB and SQS
            actions it actually uses.
          </li>
          <li>
            <strong>Type-safe end to end.</strong> Strict TypeScript on the frontend, mypy on the
            Python handlers, ruff for formatting and lint.
          </li>
          <li>
            <strong>Failure isolation.</strong> A dead-letter queue captures messages the worker
            cannot process after three attempts, so bad input never poisons the queue forever.
          </li>
        </ul>
      </Section>

      <Section id="diagram" title="Architecture diagram">
        <ArchitectureDiagram />
        <p className="subtitle">
          The browser loads the SPA from CloudFront (which fronts a private S3 bucket via Origin
          Access Control), then talks to API Gateway. The API Lambda persists the task to
          DynamoDB and enqueues a job on SQS. The Worker Lambda is invoked by the queue, performs
          the work, and writes the result back to DynamoDB.
        </p>
      </Section>

      <Section id="flow" title="Request flow">
        <h3>Submitting a task</h3>
        <ol>
          <li>Browser <code>POST /tasks</code> with <code>{`{ "input_seconds": N }`}</code>.</li>
          <li>API Gateway routes the request to the API Lambda.</li>
          <li>
            API Lambda generates a UUID, writes a <code>pending</code> row to DynamoDB, and sends
            a message to SQS containing the task id and seconds.
          </li>
          <li>API Lambda returns the task object to the browser.</li>
          <li>SQS triggers the Worker Lambda with batch size 1.</li>
          <li>
            Worker marks the task <code>in_progress</code>, sleeps the requested seconds, then
            marks it <code>completed</code> with the measured duration.
          </li>
        </ol>

        <h3>Reading task state</h3>
        <ol>
          <li>The UI calls <code>GET /tasks</code> every second while open.</li>
          <li>API Lambda scans DynamoDB and returns tasks newest first.</li>
          <li>The badge transitions <em>pending → in progress → completed</em> in place.</li>
        </ol>
      </Section>

      <Section id="components" title="AWS components">
        <table className="docs-table">
          <thead>
            <tr>
              <th>Service</th>
              <th>Role</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>CloudFront</td>
              <td>Global CDN for the SPA</td>
              <td>HTTPS via the default certificate; SPA fallback for 403/404 to <code>index.html</code>.</td>
            </tr>
            <tr>
              <td>S3</td>
              <td>Static asset storage</td>
              <td>Private bucket, accessed only by CloudFront via Origin Access Control (OAC).</td>
            </tr>
            <tr>
              <td>API Gateway (HTTP API)</td>
              <td>Public REST entry point</td>
              <td>CORS scoped to CloudFront and <code>localhost:5173</code>; routes <code>POST/GET /tasks</code>.</td>
            </tr>
            <tr>
              <td>API Lambda</td>
              <td>Create / list tasks</td>
              <td>Python 3.12, 128 MB, 10 s timeout. Writes DynamoDB, sends SQS.</td>
            </tr>
            <tr>
              <td>Worker Lambda</td>
              <td>Execute the task</td>
              <td>Python 3.12, 128 MB, 15 min timeout. Triggered by SQS, updates DynamoDB.</td>
            </tr>
            <tr>
              <td>DynamoDB</td>
              <td>Task store</td>
              <td>Table <code>tasks</code>, hash key <code>task_id</code>, <code>PAY_PER_REQUEST</code> billing.</td>
            </tr>
            <tr>
              <td>SQS + DLQ</td>
              <td>Decouple API from worker</td>
              <td>Main queue retains 4 days; after 3 receives the message moves to the DLQ (14-day retention).</td>
            </tr>
            <tr>
              <td>CloudWatch Logs</td>
              <td>Observability</td>
              <td>Log groups for both Lambdas, 14-day retention.</td>
            </tr>
            <tr>
              <td>IAM + GitHub OIDC</td>
              <td>Identity for CI</td>
              <td>GitHub Actions assumes a short-lived role — no AWS keys stored anywhere.</td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Section id="iac" title="Infrastructure as Code">
        <p>
          The entire stack lives under <code>terraform/</code> and deploys to <code>eu-west-1</code>.
          Resources follow a <code>{`\${var.project}_*`}</code> naming convention so they are easy
          to find in the AWS console and easy to tear down.
        </p>
        <table className="docs-table">
          <thead>
            <tr>
              <th>File</th>
              <th>Provisions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>main.tf</code></td>
              <td>DynamoDB table, SQS main queue and dead-letter queue.</td>
            </tr>
            <tr>
              <td><code>lambda.tf</code></td>
              <td>Both Lambda functions, IAM roles and policies, CloudWatch log groups, the SQS event source mapping.</td>
            </tr>
            <tr>
              <td><code>apigw.tf</code></td>
              <td>HTTP API, CORS configuration, routes, default stage.</td>
            </tr>
            <tr>
              <td><code>frontend.tf</code></td>
              <td>S3 bucket, CloudFront distribution, Origin Access Control, bucket policy.</td>
            </tr>
            <tr>
              <td><code>cicd.tf</code></td>
              <td>GitHub OIDC provider and the IAM role GitHub Actions assumes.</td>
            </tr>
            <tr>
              <td><code>variables.tf</code> / <code>outputs.tf</code> / <code>versions.tf</code></td>
              <td>Inputs (region, project, max seconds), exported endpoints, provider pinning.</td>
            </tr>
          </tbody>
        </table>
        <p>
          <code>terraform apply</code> from a clean checkout brings the full stack up; <code>terraform destroy</code> removes
          it (the S3 bucket has <code>force_destroy = true</code> so the built bundle is cleaned up too).
        </p>
      </Section>

      <Section id="cicd" title="CI/CD">
        <p>Two GitHub Actions workflows ship the project end to end.</p>

        <h3><code>ci.yml</code> — pull request gate</h3>
        <ul>
          <li>Python: <code>ruff format --check</code>, <code>ruff check</code>, <code>mypy</code>.</li>
          <li>Frontend: <code>npm ci</code> then <code>tsc -b &amp;&amp; vite build</code>.</li>
          <li>Terraform: <code>terraform fmt -check</code> and <code>terraform validate</code>.</li>
        </ul>

        <h3><code>deploy.yml</code> — push to <code>master</code></h3>
        <ol>
          <li>Assume the IAM role via GitHub OIDC (no static AWS keys).</li>
          <li><code>terraform apply -auto-approve</code> reconciles infrastructure.</li>
          <li>
            <code>scripts/deploy-frontend.sh</code> builds the SPA with the live <code>VITE_API_URL</code>,
            syncs it to S3, and invalidates the CloudFront cache so the new bundle is served immediately.
          </li>
        </ol>

        <div className="callout">
          <strong>No long-lived AWS access keys are stored in GitHub.</strong> The deploy job
          requests a short-lived OIDC token from GitHub and exchanges it for temporary AWS
          credentials scoped to a single role.
        </div>
      </Section>

      <Section id="stack" title="Tech stack">
        <div className="pills">
          <Pill>React 18</Pill>
          <Pill>TypeScript</Pill>
          <Pill>Vite</Pill>
          <Pill>Python 3.12</Pill>
          <Pill>AWS Lambda</Pill>
          <Pill>API Gateway HTTP API</Pill>
          <Pill>DynamoDB</Pill>
          <Pill>SQS</Pill>
          <Pill>CloudFront</Pill>
          <Pill>S3</Pill>
          <Pill>Terraform</Pill>
          <Pill>GitHub Actions</Pill>
          <Pill>OIDC</Pill>
          <Pill>ruff</Pill>
          <Pill>mypy</Pill>
        </div>
      </Section>
    </main>
  );
}
