import { useEffect } from 'react';

interface UseSEOProps {
  title: string;
  description?: string;
}

export function useSEO({ title, description }: UseSEOProps) {
  useEffect(() => {
    // Update title
    const fullTitle = `${title} | FutbolVitrini`;
    document.title = fullTitle;

    // Update meta description if provided
    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', description);
    }
    
    // Return a cleanup function if necessary, but usually static meta tags stay until the next page changes them
  }, [title, description]);
}
