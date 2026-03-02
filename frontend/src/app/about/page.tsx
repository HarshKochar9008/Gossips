export default function AboutPage() {
  return (
    <div className="min-h-[60vh] bg-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-3">
            About Us
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            Learn more about the story behind GOSSIPPS and what we&apos;re building for writers and readers.
          </p>
        </div>

        <div className="space-y-6">
          <section className="card">
            <h2 className="text-xl font-semibold mb-2">Our mission</h2>
            <p className="text-[var(--color-text-secondary)]">
              We created GOSSIPPS to make it easier for anyone to share their ideas, experiences, and expertise with the world.
              From quick thoughts to deep dives, we want your words to find the right audience.
            </p>
          </section>

          <section className="card">
            <h2 className="text-xl font-semibold mb-2">What you can do here</h2>
            <ul className="list-disc list-inside space-y-1 text-[var(--color-text-secondary)]">
              <li>Discover fresh blogs across health, lifestyle, travel, and more</li>
              <li>Follow writers whose voice you love</li>
              <li>Share your own stories and build your audience</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

