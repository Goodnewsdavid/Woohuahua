import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Terms() {
  return (
    <Layout>
      <div className="container py-12">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-8 font-display text-4xl font-bold text-foreground">
            Terms of Service
          </h1>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="font-display text-lg">1. Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm text-muted-foreground">
              <p>
                By accessing and using the Woo-Huahua Database ("Service"), you agree to be bound
                by these Terms of Service. If you do not agree to these terms, please do not use
                our Service.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="font-display text-lg">2. Description of Service</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm text-muted-foreground">
              <p>
                Woo-Huahua Database provides a DEFRA and AMBDO compliant microchip registration
                and lookup service for pets in the United Kingdom. Our services include:
              </p>
              <ul className="mt-2 list-disc pl-5">
                <li>Pet microchip registration</li>
                <li>Microchip database searches</li>
                <li>Lost pet reporting and alerts</li>
                <li>Ownership transfer management</li>
                <li>AI-assisted customer support</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="font-display text-lg">3. User Responsibilities</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm text-muted-foreground">
              <p>As a user of our Service, you agree to:</p>
              <ul className="mt-2 list-disc pl-5">
                <li>Provide accurate and complete information</li>
                <li>Keep your account information up to date</li>
                <li>Maintain the security of your account credentials</li>
                <li>Comply with all applicable UK laws and regulations</li>
                <li>Not misuse the Service for fraudulent purposes</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="font-display text-lg">4. Data Protection</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm text-muted-foreground">
              <p>
                We are committed to protecting your personal data in accordance with the UK GDPR
                and Data Protection Act 2018. Please refer to our Privacy Policy for detailed
                information on how we collect, use, and protect your data.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="font-display text-lg">5. Compliance</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm text-muted-foreground">
              <p>
                Our Service operates in compliance with DEFRA (Department for Environment, Food &
                Rural Affairs) and AMBDO (Animal Microchip Board Database Operator) regulations.
                We maintain the standards required for pet microchip databases in the UK.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="font-display text-lg">6. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm text-muted-foreground">
              <p>
                While we strive to provide accurate and reliable services, Woo-Huahua Database
                shall not be liable for any indirect, incidental, or consequential damages
                arising from the use of our Service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">7. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm text-muted-foreground">
              <p>
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <p className="mt-2">
                Email: legal@woo-huahua.co.uk
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
