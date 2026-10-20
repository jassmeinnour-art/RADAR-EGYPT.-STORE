import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

export const SEO = ({ title, description, image, url }: SEOProps) => {
  useEffect(() => {
    if (title) {
      document.title = title;
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', title);
      const twitterTitle = document.querySelector('meta[name="twitter:title"]');
      if (twitterTitle) twitterTitle.setAttribute('content', title);
    }

    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', description);

      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', description);
    }

    if (image) {
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage) ogImage.setAttribute('content', image);
    }

    if (url) {
      const ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) ogUrl.setAttribute('content', url);
    }
  }, [title, description, image, url]);

  return null;
};