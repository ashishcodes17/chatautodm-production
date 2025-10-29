import { LegalLayout } from "@/components/legal-layout"

export default function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy Policy">
      <section id="introduction" className="mb-12">
        <h2 className="font-montserrat font-bold text-2xl text-foreground mb-4 border-b-2 border-accent pb-2">
          1. Introduction
        </h2>
        <p className="text-foreground leading-relaxed mb-4">
          At ChatAutoDM, we are committed to protecting your privacy and ensuring the security of your personal
          information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when
          you use our Instagram automation platform.
        </p>
        <p className="text-foreground leading-relaxed mb-4">
          This policy applies to all users of ChatAutoDM, including businesses, creators, entrepreneurs, and agencies
          who use our service to automate Instagram direct message responses and engagement workflows.
        </p>
        <div className="bg-accent/10 border border-accent/20 p-6 rounded-lg">
          <h3 className="font-montserrat font-semibold text-lg text-foreground mb-3">Key Privacy Principles:</h3>
          <ul className="list-disc list-inside text-foreground leading-relaxed space-y-2">
            <li>
              <strong>Transparency:</strong> We clearly explain what data we collect and why
            </li>
            <li>
              <strong>Purpose Limitation:</strong> We only use data for specified, legitimate purposes
            </li>
            <li>
              <strong>Data Minimization:</strong> We collect only the data necessary for our services
            </li>
            <li>
              <strong>Security:</strong> We implement robust security measures to protect your data
            </li>
            <li>
              <strong>User Control:</strong> You have rights and control over your personal information
            </li>
          </ul>
        </div>
      </section>

      <section id="information-collection" className="mb-12">
        <h2 className="font-montserrat font-bold text-2xl text-foreground mb-4 border-b-2 border-accent pb-2">
          2. Information We Collect
        </h2>
        <p className="text-foreground leading-relaxed mb-4">
          We collect several types of information to provide and improve our services:
        </p>

        <h3 className="font-montserrat font-semibold text-lg text-foreground mb-3">Account Information</h3>
        <div className="bg-muted p-6 rounded-lg mb-6">
          <ul className="list-disc list-inside text-foreground leading-relaxed space-y-2">
            <li>
              <strong>Registration Data:</strong> Name, email address, phone number, company information
            </li>
            <li>
              <strong>Authentication Data:</strong> Username, encrypted passwords, security questions
            </li>
            <li>
              <strong>Profile Information:</strong> Profile picture, bio, preferences, and settings
            </li>
            <li>
              <strong>Billing Information:</strong> Payment method details, billing address, transaction history
            </li>
          </ul>
        </div>

        <h3 className="font-montserrat font-semibold text-lg text-foreground mb-3">Instagram Data</h3>
        <div className="bg-muted p-6 rounded-lg mb-6">
          <p className="text-foreground leading-relaxed mb-3">
            When you connect your Instagram account, we access the following data through Instagram's official Graph
            API:
          </p>
          <ul className="list-disc list-inside text-foreground leading-relaxed space-y-2">
            <li>
              <strong>Profile Information:</strong> Username, display name, profile picture, follower count
            </li>
            <li>
              <strong>Content Data:</strong> Posts, stories, comments, and captions for automation purposes
            </li>
            <li>
              <strong>Message Data:</strong> Direct messages to enable automated responses
            </li>
            <li>
              <strong>Engagement Metrics:</strong> Likes, comments, shares, and interaction data
            </li>
            <li>
              <strong>Audience Insights:</strong> Demographic and behavioral data for analytics
            </li>
          </ul>
        </div>

        <h3 className="font-montserrat font-semibold text-lg text-foreground mb-3">Usage and Technical Data</h3>
        <div className="bg-muted p-6 rounded-lg mb-6">
          <ul className="list-disc list-inside text-foreground leading-relaxed space-y-2">
            <li>
              <strong>Service Usage:</strong> Features used, automation settings, campaign performance
            </li>
            <li>
              <strong>Technical Data:</strong> IP address, browser type, device information, operating system
            </li>
            <li>
              <strong>Log Data:</strong> Access times, pages viewed, actions taken, error reports
            </li>
            <li>
              <strong>Performance Data:</strong> Response times, system performance, usage patterns
            </li>
          </ul>
        </div>

        <h3 className="font-montserrat font-semibold text-lg text-foreground mb-3">Customer Data</h3>
        <p className="text-foreground leading-relaxed">
          Through our lead collection features, we may process contact information of your Instagram followers and
          customers, including names, email addresses, phone numbers, and interaction history. You are responsible for
          ensuring you have proper consent to collect and process this data.
        </p>
      </section>

      <section id="how-we-use" className="mb-12">
        <h2 className="font-montserrat font-bold text-2xl text-foreground mb-4 border-b-2 border-accent pb-2">
          3. How We Use Your Information
        </h2>
        <p className="text-foreground leading-relaxed mb-4">
          We use the collected information for the following purposes:
        </p>

        <h3 className="font-montserrat font-semibold text-lg text-foreground mb-3">Service Provision</h3>
        <ul className="list-disc list-inside text-foreground leading-relaxed mb-6 ml-4">
          <li>Provide automated Instagram DM responses and comment-to-DM workflows</li>
          <li>Generate analytics and insights about your audience and engagement</li>
          <li>Collect and organize customer contact information as requested</li>
          <li>Customize automation settings and response templates</li>
          <li>Manage multiple Instagram accounts and campaigns</li>
        </ul>

        <h3 className="font-montserrat font-semibold text-lg text-foreground mb-3">Account Management</h3>
        <ul className="list-disc list-inside text-foreground leading-relaxed mb-6 ml-4">
          <li>Create and maintain your ChatAutoDM account</li>
          <li>Process payments and manage subscriptions</li>
          <li>Provide customer support and technical assistance</li>
          <li>Send important service notifications and updates</li>
          <li>Verify your identity and prevent unauthorized access</li>
        </ul>

        <h3 className="font-montserrat font-semibold text-lg text-foreground mb-3">Service Improvement</h3>
        <ul className="list-disc list-inside text-foreground leading-relaxed mb-6 ml-4">
          <li>Analyze usage patterns to improve our platform</li>
          <li>Develop new features and functionality</li>
          <li>Optimize system performance and reliability</li>
          <li>Conduct research and development activities</li>
          <li>Test new automation algorithms and AI models</li>
        </ul>

        <h3 className="font-montserrat font-semibold text-lg text-foreground mb-3">Legal and Compliance</h3>
        <ul className="list-disc list-inside text-foreground leading-relaxed ml-4">
          <li>Comply with legal obligations and regulatory requirements</li>
          <li>Enforce our Terms of Service and Acceptable Use Policy</li>
          <li>Protect against fraud, abuse, and security threats</li>
          <li>Respond to legal requests and court orders</li>
          <li>Maintain records for audit and compliance purposes</li>
        </ul>
      </section>

      <section id="information-sharing" className="mb-12">
        <h2 className="font-montserrat font-bold text-2xl text-foreground mb-4 border-b-2 border-accent pb-2">
          4. Information Sharing and Disclosure
        </h2>
        <p className="text-foreground leading-relaxed mb-4">
          We do not sell, rent, or trade your personal information to third parties. We may share your information only
          in the following limited circumstances:
        </p>

        <h3 className="font-montserrat font-semibold text-lg text-foreground mb-3">Service Providers</h3>
        <div className="bg-muted p-6 rounded-lg mb-6">
          <p className="text-foreground leading-relaxed mb-3">
            We work with trusted third-party service providers who assist us in operating our platform:
          </p>
          <ul className="list-disc list-inside text-foreground leading-relaxed space-y-2">
            <li>
              <strong>Cloud Infrastructure:</strong> AWS, Google Cloud, or similar providers for hosting and storage
            </li>
            <li>
              <strong>Payment Processing:</strong> Stripe, PayPal, or other payment processors for billing
            </li>
            <li>
              <strong>Analytics Services:</strong> Google Analytics, Mixpanel, or similar for usage analysis
            </li>
            <li>
              <strong>Customer Support:</strong> Zendesk, Intercom, or similar for support ticket management
            </li>
            <li>
              <strong>Email Services:</strong> SendGrid, Mailgun, or similar for transactional emails
            </li>
          </ul>
          <p className="text-foreground leading-relaxed mt-3">
            All service providers are bound by strict confidentiality agreements and are only permitted to use your data
            for the specific services they provide to us.
          </p>
        </div>

        <h3 className="font-montserrat font-semibold text-lg text-foreground mb-3">Legal Requirements</h3>
        <p className="text-foreground leading-relaxed mb-6">
          We may disclose your information if required by law, court order, or government request, or if we believe in
          good faith that such disclosure is necessary to protect our rights, your safety, or the safety of others.
        </p>

        <h3 className="font-montserrat font-semibold text-lg text-foreground mb-3">Business Transfers</h3>
        <p className="text-foreground leading-relaxed mb-6">
          In the event of a merger, acquisition, or sale of all or part of our business, your information may be
          transferred to the acquiring entity, subject to the same privacy protections outlined in this policy.
        </p>

        <h3 className="font-montserrat font-semibold text-lg text-foreground mb-3">Aggregated Data</h3>
        <p className="text-foreground leading-relaxed">
          We may share aggregated, anonymized data that cannot be used to identify you for research, marketing, or
          business development purposes.
        </p>
      </section>

      <section id="data-security" className="mb-12">
        <h2 className="font-montserrat font-bold text-2xl text-foreground mb-4 border-b-2 border-accent pb-2">
          5. Data Security Measures
        </h2>
        <p className="text-foreground leading-relaxed mb-4">
          We implement comprehensive security measures to protect your personal information:
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-muted p-6 rounded-lg">
            <h3 className="font-montserrat font-semibold text-lg text-foreground mb-3">Technical Safeguards</h3>
            <ul className="list-disc list-inside text-foreground leading-relaxed space-y-2">
              <li>256-bit SSL/TLS encryption for data transmission</li>
              <li>AES-256 encryption for data at rest</li>
              <li>Multi-factor authentication for account access</li>
              <li>Regular security audits and penetration testing</li>
              <li>Automated threat detection and monitoring</li>
            </ul>
          </div>

          <div className="bg-muted p-6 rounded-lg">
            <h3 className="font-montserrat font-semibold text-lg text-foreground mb-3">Operational Safeguards</h3>
            <ul className="list-disc list-inside text-foreground leading-relaxed space-y-2">
              <li>Access controls and role-based permissions</li>
              <li>Employee background checks and training</li>
              <li>Incident response and breach notification procedures</li>
              <li>Regular data backups and disaster recovery plans</li>
              <li>Compliance with industry security standards</li>
            </ul>
          </div>
        </div>

        <div className="bg-accent/10 border border-accent/20 p-6 rounded-lg">
          <h3 className="font-montserrat font-semibold text-lg text-foreground mb-3">Security Certifications</h3>
          <p className="text-foreground leading-relaxed mb-3">
            ChatAutoDM maintains the following security certifications and compliance standards:
          </p>
          <ul className="list-disc list-inside text-foreground leading-relaxed space-y-2">
            <li>SOC 2 Type II compliance for security and availability</li>
            <li>GDPR compliance for European data protection</li>
            <li>CCPA compliance for California privacy rights</li>
            <li>ISO 27001 information security management</li>
          </ul>
        </div>
      </section>

      <section id="data-retention" className="mb-12">
        <h2 className="font-montserrat font-bold text-2xl text-foreground mb-4 border-b-2 border-accent pb-2">
          6. Data Retention and Deletion
        </h2>
        <p className="text-foreground leading-relaxed mb-4">
          We retain your personal information only as long as necessary to provide our services and fulfill the purposes
          outlined in this policy:
        </p>

        <div className="bg-muted p-6 rounded-lg mb-6">
          <h3 className="font-montserrat font-semibold text-lg text-foreground mb-3">Retention Periods</h3>
          <ul className="list-disc list-inside text-foreground leading-relaxed space-y-2">
            <li>
              <strong>Account Data:</strong> Retained while your account is active plus 90 days after deletion
            </li>
            <li>
              <strong>Instagram Data:</strong> Retained while connected plus 30 days after disconnection
            </li>
            <li>
              <strong>Usage Logs:</strong> Retained for 12 months for security and analytics purposes
            </li>
            <li>
              <strong>Billing Records:</strong> Retained for 7 years for tax and legal compliance
            </li>
            <li>
              <strong>Support Communications:</strong> Retained for 3 years for quality assurance
            </li>
          </ul>
        </div>

        <h3 className="font-montserrat font-semibold text-lg text-foreground mb-3">Data Deletion Process</h3>
        <p className="text-foreground leading-relaxed mb-4">When you delete your account or request data deletion:</p>
        <ol className="list-decimal list-inside text-foreground leading-relaxed mb-4 ml-4">
          <li>We immediately stop processing your data for service provision</li>
          <li>Your data is marked for deletion and removed from active systems within 30 days</li>
          <li>Backup copies are purged within 90 days of the deletion request</li>
          <li>Some data may be retained longer if required by law or for legitimate business purposes</li>
        </ol>

        <p className="text-foreground leading-relaxed">
          You can request immediate data deletion by contacting our privacy team at privacy@chatautodm.com.
        </p>
      </section>

      <section id="your-rights" className="mb-12">
        <h2 className="font-montserrat font-bold text-2xl text-foreground mb-4 border-b-2 border-accent pb-2">
          7. Your Privacy Rights and Choices
        </h2>
        <p className="text-foreground leading-relaxed mb-4">
          You have several rights regarding your personal information:
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-muted p-6 rounded-lg">
            <h3 className="font-montserrat font-semibold text-lg text-foreground mb-3">Access and Control</h3>
            <ul className="list-disc list-inside text-foreground leading-relaxed space-y-2">
              <li>
                <strong>Access:</strong> Request a copy of your personal data
              </li>
              <li>
                <strong>Correction:</strong> Update or correct inaccurate information
              </li>
              <li>
                <strong>Deletion:</strong> Request deletion of your personal data
              </li>
              <li>
                <strong>Portability:</strong> Export your data in a machine-readable format
              </li>
            </ul>
          </div>

          <div className="bg-muted p-6 rounded-lg">
            <h3 className="font-montserrat font-semibold text-lg text-foreground mb-3">Processing Control</h3>
            <ul className="list-disc list-inside text-foreground leading-relaxed space-y-2">
              <li>
                <strong>Restriction:</strong> Limit how we process your data
              </li>
              <li>
                <strong>Objection:</strong> Object to certain types of processing
              </li>
              <li>
                <strong>Consent Withdrawal:</strong> Withdraw consent for optional processing
              </li>
              <li>
                <strong>Opt-out:</strong> Unsubscribe from marketing communications
              </li>
            </ul>
          </div>
        </div>

        <h3 className="font-montserrat font-semibold text-lg text-foreground mb-3">How to Exercise Your Rights</h3>
        <p className="text-foreground leading-relaxed mb-4">To exercise any of these rights, you can:</p>
        <ul className="list-disc list-inside text-foreground leading-relaxed mb-6 ml-4">
          <li>Use the privacy controls in your account settings</li>
          <li>Contact our privacy team at privacy@chatautodm.com</li>
          <li>Submit a request through our privacy portal</li>
          <li>Contact our customer support team</li>
        </ul>

        <div className="bg-accent/10 border border-accent/20 p-6 rounded-lg">
          <h3 className="font-montserrat font-semibold text-lg text-foreground mb-3">Response Timeline</h3>
          <p className="text-foreground leading-relaxed">
            We will respond to your privacy requests within 30 days (or as required by applicable law). For complex
            requests, we may extend this period by an additional 60 days with notification.
          </p>
        </div>
      </section>

      <section id="cookies" className="mb-12">
        <h2 className="font-montserrat font-bold text-2xl text-foreground mb-4 border-b-2 border-accent pb-2">
          8. Cookies and Tracking Technologies
        </h2>
        <p className="text-foreground leading-relaxed mb-4">
          We use cookies and similar tracking technologies to enhance your experience and analyze usage patterns:
        </p>

        <div className="bg-muted p-6 rounded-lg mb-6">
          <h3 className="font-montserrat font-semibold text-lg text-foreground mb-3">Types of Cookies We Use</h3>
          <ul className="list-disc list-inside text-foreground leading-relaxed space-y-2">
            <li>
              <strong>Essential Cookies:</strong> Required for basic site functionality and security
            </li>
            <li>
              <strong>Performance Cookies:</strong> Help us understand how you use our service
            </li>
            <li>
              <strong>Functional Cookies:</strong> Remember your preferences and settings
            </li>
            <li>
              <strong>Analytics Cookies:</strong> Provide insights into usage patterns and performance
            </li>
          </ul>
        </div>

        <h3 className="font-montserrat font-semibold text-lg text-foreground mb-3">Cookie Management</h3>
        <p className="text-foreground leading-relaxed mb-4">You can control cookies through:</p>
        <ul className="list-disc list-inside text-foreground leading-relaxed mb-6 ml-4">
          <li>Your browser settings to block or delete cookies</li>
          <li>Our cookie preference center in your account settings</li>
          <li>Third-party opt-out tools for analytics and advertising cookies</li>
        </ul>

        <p className="text-foreground leading-relaxed">
          Note that disabling certain cookies may affect the functionality of our service.
        </p>
      </section>

      <section id="third-party" className="mb-12">
        <h2 className="font-montserrat font-bold text-2xl text-foreground mb-4 border-b-2 border-accent pb-2">
          9. Third-Party Services and Integrations
        </h2>
        <p className="text-foreground leading-relaxed mb-4">
          ChatAutoDM integrates with various third-party services to provide our functionality:
        </p>

        <h3 className="font-montserrat font-semibold text-lg text-foreground mb-3">Instagram Graph API</h3>
        <p className="text-foreground leading-relaxed mb-4">
          Our primary integration is with Instagram's official Graph API. This integration is governed by Instagram's
          Data Policy and Terms of Service, which you should review. We only access the minimum data necessary to
          provide our automation services.
        </p>

        <h3 className="font-montserrat font-semibold text-lg text-foreground mb-3">Other Integrations</h3>
        <div className="bg-muted p-6 rounded-lg mb-6">
          <ul className="list-disc list-inside text-foreground leading-relaxed space-y-2">
            <li>
              <strong>CRM Systems:</strong> Salesforce, HubSpot, Pipedrive for lead management
            </li>
            <li>
              <strong>Email Marketing:</strong> Mailchimp, Constant Contact for email campaigns
            </li>
            <li>
              <strong>Analytics Platforms:</strong> Google Analytics, Facebook Analytics for insights
            </li>
            <li>
              <strong>Zapier:</strong> For connecting with hundreds of other business tools
            </li>
          </ul>
        </div>

        <h3 className="font-montserrat font-semibold text-lg text-foreground mb-3">Third-Party Privacy Policies</h3>
        <p className="text-foreground leading-relaxed">
          When you use third-party integrations, their privacy policies also apply. We encourage you to review the
          privacy policies of any third-party services you connect to ChatAutoDM.
        </p>
      </section>

      <section id="international" className="mb-12">
        <h2 className="font-montserrat font-bold text-2xl text-foreground mb-4 border-b-2 border-accent pb-2">
          10. International Data Transfers
        </h2>
        <p className="text-foreground leading-relaxed mb-4">
          ChatAutoDM operates globally and may transfer your personal information to countries other than your own. We
          ensure appropriate safeguards are in place for international transfers:
        </p>

        <div className="bg-muted p-6 rounded-lg mb-6">
          <h3 className="font-montserrat font-semibold text-lg text-foreground mb-3">Transfer Safeguards</h3>
          <ul className="list-disc list-inside text-foreground leading-relaxed space-y-2">
            <li>
              <strong>Adequacy Decisions:</strong> Transfers to countries with adequate data protection laws
            </li>
            <li>
              <strong>Standard Contractual Clauses:</strong> EU-approved contracts for data protection
            </li>
            <li>
              <strong>Binding Corporate Rules:</strong> Internal policies ensuring consistent protection
            </li>
            <li>
              <strong>Certification Programs:</strong> Participation in recognized privacy frameworks
            </li>
          </ul>
        </div>

        <h3 className="font-montserrat font-semibold text-lg text-foreground mb-3">Data Processing Locations</h3>
        <p className="text-foreground leading-relaxed">
          Your data may be processed in the United States, European Union, and other countries where we or our service
          providers operate. We maintain the same level of protection regardless of processing location.
        </p>
      </section>

      <section id="children" className="mb-12">
        <h2 className="font-montserrat font-bold text-2xl text-foreground mb-4 border-b-2 border-accent pb-2">
          11. Children's Privacy Protection
        </h2>
        <p className="text-foreground leading-relaxed mb-4">
          ChatAutoDM is not intended for use by children under the age of 13 (or 16 in the European Union). We do not
          knowingly collect personal information from children under these ages.
        </p>
        <p className="text-foreground leading-relaxed mb-4">
          If you are a parent or guardian and believe your child has provided us with personal information, please
          contact us immediately at privacy@chatautodm.com. We will take steps to remove such information from our
          systems.
        </p>
        <div className="bg-accent/10 border border-accent/20 p-6 rounded-lg">
          <h3 className="font-montserrat font-semibold text-lg text-foreground mb-3">Age Verification</h3>
          <p className="text-foreground leading-relaxed">
            By using ChatAutoDM, you represent that you are at least 18 years old or have reached the age of majority in
            your jurisdiction. Users between 13-18 must have parental consent to use our service.
          </p>
        </div>
      </section>

      <section id="changes" className="mb-12">
        <h2 className="font-montserrat font-bold text-2xl text-foreground mb-4 border-b-2 border-accent pb-2">
          12. Changes to This Privacy Policy
        </h2>
        <p className="text-foreground leading-relaxed mb-4">
          We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal
          requirements, or other factors. We will notify you of material changes through:
        </p>
        <ul className="list-disc list-inside text-foreground leading-relaxed mb-6 ml-4">
          <li>Email notifications to your registered email address</li>
          <li>Prominent notices on our website and within our service</li>
          <li>In-app notifications when you next log in</li>
          <li>Updates to the "Last Updated" date at the top of this policy</li>
        </ul>
        <p className="text-foreground leading-relaxed">
          Your continued use of ChatAutoDM after the effective date of any changes constitutes your acceptance of the
          updated Privacy Policy. If you do not agree with the changes, you should discontinue use of our service.
        </p>
      </section>

      <section id="contact" className="mb-12">
        <h2 className="font-montserrat font-bold text-2xl text-foreground mb-4 border-b-2 border-accent pb-2">
          13. Contact Information and Data Protection Officer
        </h2>
        <p className="text-foreground leading-relaxed mb-4">
          If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please
          contact us:
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-muted p-6 rounded-lg">
            <h3 className="font-montserrat font-semibold text-lg text-foreground mb-3">Privacy Team</h3>
            <ul className="text-foreground leading-relaxed space-y-2">
              <li>
                <strong>Email:</strong> privacy@chatautodm.com
              </li>
              <li>
                <strong>Response Time:</strong> Within 48 hours
              </li>
              <li>
                <strong>Privacy Portal:</strong> privacy.chatautodm.com
              </li>
              <li>
                <strong>Phone:</strong> +1 (555) 123-PRIVACY
              </li>
            </ul>
          </div>

          <div className="bg-muted p-6 rounded-lg">
            <h3 className="font-montserrat font-semibold text-lg text-foreground mb-3">Data Protection Officer</h3>
            <ul className="text-foreground leading-relaxed space-y-2">
              <li>
                <strong>Email:</strong> dpo@chatautodm.com
              </li>
              <li>
                <strong>Mailing Address:</strong>
              </li>
              <li>ChatAutoDM Data Protection Officer</li>
              <li>[Your Business Address]</li>
              <li>[City, State, ZIP Code]</li>
            </ul>
          </div>
        </div>

        <div className="bg-accent/10 border border-accent/20 p-6 rounded-lg mt-6">
          <h3 className="font-montserrat font-semibold text-lg text-foreground mb-3">Regulatory Contacts</h3>
          <p className="text-foreground leading-relaxed mb-3">
            If you are not satisfied with our response to your privacy concerns, you have the right to contact your
            local data protection authority:
          </p>
          <ul className="list-disc list-inside text-foreground leading-relaxed space-y-2">
            <li>
              <strong>EU Residents:</strong> Your local Data Protection Authority
            </li>
            <li>
              <strong>UK Residents:</strong> Information Commissioner's Office (ICO)
            </li>
            <li>
              <strong>California Residents:</strong> California Attorney General's Office
            </li>
            <li>
              <strong>Other Jurisdictions:</strong> Your local privacy regulator
            </li>
          </ul>
        </div>
      </section>
    </LegalLayout>
  )
}
