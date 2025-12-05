'use client'

import { useState } from 'react';
import Editor, { ContentEditableEvent } from 'react-simple-wysiwyg';

export default function DocViewer({ htmlContent, onChangeHtml } : { htmlContent: string, onChangeHtml?: (html: string) => void }) {
    const [html, setHtml] = useState(htmlContent);

    function onChange(e: ContentEditableEvent) {
        const next = e.target.value;
        setHtml(next);
        onChangeHtml?.(next);
    }

    return (
        <Editor value={html} onChange={onChange} />
    );
}