import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicy() {
  return (
    <Layout>
      <div className="container py-12">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-8 font-display text-4xl font-bold text-foreground">
            Privacy Policy
          </h1>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="font-display text-lg">1. Introduction</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm text-muted-foreground">
              <p>
                Woo-Huahua Database ("we", "our", "us") is committed to protecting your privacy.
                This Privacy Policy explains how we collect, use, and safeguard your personal
                information in compliance with UK GDPR and the Data Protection Act 2018.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="font-display text-lg">2. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm text-muted-foreground">
              <p>We collect the following types of information:</p>
              <ul className="mt-2 list-disc pl-5">
                <li>Personal details (name, address, email, phone number)</li>
                <li>Pet information (microchip number, breed, species, health details)</li>
                <li>Account credentials</li>
                <li>Communication records with our support team</li>
                <li>Usage data and analytics</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="font-display text-lg">3. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm text-muted-foreground">
              <p>We use your information to:</p>
              <ul className="mt-2 list-disc pl-5">
                <li>Maintain the microchip registration database</li>
                <li>Facilitate lost pet reunification</li>
                <li>Process ownership transfers</li>
                <li>Provide customer support</li>
                <li>Comply with DEFRA and AMBDO requirements</li>
                <li>Improve our services</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="font-display text-lg">4. Data Sharing</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm text-muted-foreground">
              <p>
                We may share your information with authorised parties including:
              </p>
              <ul className="mt-2 list-disc pl-5">
                <li>Veterinary practices (for microchip verification)</li>
                <li>Local councils (for dog control purposes)</li>
                <li>Police (for investigations involving animals)</li>
                <li>DEFRA and AMBDO (for regulatory compliance)</li>
                <li>Other registered databases (for cross-database searches)</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="font-display text-lg">5. Your Rights</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm text-muted-foreground">
              <p>Under UK GDPR, you have the right to:</p>
              <ul className="mt-2 list-disc pl-5">
                <li>Access your personal data</li>
                <li>Rectify inaccurate data</li>
                <li>Request erasure of your data (subject to legal requirements)</li>
                <li>Object to data processing</li>
                <li>Data portability</li>
                <li>Lodge a complaint with the ICO</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="font-display text-lg">6. Data Security</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm text-muted-foreground">
              <p>
                We implement appropriate technical and organisational measures to protect your
                personal data, including encryption, access controls, and regular security audits.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="font-display text-lg">7. Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm text-muted-foreground">
              <p>
                We retain your data for as long as necessary to provide our services and comply
                with legal obligations. Pet registration data is retained for the lifetime of
                the pet plus 7 years, as required by DEFRA regulations.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">8. Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm text-muted-foreground">
              <p>
                For privacy-related enquiries or to exercise your rights, contact our Data
                Protection Officer at:
              </p>
              <p className="mt-2">
                Email: dpo@woo-huahua.co.uk
                <br />
                Phone: 0800 123 4567
                <br />
                Address: 123 Pet Lane, London, EC1A 1BB
              </p>
            </CardContent>
          </Card>

          <p className="mt-8 text-sm text-muted-foreground">
            Last updated: January 2024
          </p>
        </div>
      </div>
    </Layout>
  );
}
