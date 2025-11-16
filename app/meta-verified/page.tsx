import { LegalLayout } from "@/components/legal-layout";
import FloatingNav from "@/components/pagenavbar";

export default function MetaVerifiedPage() {
  return (
    <>
      {/* <FloatingNav /> */}
  <LegalLayout title="Meta Verification & API Compliance">
  <div className="mb-8">
    <h1 className="text-3xl font-bold mb-4">Meta Verification & API Compliance</h1>
    <p className="text-lg text-muted-foreground mb-4">
      ChatAutoDM is a <strong>Meta Business-Verified</strong> and <strong>Access-Verified Tech Provider</strong>,
      approved to use the official Meta (Facebook/Instagram) Graph API for messaging and automation.
    </p>
    <p className="text-muted-foreground">
      Our verification confirms that we securely handle Instagram automation using official Meta APIs, 
      following all platform policies and security guidelines.
    </p>
  </div>

  <div className="mt-6 grid gap-6 md:grid-cols-2">
    
    {/* Official Graph API Block */}
    <div className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6.267 3.455a3.066..." />
        </svg>
        <h2 className="text-xl font-semibold">Official Meta Graph API</h2>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        ChatAutoDM integrates exclusively with the <strong>official Meta Graph API</strong> for all Instagram operations. 
        We never use private APIs, browser automation, or scraping techniques that violate Meta policies.
      </p>
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-800 font-medium">✓ 100% Meta-Compliant</p>
      </div>
    </div>

    {/* Meta Verification Block */}
    <div className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M2.166 4.999..." />
        </svg>
        <h2 className="text-xl font-semibold">Meta Business & Access Verification</h2>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Our parent business is <strong>Business Verified</strong> by Meta, and ChatAutoDM has completed 
        <strong> Access Verification</strong> as an approved <strong>Tech Provider</strong>. 
        This allows us to securely manage advanced API features and business assets.
      </p>
      <div className="mt-4 p-3 bg-green-50 rounded-lg">
        <p className="text-xs text-green-800 font-medium">✓ Official Meta Business Verification</p>
        <p className="text-xs text-green-800 font-medium">✓ Meta Access-Verified Tech Provider</p>
      </div>
    </div>

    {/* Security */}
    <div className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-6 h-6 text-purple-600" fill="currentColor"><path d="M5 9V7..." /></svg>
        <h2 className="text-xl font-semibold">Data Security & Encryption</h2>
      </div>
      <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
        <li>✓ Minimum required OAuth scopes only</li>
        <li>✓ AES-256 token encryption</li>
        <li>✓ Encrypted secrets at rest</li>
        <li>✓ TLS 1.3 API communication</li>
        <li>✓ Regular internal security checks</li>
      </ul>
    </div>

    {/* OAuth */}
    <div className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-6 h-6 text-orange-600" fill="currentColor"><path d="M18 8a6..." /></svg>
        <h2 className="text-xl font-semibold">Secure OAuth Authentication</h2>
      </div>
      <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
        <li>✓ We never ask for your Instagram password</li>
        <li>✓ Direct Meta OAuth login only</li>
        <li>✓ Access can be revoked anytime</li>
        <li>✓ Permissions follow least-privilege model</li>
      </ul>
    </div>

    {/* Privacy Compliance */}
    <div className="rounded-xl border bg-card p-6 shadow-sm md:col-span-2 hover:shadow-md transition">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-6 h-6 text-indigo-600" fill="currentColor"><path d="M2.166..." /></svg>
        <h2 className="text-xl font-semibold">Privacy & User Rights</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        We follow privacy-by-design principles and give users full control over data collection, storage, and deletion.
      </p>
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-2 bg-indigo-50 rounded text-center"><p className="text-xs font-semibold">Privacy Focused</p></div>
        <div className="p-2 bg-indigo-50 rounded text-center"><p className="text-xs font-semibold">User Data Control</p></div>
        <div className="p-2 bg-indigo-50 rounded text-center"><p className="text-xs font-semibold">Secure Infrastructure</p></div>
        <div className="p-2 bg-indigo-50 rounded text-center"><p className="text-xs font-semibold">API-First Safety</p></div>
      </div>
    </div>
  </div>

  {/* FAQ */}
  <div className="mt-12">
    <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>

    <details className="group rounded-lg border p-4 hover:shadow-md transition">
      <summary className="font-semibold cursor-pointer flex justify-between items-center">
        What type of Meta verification does ChatAutoDM have?
        <span className="group-open:rotate-180 transition">▼</span>
      </summary>
      <p className="mt-3 text-sm text-muted-foreground">
        ChatAutoDM’s parent business is <strong>Business Verified</strong> by Meta, and we are approved as an
        <strong> Access-Verified Tech Provider</strong>, allowing secure and compliant API usage.
      </p>
    </details>

    <details className="group rounded-lg border p-4 hover:shadow-md transition">
      <summary className="font-semibold cursor-pointer flex justify-between items-center">
        Is my Instagram account safe with ChatAutoDM?
        <span className="group-open:rotate-180 transition">▼</span>
      </summary>
      <p className="mt-3 text-sm text-muted-foreground">
        Yes — we use Meta’s official OAuth system, never request passwords, and encrypt all sensitive data.
      </p>
    </details>

    <details className="group rounded-lg border p-4 hover:shadow-md transition">
      <summary className="font-semibold cursor-pointer flex justify-between items-center">
        Do you use any unofficial automation?
        <span className="group-open:rotate-180 transition">▼</span>
      </summary>
      <p className="mt-3 text-sm text-muted-foreground">
        No. ChatAutoDM uses only the official Meta Graph API, ensuring full compliance with platform rules.
      </p>
    </details>
  </div>
</LegalLayout>

    </>
  );
}
