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
    </LegalLayout>
  )
}
