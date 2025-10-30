import { LegalLayout } from "@/components/legal-layout";
import FloatingNav from "@/components/pagenavbar";

export default function MetaVerifiedPage() {
  return (
    <>
      {/* <FloatingNav /> */}
      <LegalLayout title="Meta Verified Technology Provider">
        {/* SEO-rich introduction */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">ChatAutoDM - Official Meta Verified Partner</h1>
          <p className="text-lg text-muted-foreground mb-4">
            Transparency and trust matter. ChatAutoDM is an <strong>official Meta Verified Technology Provider</strong> and integrates exclusively with the
            official Meta (Facebook/Instagram) Graph API for messaging and automation.
          </p>
          <p className="text-muted-foreground">
            As a Meta Business Partner, we adhere to the highest standards of data security, API compliance, and privacy protection. 
            Our verification ensures you're using a trusted, secure platform for your Instagram automation needs.
          </p>
        </div>

                <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              <h2 className="text-xl font-semibold">Official Meta Graph API</h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              We exclusively use the <strong>official Meta Graph API</strong> for all Instagram and Facebook operations. Webhook
              verification, message delivery, and account management follow Meta's documented endpoints and
              best practices. We <em>never</em> use workarounds, browser automation, screen scraping, or private APIs that violate Meta's terms.
            </p>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-800 font-medium">✓ 100% Compliant with Meta Policies</p>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              <h2 className="text-xl font-semibold">Meta App Verification & Certification</h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              ChatAutoDM has successfully completed <strong>Meta's rigorous App Verification</strong> process to access advanced Instagram messaging features. 
              This certification ensures we meet strict requirements for platform policies, security reviews, permission audits, and data protection standards.
            </p>
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-green-800 font-medium">✓ Meta Verified Technology Provider Badge</p>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
              </svg>
              <h2 className="text-xl font-semibold">Enterprise-Grade Data Security</h2>
            </div>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground list-none pl-0">
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-0.5">✓</span>
                <span>We request only the <strong>minimum OAuth scopes</strong> required to operate your automations (messages_read, messages_write).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-0.5">✓</span>
                <span>Access tokens are stored with <strong>AES-256 encryption</strong> and never exposed to client-side code or third parties.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-0.5">✓</span>
                <span>All secrets are encrypted at rest using industry-standard encryption protocols.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-0.5">✓</span>
                <span>Every API communication with Meta servers uses <strong>TLS 1.3+ HTTPS</strong> encryption.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-0.5">✓</span>
                <span>Regular security audits and penetration testing by third-party experts.</span>
              </li>
            </ul>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd"/>
              </svg>
              <h2 className="text-xl font-semibold">No Passwords Required - OAuth Authentication</h2>
            </div>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground list-none pl-0">
              <li className="flex items-start gap-2">
                <span className="text-orange-600 mt-0.5">✓</span>
                <span>
                  We <strong>never ask for your Instagram password</strong>. All authentication is handled securely through Meta's OAuth 2.0 flow.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 mt-0.5">✓</span>
                <span>
                  You authorize access directly on Meta's secure servers - we only receive temporary access tokens.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 mt-0.5">✓</span>
                <span>
                  You can revoke ChatAutoDM's access anytime from your Instagram or Facebook settings.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 mt-0.5">✓</span>
                <span>
                  Workspace-level permissions are role-based and follow the principle of least privilege.
                </span>
              </li>
            </ul>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm md:col-span-2 hover:shadow-md transition">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              <h2 className="text-xl font-semibold">GDPR, CCPA & Privacy Compliance</h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              We respect your privacy and your users' privacy as a fundamental right. ChatAutoDM is fully compliant with <strong>GDPR (EU)</strong>, 
              <strong> CCPA (California)</strong>, and other global data protection regulations. We implement privacy-by-design principles and give you 
              full control over data collection, retention, and deletion.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              For comprehensive details about data retention policies, user rights (access, deletion, portability), cookie usage, and third-party integrations,
              please review our <a href="/privacy" className="underline text-blue-600 hover:text-blue-800">Privacy Policy</a> and
              {" "}
              <a href="/terms" className="underline text-blue-600 hover:text-blue-800">Terms of Service</a>.
            </p>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-2 bg-indigo-50 rounded text-center">
                <p className="text-xs font-semibold text-indigo-900">GDPR Compliant</p>
              </div>
              <div className="p-2 bg-indigo-50 rounded text-center">
                <p className="text-xs font-semibold text-indigo-900">CCPA Compliant</p>
              </div>
              <div className="p-2 bg-indigo-50 rounded text-center">
                <p className="text-xs font-semibold text-indigo-900">SOC 2 Type II</p>
              </div>
              <div className="p-2 bg-indigo-50 rounded text-center">
                <p className="text-xs font-semibold text-indigo-900">ISO 27001</p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust badges section */}
        <div className="mt-8 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-8">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Why Trust Matters</h3>
            <p className="mt-2 text-gray-700">ChatAutoDM is trusted by businesses worldwide</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">50,000+</div>
              <div className="text-sm text-gray-600 mt-1">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">10M+</div>
              <div className="text-sm text-gray-600 mt-1">Messages Delivered</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">99.9%</div>
              <div className="text-sm text-gray-600 mt-1">Uptime SLA</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600">4.9/5</div>
              <div className="text-sm text-gray-600 mt-1">User Rating</div>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-xl bg-blue-50 border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-blue-900">Have Questions About Our Meta Verification?</h3>
          <p className="mt-2 text-sm text-blue-800">
            If you'd like more details about our Meta verification status, security practices, compliance certifications, or data handling procedures, our team is here to help.
          </p>
          <div className="mt-4 flex flex-wrap gap-4">
            <a href="mailto:support@chatautodm.com" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
              </svg>
              Email Support
            </a>
            <a href="/privacy" className="inline-flex items-center px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition text-sm font-medium">
              View Privacy Policy
            </a>
          </div>
        </div>

        {/* FAQ Schema for SEO */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <details className="group rounded-lg border p-4 hover:shadow-md transition">
              <summary className="font-semibold cursor-pointer flex justify-between items-center">
                What does "Meta Verified" mean?
                <span className="group-open:rotate-180 transition">▼</span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">
                Meta Verified means ChatAutoDM has completed Meta's official App Review and Verification process. We use authentic Meta APIs, comply with all platform policies, and maintain the highest security standards.
              </p>
            </details>

            <details className="group rounded-lg border p-4 hover:shadow-md transition">
              <summary className="font-semibold cursor-pointer flex justify-between items-center">
                Is my Instagram account safe with ChatAutoDM?
                <span className="group-open:rotate-180 transition">▼</span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">
                Absolutely. We use Meta's official OAuth authentication, never ask for passwords, employ bank-level encryption, and are fully compliant with Meta's security requirements. Your account is as safe as using Instagram directly.
              </p>
            </details>

            <details className="group rounded-lg border p-4 hover:shadow-md transition">
              <summary className="font-semibold cursor-pointer flex justify-between items-center">
                Can Meta suspend my account for using ChatAutoDM?
                <span className="group-open:rotate-180 transition">▼</span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">
                No. ChatAutoDM is an official Meta Technology Provider using authentic APIs. Unlike unauthorized bots that violate Meta's terms, our platform is fully compliant and approved by Meta.
              </p>
            </details>

            <details className="group rounded-lg border p-4 hover:shadow-md transition">
              <summary className="font-semibold cursor-pointer flex justify-between items-center">
                How do you handle my data?
                <span className="group-open:rotate-180 transition">▼</span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">
                We collect only the minimum data needed for automation (messages, contacts). All data is encrypted, stored securely, and you can delete it anytime. We never sell your data and are GDPR/CCPA compliant.
              </p>
            </details>
          </div>
        </div>
      </LegalLayout>
    </>
  );
}
