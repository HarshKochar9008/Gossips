export default function ContactPage() {
  return (
    <div className="min-h-[60vh] bg-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-3">
            Contact
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            Have feedback, a question, or an idea for GOSSIPPS? Reach out and we&apos;ll get back to you as soon as we can.
          </p>
        </div>

        <div className="card">
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                type="text"
                className="input-field"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="input-field"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="message">
                Message
              </label>
              <textarea
                id="message"
                className="input-field min-h-[120px] resize-vertical"
                placeholder="Tell us how we can help..."
              />
            </div>
            <button type="submit" className="btn-primary">
              Send message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

