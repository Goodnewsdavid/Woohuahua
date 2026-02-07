import { Link } from 'react-router-dom';
import { Shield, Mail, Phone } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-hero">
                <span className="text-lg font-bold text-primary-foreground">W</span>
              </div>
              <span className="font-display text-xl font-bold text-foreground">
                Woo-Huahua Database
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              The UK's trusted microchip database for pet registration and reunification. 
              Keeping pets and families connected.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <div className="compliance-badge">
                <Shield className="h-3.5 w-3.5 text-primary" />
                <span>DEFRA Compliant</span>
              </div>
              <div className="compliance-badge">
                <Shield className="h-3.5 w-3.5 text-secondary" />
                <span>AMBDO Approved</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 font-display text-sm font-semibold text-foreground">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/faq"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 font-display text-sm font-semibold text-foreground">
              Contact
            </h4>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <a href="mailto:support@woo-huahua.co.uk" className="hover:text-primary">
                  support@woo-huahua.co.uk
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <a href="tel:08001234567" className="hover:text-primary">
                  0800 123 4567
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Woo-Huahua Database. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            DEFRA / AMBDO Compliant Pet Microchip Database
          </p>
        </div>
      </div>
    </footer>
  );
}
