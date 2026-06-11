"use client";

import { FormEvent, useState } from "react";

type SubmitState =
  | { status: "idle"; message: "" }
  | { status: "loading"; message: string }
  | { status: "success"; message: string; downloadUrl: string; fileName: string }
  | { status: "error"; message: string };

export default function Home() {
  const [submitState, setSubmitState] = useState<SubmitState>({
    status: "idle",
    message: ""
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState({
      status: "loading",
      message: "Generating the book, PDF, and email payload..."
    });

    const formData = new FormData(event.currentTarget);
    const payload = {
      fullName: String(formData.get("fullName") ?? ""),
      email: String(formData.get("email") ?? ""),
      birthDate: String(formData.get("birthDate") ?? ""),
      birthTime: String(formData.get("birthTime") ?? ""),
      birthPlace: String(formData.get("birthPlace") ?? ""),
      quizAnswers: {
        lifeFocus: String(formData.get("lifeFocus") ?? ""),
        readingTone: String(formData.get("readingTone") ?? ""),
        currentChallenge: String(formData.get("currentChallenge") ?? ""),
        personalIntention: String(formData.get("personalIntention") ?? "")
      }
    };

    try {
      const response = await fetch("/api/generate-book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = (await response.json()) as {
        success: boolean;
        message?: string;
        error?: string;
        downloadUrl?: string;
        fileName?: string;
      };

      if (!response.ok || !result.success) {
        throw new Error(result.error ?? "The generation workflow failed.");
      }

      setSubmitState({
        status: "success",
        message:
          result.message ??
          "Success. The personalized book PDF was generated and the email step completed.",
        downloadUrl: result.downloadUrl ?? "",
        fileName: result.fileName ?? "personalized-book.pdf"
      });
    } catch (error) {
      setSubmitState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong while generating the book."
      });
    }
  }

  const isLoading = submitState.status === "loading";

  return (
    <main className="page">
      <div className="shell">
        <header className="header">
          <p className="eyebrow">MVP Prototype</p>
          <h1>Personalized Book Generator</h1>
          <p className="lede">
            Submit a customer profile to test the complete flow from form input
            through astrology data, Claude content generation, PDF creation, and
            email delivery.
          </p>
        </header>

        <form className="form" onSubmit={handleSubmit}>
          <section className="section">
            <h2>Customer Details</h2>
            <div className="grid">
              <div className="field">
                <label htmlFor="fullName">Full name</label>
                <input id="fullName" name="fullName" required placeholder="Maya Santos" />
              </div>
              <div className="field">
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  name="email"
                  required
                  type="email"
                  placeholder="maya@example.com"
                />
              </div>
              <div className="field">
                <label htmlFor="birthDate">Birth date</label>
                <input id="birthDate" name="birthDate" required type="date" />
              </div>
              <div className="field">
                <label htmlFor="birthTime">Birth time</label>
                <input id="birthTime" name="birthTime" required type="time" />
              </div>
              <div className="field full">
                <label htmlFor="birthPlace">Birth place</label>
                <input
                  id="birthPlace"
                  name="birthPlace"
                  required
                  placeholder="Denver, Colorado, USA"
                />
              </div>
            </div>
          </section>

          <section className="section">
            <h2>Quiz Inputs</h2>
            <div className="grid">
              <div className="field">
                <label htmlFor="lifeFocus">Life focus</label>
                <select id="lifeFocus" name="lifeFocus" required defaultValue="">
                  <option value="" disabled>
                    Choose a focus
                  </option>
                  <option value="Career and calling">Career and calling</option>
                  <option value="Relationships">Relationships</option>
                  <option value="Creativity">Creativity</option>
                  <option value="Healing and self-trust">Healing and self-trust</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="readingTone">Preferred tone</label>
                <select id="readingTone" name="readingTone" required defaultValue="">
                  <option value="" disabled>
                    Choose a tone
                  </option>
                  <option value="Warm and reflective">Warm and reflective</option>
                  <option value="Direct and practical">Direct and practical</option>
                  <option value="Mystical and poetic">Mystical and poetic</option>
                  <option value="Grounded and encouraging">Grounded and encouraging</option>
                </select>
              </div>
              <div className="field full">
                <label htmlFor="currentChallenge">Current challenge</label>
                <textarea
                  id="currentChallenge"
                  name="currentChallenge"
                  required
                  placeholder="What is the customer navigating right now?"
                />
              </div>
              <div className="field full">
                <label htmlFor="personalIntention">Personal intention</label>
                <textarea
                  id="personalIntention"
                  name="personalIntention"
                  required
                  placeholder="What do they want the book to help them remember, practice, or change?"
                />
              </div>
            </div>
          </section>

          <div className="actions">
            <button type="submit" disabled={isLoading}>
              {isLoading ? "Generating..." : "Generate Personalized Book"}
            </button>
            {submitState.message ? (
              <div className="result">
                <p className={`status ${submitState.status}`}>{submitState.message}</p>
                {submitState.status === "success" && submitState.downloadUrl ? (
                  <a
                    className="downloadLink"
                    href={submitState.downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open PDF
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>
        </form>
      </div>
    </main>
  );
}
