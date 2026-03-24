import React from 'react';

export interface Heading {
  level: number;
  text: string;
  id: string;
}

interface TOCSidebarProps {
  headings: Heading[];
}

const TOCSidebar: React.FC<TOCSidebarProps> = ({ headings }) => {
  if (!headings || headings.length === 0) {
    return <aside className="side-toc-container" aria-hidden="true" />;
  }

  return (
    <aside className="side-toc-container">
      <div className="sidebar-widget">
        <h3 className="widget-label-unified">MỤC LỤC</h3>
        <ul className="toc-nav">
          {headings.map((h, i) => (
            <li key={i} className={`toc-item level-${h.level}`}>
              <a href={`#${h.id}`}>{h.text}</a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default TOCSidebar;
