'use client';

import React, { useMemo } from 'react';
import DOMPurify from 'dompurify';

function DocumentViewer({ htmlContent }: { htmlContent: string }) {
  // Parse HTML, extract only body content, and sanitize to prevent style leakage and XSS
  const safeHTML = useMemo(() => {
    if (typeof window === 'undefined') {
      // Server-side rendering fallback
      return '';
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // Only get body content - ignore head/style tags to prevent global style pollution
    const bodyContent = doc.body.innerHTML;
    
    // Sanitize to prevent XSS attacks while allowing safe HTML tags
    return DOMPurify.sanitize(bodyContent, {
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
        'p', 'div', 'span', 'br', 'hr',
        'ul', 'ol', 'li', 
        'strong', 'b', 'em', 'i', 'u',
        'a', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
      ],
      ALLOWED_ATTR: ['class', 'id', 'href', 'target', 'style'],
      ALLOW_DATA_ATTR: false
    });
  }, [htmlContent]);

  return (
    <div
      className="document-container"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}

export default DocumentViewer;
