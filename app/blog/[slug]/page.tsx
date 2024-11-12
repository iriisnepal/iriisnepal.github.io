import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { notFound } from 'next/navigation';
import rehypeDocument from 'rehype-document';
import rehypeFormat from 'rehype-format';
import rehypeStringify from 'rehype-stringify';
import rehypeRaw from 'rehype-raw'; 
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import rehypePrettyCode from 'rehype-pretty-code';
import { transformerCopyButton } from '@rehype-pretty/transformers';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import { Metadata } from 'next';

interface Frontmatter {
  title: string;
  description: string;
  author: string;
  date: string;
  url: string;
}




// Generate metadata for each research post
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const filepath = path.join(process.cwd(), 'app/content/blog-content', `${params.slug}.md`);

  if (!fs.existsSync(filepath)) {
    return {
      title: 'Research Not Found | IRIIS'
    };
  }

  const fileContent = fs.readFileSync(filepath, 'utf-8');
  const { data } = matter(fileContent);
  const frontmatter = data as Frontmatter;

  return {
    title: `${frontmatter.title} | Blog`,
    description: frontmatter.description,
    authors: [{ name: frontmatter.author }],
    openGraph: {
      title: frontmatter.title,
      description: frontmatter.description,
      type: 'article',
      authors: [frontmatter.author],
      publishedTime: frontmatter.date,
    },
    twitter: {
      card: 'summary_large_image',
      title: frontmatter.title,
      description: frontmatter.description,
    }
  };
}








export default async function BlogPost({ params }: { params: { slug: string } }) {
  const filepath = path.join(process.cwd(), 'app/content/blog-content', `${params.slug}.md`);
  
  // Check if the file exists, and return a 404 if not
  if (!fs.existsSync(filepath)) {
    console.log('File not found:', filepath);
    notFound();
    return null;
  }

  // Read file content and parse frontmatter with gray-matter
  const fileContent = fs.readFileSync(filepath, 'utf-8');
  const { content, data } = matter(fileContent);
  const frontmatter = data as Frontmatter;

  // Convert markdown to HTML using unified and plugins
  const processor = unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeDocument, { title: frontmatter.title })
    .use(rehypeFormat)
    .use(rehypeStringify)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings)
    .use(rehypePrettyCode, {
      theme: 'github-dark',
      transformers: [
        transformerCopyButton({
          visibility: 'always',
          feedbackDuration: 3000,
        }),
      ],
    });

  // Convert markdown content to HTML
  const htmlContent = (await processor.process(content)).toString();

  return (
    <div className="max-w-5xl mx-auto p-4 pt-40">
      <h1 className="text-4xl font-bold mb-4">{frontmatter.title}</h1>
      <p className="text-xl mb-2 border-l-4 border-gray-500 pl-4 italic">
        {frontmatter.description}
      </p>
      <div className="flex gap-2">
        <p className="text-sm italic">By {frontmatter.author};</p>
        <p className="text-sm mb-4">
          Published Date: {new Date(frontmatter.date).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
        </p>
      </div>
      <div
        className="prose max-w-5xl prose-2xl dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
      <div className='pt-24'>

      </div>
    </div>
  );
}
