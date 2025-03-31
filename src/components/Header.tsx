
import React from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-street-orange to-street-red bg-clip-text text-transparent">
              StreetFood Safety Sentinel
            </span>
          </Link>
        </div>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <nav className="flex flex-col gap-4 mt-8">
              <Link to="/" className="text-lg font-medium hover:text-street-orange transition-colors">
                Home
              </Link>
              <Link to="/dashboard" className="text-lg font-medium hover:text-street-orange transition-colors">
                Dashboard
              </Link>
              <Link to="/about" className="text-lg font-medium hover:text-street-orange transition-colors">
                About
              </Link>
            </nav>
          </SheetContent>
        </Sheet>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium hover:text-street-orange transition-colors">
            Home
          </Link>
          <Link to="/dashboard" className="text-sm font-medium hover:text-street-orange transition-colors">
            Dashboard
          </Link>
          <Link to="/about" className="text-sm font-medium hover:text-street-orange transition-colors">
            About
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
