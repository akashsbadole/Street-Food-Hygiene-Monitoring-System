
import React from 'react';

const Footer = () => {
  return (
    <footer className="border-t bg-background">
      <div className="container py-6 flex flex-col md:flex-row items-center justify-between">
        <div className="text-sm text-muted-foreground">
          © 2023 StreetFood Safety Sentinel. All rights reserved.
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <a href="#" className="text-sm text-muted-foreground hover:text-street-orange transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="text-sm text-muted-foreground hover:text-street-orange transition-colors">
            Terms of Service
          </a>
          <a href="#" className="text-sm text-muted-foreground hover:text-street-orange transition-colors">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
