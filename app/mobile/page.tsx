'use client'

export default function MobilePage() {
  return (
    <div dangerouslySetInnerHTML={{ __html: `
      <iframe
        src="/mobile.html"
        style="width: 100vw; height: 100vh; border: none; position: fixed; top: 0; left: 0;"
      />
    ` }} />
  )
}