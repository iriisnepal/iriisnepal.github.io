"use client"
import React, { useEffect, useState } from 'react';

interface Heading {
  text: string;
  id: string;
}

interface ResearchPageProps {
  htmlContent: string;
}

const ResearchPage: React.FC<ResearchPageProps> = ({ htmlContent }) => {
  const [headings, setHeadings] = useState<Heading[]>([]);

  useEffect(() => {
    // Parse the HTML content and extract h2 headings
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const h2Elements = tempDiv.querySelectorAll('h2');
    const h2Data = Array.from(h2Elements).map((h2: Element) => ({
      text: h2.textContent || '',
      id: h2.id
    }));
    setHeadings(h2Data);
  }, [htmlContent]);

  return (
    <div className="on-this-page absolute top-24 md:right-20 lg:right-1/4 hidden lg:block pt-50">
      <h2 className="text-md font-bold my-2">On This Page</h2>
      <ul className="text-sm space-y-1">
        {headings.map((heading, index) => (
          <li key={index}>
            <a href={`#${heading.id}`}>{heading.text}</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ResearchPage;