import { LegalLayout } from "@/components/legal-layout"

export default function TermsOfService() {
  return (
    <LegalLayout title="Terms of Service">
      <section id="introduction" className="mb-12">
        <h2 className="font-montserrat font-bold text-2xl text-foreground mb-4 border-b-2 border-accent pb-2">
          1. Introduction
        </h2>
        <p className="text-foreground leading-relaxed mb-4">
          Welcome to ChatAutoDM, an advanced Instagram automation platform designed to help businesses, creators, and
          entrepreneurs automate their Instagram direct message responses and engagement workflows. These Terms of
          Service ("Terms") govern your use of our service and constitute a legally binding agreement between you and
          ChatAutoDM.
        </p>
        <p className="text-foreground leading-relaxed">
          By accessing or using ChatAutoDM, you acknowledge that you have read, understood, and agree to be bound by
          these Terms and our Privacy Policy. If you do not agree to these Terms, you must not use our service.
        </p>
      </section>

      <section id="acceptance" className="mb-12">
        <h2 className="font-montserrat font-bold text-2xl text-foreground mb-4 border-b-2 border-accent pb-2">
          2. Acceptance of Terms
        </h2>
        <p className="text-foreground leading-relaxed mb-4">These Terms become effective when you:</p>
        <ul className="list-disc list-inside text-foreground leading-relaxed mb-4 ml-4">
          <li>Create an account with ChatAutoDM</li>
          <li>Access or use any part of our service</li>
          <li>Connect your Instagram account to our platform</li>
          <li>Subscribe to any of our paid plans</li>
        </ul>
        <p className="text-foreground leading-relaxed">
          You represent that you are at least 18 years old and have the legal capacity to enter into this agreement. If
          you are using our service on behalf of a business or organization, you represent that you have the authority
          to bind that entity to these Terms.
        </p>
      </section>

      <section id="description" className="mb-12">
        <h2 className="font-montserrat font-bold text-2xl text-foreground mb-4 border-b-2 border-accent pb-2">
          3. Service Description
        </h2>
        <p className="text-foreground leading-relaxed mb-4">ChatAutoDM provides the following core services:</p>
        <div className="bg-muted p-6 rounded-lg mb-4">
          <h3 className="font-montserrat font-semibold text-lg text-foreground mb-3">Core Features:</h3>
          <ul className="list-disc list-inside text-foreground leading-relaxed space-y-2">
            <li>
              <strong>Automated DM Responses:</strong> AI-powered automatic replies to Instagram direct messages
            </li>
            <li>
              <strong>Comment-to-DM Workflows:</strong> Automated systems that respond to comments with direct messages
            </li>
            <li>
              <strong>Lead Collection:</strong> Automatic collection and organization of customer contact information
            </li>
            <li>
              <strong>Analytics & Insights:</strong> Detailed reporting on engagement metrics and audience behavior
            </li>
            <li>
              <strong>Customizable Responses:</strong> Tailored messaging that matches your brand voice
            </li>
            <li>
              <strong>Multi-Account Management:</strong> Support for managing multiple Instagram accounts
            </li>
          </ul>
        </div>
        <p className="text-foreground leading-relaxed">
          Our service operates exclusively through Instagram's official Graph API, ensuring compliance with Instagram's
          terms of service and maintaining the security and integrity of your account.
        </p>
      </section>

      <section id="account-responsibility" className="mb-12">
        <h2 className="font-montserrat font-bold text-2xl text-foreground mb-4 border-b-2 border-accent pb-2">
          4. Account Security and Meta API Compliance
        </h2>
        <p className="text-foreground leading-relaxed mb-4">
          ChatAutoDM is built exclusively on Meta's official Instagram Graph API and adheres to all Meta platform
          policies and guidelines. We take every precaution to ensure the safety and security of your Instagram
          account.
        </p>

        <div className="bg-accent/10 border border-accent/20 p-6 rounded-lg mb-6">
          <h3 className="font-montserrat font-semibold text-lg text-foreground mb-3">Our Commitment to Safety:</h3>
          <ul className="list-disc list-inside text-foreground leading-relaxed space-y-2">
            <li>
              <strong>Official Meta APIs Only:</strong> We use only Meta's authorized Instagram Graph API - no
              third-party scrapers, bots, or unofficial methods
            </li>
            <li>
              <strong>Platform Compliance:</strong> Our service is fully compliant with Meta's Platform Terms and
              Developer Policies
            </li>
            <li>
              <strong>OAuth 2.0 Authentication:</strong> Secure, Meta-approved authentication process that never
              accesses your password
            </li>
            <li>
              <strong>Rate Limiting:</strong> Automatic compliance with Meta's API rate limits to prevent any violations
            </li>
            <li>
              <strong>Regular Security Audits:</strong> Ongoing monitoring and updates to maintain compliance with
              Meta's evolving requirements
            </li>
          </ul>
        </div>

        <h3 className="font-montserrat font-semibold text-lg text-foreground mb-3">User Responsibility and Disclaimer</h3>
        <div className="bg-muted p-6 rounded-lg mb-6">
          <p className="text-foreground leading-relaxed mb-4">
            <strong>PLEASE NOTE:</strong> While ChatAutoDM operates exclusively through official Meta APIs and follows
            all platform guidelines, you acknowledge and agree that:
          </p>
          <ul className="list-disc list-inside text-foreground leading-relaxed space-y-3">
            <li>
              <strong>Account Actions:</strong> You are solely responsible for all actions taken through your Instagram
              account using our automation service, including the content of automated messages, comments, and
              interactions
            </li>
            <li>
              <strong>Meta Policies:</strong> You must ensure your use of ChatAutoDM complies with Instagram's Terms of
              Service, Community Guidelines, and Commerce Policies
            </li>
            <li>
              <strong>Content Responsibility:</strong> You are responsible for the appropriateness, legality, and
              compliance of all messages, responses, and content you configure in our automation workflows
            </li>
            <li>
              <strong>Account Bans or Restrictions:</strong> ChatAutoDM has no control over actions taken by Meta/Instagram. While such issues are rare when using our compliant system, we cannot be held responsible for any account restrictions that result from policy violations or external factors.
            </li>
            <li>
              <strong>Business Losses:</strong> ChatAutoDM cannot be held responsible for indirect or business-related losses that may arise from the use of our services.
            </li>
            <li>
              <strong>Policy Violations:</strong> If you violate Instagram's policies through the content you create or
              the manner in which you use our automation features, you bear full responsibility for any consequences
            </li>
          </ul>
        </div>

        <div className="bg-accent/10 border border-accent/20 p-6 rounded-lg mb-4">
          <h3 className="font-montserrat font-semibold text-lg text-foreground mb-3">Best Practices for Safe Usage:</h3>
          <p className="text-foreground leading-relaxed mb-3">To minimize any risks, we recommend:</p>
          <ul className="list-disc list-inside text-foreground leading-relaxed space-y-2">
            <li>Start with conservative automation settings and gradually increase engagement</li>
            <li>Use natural, conversational language in your automated messages</li>
            <li>Respect user privacy and obtain proper consent for data collection</li>
            <li>Regularly review Instagram's Community Guidelines and Terms of Service</li>
            <li>Monitor your automation performance and adjust settings as needed</li>
            <li>Avoid spam-like behavior, excessive messaging, or aggressive automation tactics</li>
            <li>Ensure all automated content complies with advertising and disclosure requirements</li>
          </ul>
        </div>

        <p className="text-foreground leading-relaxed">
          <strong>From Our End:</strong> ChatAutoDM uses only official, Meta-approved APIs and implements all required
          security measures. Our platform is designed to be safe and compliant. However, the manner in which you use
          the automation features, the content you create, and your overall Instagram account management remain your
          responsibility.
        </p>
      </section>
    </LegalLayout>
  )
}
