import { LegalLayout } from "@/components/legal-layout";
import FloatingNav from "@/components/pagenavbar";

export const metadata = {
  title: "Meta Verified | ChatAutoDM",
  description:
    "We are an app verified by Meta and use the official Meta APIs. Learn how we handle data security and privacy.",
};

export default function MetaVerifiedPage() {
  return (
    <>
      {/* <FloatingNav /> */}
      <LegalLayout title="Meta Verified">
        <p>
          Transparency and trust matter. ChatAutoDM is an app verified by Meta and integrates with the
          official Meta (Facebook/Instagram) APIs for messaging and automation.
        </p>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Official Meta API Usage</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We communicate with Instagram/Facebook using the <strong>Meta Graph API</strong>. Webhook
              verification, message delivery, and account operations follow Meta’s documented endpoints and
              policies. We do <em>not</em> use workarounds, browser automation, or private APIs.
            </p>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold">App Verification</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Our app has completed Meta’s verification requirements to access messaging features. This ensures
              we comply with platform policies, permission reviews, and required disclosures.
            </p>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Data Security</h2>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground list-disc pl-5">
              <li>We request the <strong>minimum scopes</strong> required to operate your automations.</li>
              <li>Access tokens are stored securely and never exposed to client-side code.</li>
              <li>We encrypt secrets at rest where supported by the hosting provider.</li>
              <li>All communication with Meta APIs occurs over <strong>HTTPS</strong>.</li>
            </ul>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Passwords & Credentials</h2>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground list-disc pl-5">
              <li>
                We <strong>do not</strong> collect your Instagram passwords. Authentication is handled via Meta’s
                OAuth and Access Tokens.
              </li>
              <li>
                Workspace-level credentials (if any) are restricted by role and used only for their intended purpose.
              </li>
            </ul>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm md:col-span-2">
            <h2 className="text-xl font-semibold">Privacy & Compliance</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We respect your privacy and your users’ privacy. For more details about data retention, deletion,
              and user rights, please review our <a href="/privacy" className="underline">Privacy Policy</a> and
              {" "}
              <a href="/terms" className="underline">Terms</a>.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-xl bg-blue-50 border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-blue-900">Questions?</h3>
          <p className="mt-2 text-sm text-blue-800">
            If you’d like more details about our Meta verification or data handling practices, contact us at
            <a href="mailto:support@chatautodm.com" className="ml-1 underline">support@chatautodm.com</a>.
          </p>
        </div>
      </LegalLayout>
    </>
  );
}
