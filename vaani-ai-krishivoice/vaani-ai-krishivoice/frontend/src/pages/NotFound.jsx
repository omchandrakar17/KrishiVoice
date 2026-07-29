import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-4">
      <Sprout className="w-12 h-12 text-vaani-primary" />
      <h1 className="text-4xl font-extrabold">404</h1>
      <p className="text-vaani-muted">This field hasn't been planted yet.</p>
      <Link to="/" className="mt-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-vaani-primary to-vaani-accent2 text-white font-medium">
        Back to Home
      </Link>
    </div>
  );
}
